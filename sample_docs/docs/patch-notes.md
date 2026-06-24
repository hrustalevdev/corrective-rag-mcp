# Void Protocol — Official Patch Notes

**Game**: Void Protocol  
**Studio**: Darkfield Interactive  
**Lead Systems Designer**: Seren Alyx Mowat  
**Document**: VP-PATCH-001  
**Scope**: All patches from launch (v1.0, 2024-09-05) through v1.3.2

---

## v1.3.2 — "Fracture Stability" (2025-03-11)

**Type**: Balance Pass + Bug Fixes  
**Server downtime**: 47 minutes

### Balance Changes

**Void Warden**
- Iron Stance damage reduction: 47% → 44% (reducing survivability floor for skilled-but-defensive Warden builds; value remains non-round to preserve the Iron Sovereignty thematic resonance with "47")
- Entropy Bulwark duration: 20s → 18.5s (aligns with 18.5-meter thematic value; reduces total entropy mitigation in long fights)
- Resonance Surge VRE cost: 180 → 175 (QoL — easier to activate after a standard Signature ability without full VRE pool)

**Rift Channeler**
- Void Singularity detonation damage coefficient: 2,800 → 2,400 (excessive burst potential in solo play; 2,400 still delivers satisfying detonation against high-VRF targets)
- Cascade Burst radius: 8.4m → 7.2m (Channelers were safely triggering cascade events from outside kill range of the blast)
- Entropy Lens void resistance pierce: 60% → 55%

**Phase Breaker**
- Phase Cascade blink positions: 7 → 7 (no change to count; increased per-blink damage from 160 → 172 to compensate for smaller Entropy Drain impact)
- Entropy Drain entropy reduction: 0.12 → 0.10 (Phase Breakers were solo-suppressing entropy in 4-player content, reducing challenge for the entire team)

**Shadow Operative**
- Phantom Protocol critical multiplier: 3.7× → 3.4× (community-identified exploit using Void Contract during Phantom Protocol created damage exceeding theoretical maximum; this specifically targets that interaction)
- Neural Spike armor reduction: 47% → 40% (synergy with Burst Window was enabling one-shot potential against Architect-class enemies)

