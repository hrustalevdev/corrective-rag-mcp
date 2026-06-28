# Мультиязычный RAG — промпты, domain_summary, поведение агента

## Промпты для мультиязычных запросов

**Проблема:** русский запрос + английские документы → BM25 не находит ничего (лексическое несовпадение). Только векторный поиск работал частично.

**Решение:** `rewriteQuery` и `broadenQuery` теперь явно переводят запрос в английский. `generateAnswer` получает оригинальный запрос (`state.query`) и отвечает на его языке.

```
rewriteQuery: "Return ONLY the rewritten query in English. Do not include any explanation, prefix, or quotes."
generateAnswer: получает state.query (русский оригинал) → отвечает по-русски
```

Защита от «preamble» — модели часто добавляют «Here is the rewritten query:» перед результатом, что уходит в поисковый запрос и ломает поиск. Явный запрет в промпте устраняет проблему.

Промпты вынесены в отдельный файл `src/rag/prompts.ts`.

## domain_summary как сигнал для агента

После индексации сэмплируем 15 случайных чанков (по 300 символов) и запрашиваем у LLM одно предложение о тематике базы. Результат хранится в состоянии индексера и возвращается в `index_status` как поле `domain_summary`.

Расчёт: 15 × 300 символов ≈ ~1125 токенов — комфортно вписывается в `numCtx=8192`.

Случайная выборка важна: первые N чанков могут принадлежать одному файлу и дать нерепрезентативный summary.

Реализация в `src/indexer/summarizer.ts`. Возвращает `''` при ошибке LLM или пустом корпусе (graceful degradation).

## Описания инструментов — ключ к автономному поведению агента

Изначальные описания содержали условность — «if the question relates to it». Это давало агенту лазейку: он мог решить, что вопрос «не относится» к базе, не проверив её содержимое.

**Решение:** явные императивы без условий:
- `index_status` — «Call this FIRST before answering any factual question»
- `ask_question` — «ALWAYS use this tool instead of your own knowledge when indexed_chunks > 0»

### Неудачный пример — описание с условием

```
if the question relates to it, ALWAYS use this tool before answering from your own knowledge.
```

Агент сам решает «не относится» и отвечает из своих знаний.

### Удачный пример — безусловное предписание

```
Call this FIRST before answering any factual question — it returns indexed_chunks (0 = empty)
and domain_summary (what topics are indexed). If indexed_chunks > 0, you MUST use ask_question
to answer the question; do NOT rely on your own knowledge when a knowledge base is available.
```

## Ограничение: Claude Code vs агенты в IDE

В Claude Code MCP-инструменты работают в режиме «deferred» — в контекст загружаются только их имена, без описаний и схем. Агент видит `mcp__corrective-rag__ask_question`, но не знает, зачем и когда его вызывать.

Для Claude Code нужна явная инструкция в `CLAUDE.md`:
```markdown
Before answering any factual question, call `mcp__corrective-rag__index_status` first.
If `indexed_chunks > 0`, use `mcp__corrective-rag__ask_question` instead of answering from your own knowledge.
```

Для сдачи (преподаватель проверяет через Copilot/Claude в IDE) это ограничение не критично — там descriptions работают штатно.
