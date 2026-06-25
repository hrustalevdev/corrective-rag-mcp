import { config } from '../src/config.js';
import { indexFolder } from '../src/indexer/indexer.js';
import { ProgressTracker } from '../src/progress.js';

const folderPath = process.argv[2] ?? 'sample_docs';

async function main(): Promise<void> {
  console.error('[check] Проверяем сервисы...');

  await _checkOllama();
  await _checkChroma();

  console.error(`[check] Сервисы готовы. Индексируем "${folderPath}"...\n`);

  const tracker = new ProgressTracker();
  const result = await indexFolder(folderPath, tracker);

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err: unknown) => {
  console.error(`\n[error] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

// HELPERS

async function _checkOllama(): Promise<void> {
  const res = await fetch(`${config.ollama.baseUrl}/api/tags`).catch(() => null);

  if (!res?.ok) {
    throw new Error(`Ollama недоступен по адресу ${config.ollama.baseUrl}`);
  }

  const { models } = (await res.json()) as { models: Array<{ name: string }> };
  const found = models.some(
    (m) => m.name === config.ollama.embeddingModel || m.name.startsWith(`${config.ollama.embeddingModel}:`),
  );

  if (!found) {
    throw new Error(
      `Модель "${config.ollama.embeddingModel}" не найдена. Запусти: ollama pull ${config.ollama.embeddingModel}`,
    );
  }

  console.error(`[check] Ollama ✓  модель "${config.ollama.embeddingModel}" доступна`);
}

async function _checkChroma(): Promise<void> {
  const res = await fetch(`${config.chroma.url}/api/v2/heartbeat`).catch(() => null);

  if (!res?.ok) {
    throw new Error(`ChromaDB недоступен по адресу ${config.chroma.url}`);
  }

  console.error(`[check] ChromaDB ✓`);
}