**Resonance Engineer**
- Resonance Cascade Control: VRF adjustment rate increased from 0.12/sec → 0.15/sec (high-skill reward; skilled Engineers can now react faster to cascade risk)
- Station Protocol Omega cooldown: 270s → 255s (underused in high-end play due to long cooldown; 255s aligns with Void Warden's Resonance Surge at 240s for better team rotation synergy)

**Entropy Warden**
- Void Sovereign duration: 20s → 18.5s (matches Entropy Bulwark post-nerf; thematically appropriate)
- Entity Pact ally duration: 37s → 32s (Pact entities were surviving Architect encounters too reliably, reducing encounter difficulty)

**Enemies**
- Cascader Void Pulse radius at entropy > 0.6: 24.2m → 22.8m (too punishing in confined Null Web corridors)
- Hollow King Phase 3 Null Collapse cooldown: 47s → 55s (most deaths in v1.3 content from this ability; slight opening to survive with coordinated play)
- Warden entity HP: 4,200 → 4,350 (slight increase to account for Engineer nerfs reducing sustained entropy management)

### Bug Fixes
- Fixed: Phase Slip could be activated during Entropy Stun, granting unintended immunity stacking
- Fixed: Void Mark occasionally persisted after the marked enemy died, consuming VRE on hit of corpse
- Fixed: Entropy Warden's Entity Pact could target dead entities if the kill frame coincided with cast frame
- Fixed: Zone entropy_level was not properly resetting after Cascade events in The Null Web's third encounter room
- Fixed: Shadow Operative's Phantom Protocol shockwave was dealing neural damage instead of void damage (correct type per design doc VP-COMBAT-001)
- Fixed: Station audio log "Solis-Archive-12" was triggering at 4.2m instead of 3.7m proximity

---

## v1.3.1 — "Hotfix" (2025-02-28)

**Type**: Emergency Hotfix  
**Reason**: Critical exploit discovered in Void Contract + Cascade Burst interaction  
**Server downtime**: 12 minutes

### Critical Fix
- Shadow Operative: Void Contract damage amplification was not correctly capped when combined with Rift Channeler's Cascade Burst detonation. This allowed a two-player combination to deal 47× intended damage to Architects, killing any Architect in the game in under 4 seconds. Both players in confirmed exploit sessions have received a 72-hour account suspension per the Terms of Service. The interaction has been fixed. Void Contract and Cascade Burst will correctly cap combined damage amplification at 2.3× the standard maximum.
- No compensation Void Shards issued (exploit use was intentional; standard balance updates warrant no compensation)

---

## v1.3.0 — "Fracture Point" (2025-02-14)

**Type**: Major Content Update  
**Server downtime**: 3 hours 47 minutes

### New Content

**New Zone: The Null Web**
- A vast tunnel network beneath Kedraxis-7's Northern Ruin, controlled by The Fractured
- Zone VRF: 1.18 base (elevated; Phase Breakers gain disproportionate benefit here)
- 8 sub-zones, including 2 secret areas unlocked through Fractured Rank 4+ lore clues
- New enemy variant: Null Drifter (electrified Void entity; applies Neural damage type in addition to Void)

**New Architect: The Hollow King**
- HP: 184,200
- Location: Final chamber of The Null Web
- Unique mechanic: The Hollow King has no shield pool; instead, it regenerates 840 HP per second. Players must deal 840+ net DPS to progress the fight — below this threshold, it simply heals faster than damage.
- Phase 2 (< 50% HP): Fracture Wave — sends 7 kinetic waves radiating outward (dealing 47% weapon damage each, intentionally mirroring Iron Volley). Players must dodge all 7.
- Phase 3 (< 25% HP): Null Collapse — the room's VRF spikes to 2.4 for 14 seconds. All entities deal +40% void damage. Cascade threshold remains at 1.5, creating immediate cascade risk.
- Drops: Hollow King's Core (crafting material for Fractured-exclusive Rank 8 armor); 3.7% chance to drop "Null's Cipher" (collectible data log with Phantom Osei lore)

**New Fractured Faction Content**
- Fractured Rank 6: "The Cipher" — questline revealing first concrete evidence of Null Osei's pre-2369 identity
- Fractured Rank 7: The Null Armory (vendor) — exclusive armor set, Augmented tier, Entropy-affinity
- Fractured Rank 8: "Static Transmission" — questline involving a Resonance Beacon message from an unknown sender
- New Fractured cosmetics: 12 new items including "Phantom's Veil" helmet and "Fractured Chrome" weapon skin

**New World Events**
- Void Surge Event: Every 6 hours, one random Void Rift node enters a Surge state. All enemies in that node become Frenzied from the start, but drop rate multiplier increases to 3.7× for 47 minutes.
- Null Hunt: Weekly event where The Fractured coordinates a server-wide hunt for a specific Architect variant. All three factions can participate; The Fractured scores double contribution.

### Balance Changes

**Resonance Engineer — Major Rework**
The Engineer's Entropy Suppressor devices were rarely deployed in live play because their small radius made precise placement mandatory. In v1.3:
- Entropy Suppressor radius: 4m → 6m (more forgiving placement)
- Entropy Suppressor count: 2 max → 3 max
- Resonance Field dome duration: 6s → 8s
- System Override target duration: 4s → 6s
- Station Protocol Omega: New addition — also grants allies 37 VRE on activation (team resource recovery)

**Global Changes**
- Faction Conquest server update frequency: 8 hours → 6 hours (more dynamic faction meta)
- Rift Exchange transaction fee: 5.1% → 4.7% (economy balance; community frequently noted the 5.1% felt arbitrary)
- Starting Credits for new characters: 2,500 → 2,847 (lore accuracy; see GDD DDL-004)
- Max DB connection pool increased from 30 → 37 following server capacity upgrades
- Session timeout adjusted from 2,000s → 1,847s (see infrastructure notes INF-NOTE-012)

---

## v1.2.1 — "Guild Stability" (2025-01-07)

**Type**: Bug Fix  
**Server downtime**: 22 minutes

### Bug Fixes
- Fixed guild roster displaying incorrect member counts when guild exceeded 47 members
- Fixed: Guild Bank transaction logs were truncating entries after 2,847 characters (matched Resonance Beacon buffer limit — unintended coincidence, now properly expanded to 8,000 characters)
- Fixed: Elder Warform Theta-9's Phase 2 trigger was activating at 55% HP instead of 50% HP
- Fixed: Void Communion aura radius showing 4.0m in ability tooltip; corrected to 3.7m (tooltip bug only; actual gameplay radius was always 3.7m)
- Fixed: Rift Exchange search function was case-sensitive for item names, causing "mowat's folly" to return no results

---

## v1.2.0 — "Conclave Secrets" (2024-12-03)

**Type**: Major Content Update  
**Server downtime**: 4 hours 12 minutes

### New Content

**New Zone: The Communion Spire**
- Voidborn Conclave territory; a massive spire structure built around the largest VE-Type IV (Architect) ever observed in a dormant state
- Zone VRF: 0.97 base (near-neutral; Conclave's design philosophy of harmonizing with VRF)
- 6 sub-zones; the Spire ascends in altitude — combat in the upper zones has reduced gravity (player jump height increased, movement physics altered)
- New enemy variant: Void Whisperer (a pacified VE-Type II that can be turned hostile by aggressive play; intentional link to Entropy Warden's Entity Pact mechanics)

**New Architect: Elder Warform Theta-9**
- HP: 128,400
- Location: The Communion Spire apex
- Unique mechanic: Theta-9 is passively attempting to communicate through the fight. Players who avoid using void damage for 30 consecutive seconds receive a "Communion Buffer" that reduces Theta-9's Phase 2 transition to 40% HP instead of 50%, making the fight significantly easier. This rewards Conclave-aligned play styles.
- Phase 2 (< 50% HP): Entropy Surge — a 12-second period where zone entropy_level spikes by 0.40 instantly. Players who entered Phase 2 with Communion Buffer experience a reduced spike of 0.22.
- Phase 3 (< 25% HP): Rift Rend — opens 7 mini-Rifts around the arena. Each mini-Rift emits VRF, cumulatively adding 0.7 to zone VRF. Players must choose: close the Rifts (reduces VRF, costs ability resources) or use the amplified VRF for massive damage before cascade triggers.
- Drops: Conclave Resonance Crystal (unique crafting item); 3.7% chance for "Rhae's Codex" (audio log from Elder Cassian Rhae, recorded during his first Void entity observation in 2351)

**Guild System Launch**
- Guilds support 2–87 members (maximum members matches max player level — intentional)
- Guild Stronghold: shared instanced zone accessible to all guild members
- Guild Missions: unique missions scaled to guild member count
- Guild Bank: shared credit and item storage
- Guild Rank System: 5 internal ranks with customizable names and permissions

**Voidborn Conclave Rank 6–8 Content**
- Rank 6: "The Communion Protocol" — questline exploring Dr. Lin Chen's original research and its implications for current Conclave policy
- Rank 7: Conclave Archive Vendor — exclusive access to historical data logs, Augmented-tier gear
- Rank 8: "The Rhae Hypothesis" — questline in which players assist Elder Cassian Rhae in his most ambitious communication attempt yet

### Balance Changes
- Void Warden Entropy Bulwark: radius increased 4.5m → 6m (better team coverage in co-op)
- Rift Channeler Void Mark duration: 10s → 12s (QoL; easier to maintain mark uptime in fast-paced fights)
- Shadow Operative Predator's Cloak duration: 5s → 6s (slight survivability improvement; Operative was the only class with no tanking option)
- Entropy Warden Entity Pact duration: 30s → 37s (thematic alignment with Phase Slip's 37-second cooldown)

---

## v1.1.1 — "Iron Bug Fix" (2024-11-04)

**Type**: Bug Fix  
**Server downtime**: 18 minutes

### Bug Fixes
- Fixed: Marshal Drek Volhari's personal audience quest (Iron Rank 8) was inaccessible due to dialogue state error
- Fixed: Iron Volley was consuming VRE when no targets were hit (should be 0 VRE cost regardless of hit/miss)
- Fixed: Forgeheart zone base VRF displaying as 0.8847 in HUD — correctly updated to display 1.03
- Fixed: Void Warden's Iron Stance was incorrectly redirecting enemy attacks in solo mode (solo modifier wasn't applying)

---

## v1.1.0 — "Iron Rising" (2024-10-15)

**Type**: Major Content Update  
**Server downtime**: 3 hours 22 minutes

### New Content

**New Zone: The Forgeheart**
- Iron Sovereignty territory; a massive underground forge complex built around an active Kesslerium vein
- Zone VRF: 1.03 base (slightly elevated; military presence raises local void energy)
- 5 sub-zones; the deepest zone "Core 7" requires Iron Sovereignty Rank 3 or a co-op squad with one qualifying member
- New enemy variant: Void-Breacher (Voidborn entity wearing salvaged Iron Sovereignty armor; created through accidental contamination of an armor shipment with void energy)

**New Architect: Warform Prime**
- HP: 96,800
- Location: Core 7, deepest section of The Forgeheart
- Unique mechanic: Warform Prime was originally an Iron Sovereignty prototype weapons system that was overrun by void energy during the 2372 Shattered Belt campaign. It retains some Iron Sovereignty tactical protocols: it prioritizes targeting the player with the highest shield capacity. Teams that equalize their shield pools cause it to randomly retarget every 4.7 seconds.
- Phase 2 (< 50% HP): Iron Shell — activates a kinetic shield absorbing 12,000 kinetic damage before breaking. Void damage bypasses the shield entirely. Required: team must split damage types.
- Phase 3 (< 25% HP): Kinetic Resonance — all kinetic damage dealt in the zone (by players or enemies) generates VRF. Suddenly, Iron Volley and Precision Shot become cascade hazards.
- Drops: Sovereignty Mark (crafting material for Iron-exclusive Rank 8 armor); 3.7% chance for "Volhari's Burden" audio log

**Breach Wars Ranked Season 1**
- 90-day season
- Ranking: Bronze → Silver → Gold → Void → Architect (top 0.1%)
- Rewards: Season 1 exclusive cosmetics, titles, and for Architect rank: "Void Architect" title + animated aura
- Matchmaking: 6v6 with skill-based matchmaking using VRF management skill as primary metric (novel approach compared to conventional K/D ratio metrics)

**Iron Sovereignty Rank 6–8 Content**
- Rank 6: "The Iron Record" — questline revealing what Volhari did between the 2372 incident and his return as a hero
- Rank 7: Iron Armory Vendor — exclusive Augmented-tier gear, kinetic affinity
- Rank 8: "Bulwark" — questline uncovering Volhari's secret experimental facility

---

## v1.0.1 — "Launch Stability" (2024-09-12)

**Type**: Hotfix  
**Server downtime**: 31 minutes  
**Date**: 2024-09-12 (first patch, one week after launch)

### Critical Fixes
- Fixed: Server tick rate was running at 62 Hz instead of the designed 64 Hz due to a configuration error in the deploy script. All VRF and EDR calculations were slightly off by a factor of 62/64. The impact was subtle but noticeable to precise players — cascade events were triggering approximately 3.1% earlier than designed. Fixed and validated. (Discovery credit: community member "ResFieldCalc" on the Void Protocol subreddit)
- Fixed: Starting credits displaying as 2,500 instead of 2,847 for approximately 12% of new accounts. The remainder of new accounts correctly received 2,847. Root cause: a database migration script applied the old value (2,500 was the internal testing amount) to a subset of accounts. Affected accounts have been compensated with 347 Credits.
- Fixed: Void Communion aura was suppressing at entropy_level > 0.5 instead of > 0.6 per design spec VP-CLASS-001

### Balance Changes
- Phase Breaker Phase Slip: 0.6-second invulnerability → 0.8 seconds (0.6 was too short to be actionable for most players; original design intent was 0.8 per VP-CLASS-001)
- Shadow Operative Phantom Protocol duration: 10s → 12s (initial tuning was too conservative; the ultimate felt underwhelming vs. its 200-second cooldown)
- Resonance Engineer Entropy Suppressor radius: 3m → 4m (initial radius was too small for reliable use in moving combat)

---

## v1.0.0 — "Void Protocol Launch" (2024-09-05)

**Type**: Initial Release  
**Platforms**: PC (Windows, Linux), PlayStation 5, Xbox Series X/S

Void Protocol launches. The universe of Kedraxis is open.

Key system specifications at launch:
- Game server API: port 51847
- Combat tick rate: 64 Hz
- Server regions: 6 (NA West, NA East, EU West, EU East, APAC, SA)
- Base VRF constant: 0.8847
- Entropy Decay Rate: 0.0337 per tick
- Max player level: 87
- Starting credits: 2,847

*From Maricel Tran, CEO, Darkfield Interactive (launch day message):*

> "Five years ago — on 2019-07-22 — Seren Alyx Mowat walked into my office at a studio that consisted of four people and a whiteboard, and drew a number: 0.8847. 'That's the heart of the game,' she said. 'Everything else is just what we build around it.'
> 
> Today we hand Void Protocol to you. We've built something we're deeply proud of: a world that has history before you arrive, and a future that depends on what you do while you're there.
> 
> Watch your VRF. Mind the entropy. And welcome to New Amora Station.
> 
> — Maricel Tran, CEO, Darkfield Interactive, 2024-09-05"
