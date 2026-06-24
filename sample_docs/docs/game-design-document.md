# Void Protocol — Master Game Design Document

**Document ID**: VP-GDD-001  
**Version**: 3.7.2  
**Studio**: Darkfield Interactive  
**Lead Systems Designer**: Seren Alyx Mowat  
**CEO**: Maricel Tran  
**Studio Founded**: 2019-07-22  
**Game Launch Date**: 2024-09-05  
**Last Updated**: 2025-03-14  
**Status**: Active (Live Service)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Game Overview](#2-game-overview)
3. [Core Pillars](#3-core-pillars)
4. [Setting and Universe](#4-setting-and-universe)
5. [Player Experience Goals](#5-player-experience-goals)
6. [Core Gameplay Loop](#6-core-gameplay-loop)
7. [Progression Systems](#7-progression-systems)
8. [Economy and Monetization](#8-economy-and-monetization)
9. [Technical Architecture Overview](#9-technical-architecture-overview)
10. [Content Roadmap](#10-content-roadmap)
11. [Key Metrics and KPIs](#11-key-metrics-and-kpis)
12. [Appendix: Design Decisions Log](#12-appendix-design-decisions-log)

---

## 1. Executive Summary

Void Protocol is a science-fiction tactical role-playing game set in the year 2387, following the discovery of the **Void Rift** phenomenon — a series of anomalous spatial tears that grant access to an unstable parallel dimension filled with advanced technology and lethal, entropy-corrupted organisms.

The game is developed by Darkfield Interactive (founded 2019-07-22) under the creative direction of CEO Maricel Tran and systems design leadership of Seren Alyx Mowat. Void Protocol launched into Early Access on 2024-09-05 and transitioned to full release on 2024-11-20.

Void Protocol is a **live-service tactical RPG** with a heavy emphasis on:
- Deep, skill-based real-time combat with pausable tactical elements
- A three-faction political meta-game that shapes server-wide narrative events
- A player-driven economy centered on Void Shards and the Rift Exchange
- Modular character builds across six unique classes

The game targets an audience of 25–40-year-old PC and console players who enjoy games like Warframe, Mass Effect, and Divinity: Original Sin 2. Our differentiation lies in the **Void Resonance System** — a physics-based combat mechanic that no competitor has implemented.

---

## 2. Game Overview

### 2.1 Genre and Platform

- **Primary Genre**: Sci-fi Tactical RPG / Action RPG hybrid
- **Secondary Genre**: Live Service with social PvE and faction PvP
- **Platforms**: PC (Windows, Linux), PlayStation 5, Xbox Series X/S
- **Perspective**: Third-person, over-the-shoulder camera with tactical pause
- **Multiplayer**: Co-op 1–4 players; Faction PvP 6v6 and 12v12

### 2.2 Core Identity Statement

> *"In Void Protocol, every decision echoes. The same weapon that saves your squad in the Shattered Belt can tear a hole in local spacetime if you miscalibrate the Void Resonance Factor."*

The game is built around the idea that **power has consequences**. Players wield extraordinary technology, but every ability interacts with the Void Resonance system — a shared resource that fluctuates based on player actions and environmental conditions. Overuse leads to catastrophic Entropy Cascade events that reshape entire mission zones.

### 2.3 Unique Selling Points

1. **Void Resonance System**: A physics-based damage model where the Void Resonance Factor (VRF = 0.8847 base, modified by equipment and environment) determines ability amplification and the risk of triggering cascade events. No competitor has a mechanic of this complexity.

2. **Living Faction Meta**: The three factions — Voidborn Conclave, Iron Sovereignty, and The Fractured — compete in real-time for control of Void Rift nodes. Faction standings update every 6 hours based on player activity across all servers.

3. **Entropy-Adaptive Enemies**: Enemy AI uses the Entropy Decay Rate (EDR = 0.0337 per tick at 64 Hz tick rate) to dynamically scale threat levels. Enemies in high-entropy zones mutate mid-combat, gaining new abilities based on accumulated environmental resonance.

4. **True Build Diversity**: Six character classes, each with 47 ability nodes and 12 passive synergy slots. Theorycrafting community regularly discovers new synergies with each content update.

### 2.4 Scope Summary

| Feature Area | Status |
|---|---|
| Core Combat | Released v1.0 |
| Three Factions | Released v1.0 |
| Six Character Classes | Released v1.0 |
| Void Rift Zones (12 zones) | Released v1.0–v1.3 |
| Faction PvP (Breach Wars) | Released v1.1 |
| Guild System | Released v1.2 |
| Housing / Base of Operations | Planned v2.0 |
| Cross-faction Trading | Planned v2.1 |
| New Class: Timebreaker | Planned v2.2 |

---

## 3. Core Pillars

The entire design of Void Protocol is organized around three non-negotiable design pillars. Every feature, mechanic, and piece of content is evaluated against these pillars.

### Pillar 1: Mastery Through Consequence

Players should feel that their skill matters at every level of play. The difference between a novice and a veteran should be visible not just in damage numbers but in how they manipulate the environment, manage Void Resonance, and react to Entropy Cascades.

**Design implications**:
- No ability should be "press to win." Every powerful ability has a resonance cost, cooldown, or risk of triggering unintended consequences.
- The Void Resonance Factor (VRF) must always be visible to the player and feel meaningful. When VRF spikes above 1.2 in an area, players should feel the danger before the cascade triggers.
- Enemy entropy adaptation means players cannot rely on the same strategy repeatedly. A tactic that worked at 0.0 EDR accumulation will fail at 0.5 EDR accumulation.
- Tutorial systems should teach the *consequences* of misuse before teaching the *power* of abilities.

### Pillar 2: Faction Identity

Players should feel they belong to something larger than their individual squad. Faction choice should feel meaningful from day one and have long-term narrative consequences.

**Design implications**:
- Each faction has a unique aesthetic, playstyle bonus set, and narrative arc.
- Faction standings update every 6 hours server-wide, creating natural social pressure and community events.
- Faction-exclusive gear must be desirable but not mandatory for endgame content. Players who refuse to commit to a faction should remain competitive in PvE, though at a disadvantage in faction PvP.
- Betrayal mechanics (switching factions) carry a 30-day reputation penalty and story consequences that affect dialogue with key NPCs.

### Pillar 3: Deliberate Economy

The in-game economy must feel fair, player-driven, and resistant to exploitation. Void Protocol's monetization must never feel pay-to-win.

**Design implications**:
- All premium currency (Void Shards) can be earned in-game. The exchange rate is fixed at 1 Void Shard = 0.0042 USD equivalent for purchase; the in-game earn rate is designed so a dedicated player can earn ~2,400 Void Shards per month through gameplay.
- Paid cosmetics are purely visual. No premium item provides a stat advantage.
- The Rift Exchange (player-to-player market) is the primary venue for trading gear. The studio takes a 4.7% transaction fee, which funds the lore event prize pool.

---

## 4. Setting and Universe

### 4.1 Historical Timeline

| Year | Event |
|---|---|
| 2187 | Humanity achieves unified planetary governance under the Terran Compact |
| 2241 | First faster-than-light travel achieved using Alcubierre-Kessler drives |
| 2289 | Colonization of Kedraxis-7, humanity's most distant settled system (12.4 light-years from Earth) |
| 2301-06-15 | The First Rift Event: A Void Rift opens spontaneously above Kedraxis-7's third moon, releasing the first Voidborn organisms. This date is referred to in-universe as "the Unraveling." |
| 2312 | Iron Sovereignty faction formed by militarists who believe the Void Rifts must be weaponized |
| 2318 | Voidborn Conclave established by researchers who wish to communicate with Void entities |
| 2335 | The Fractured faction coalesces from refugees and deserters who reject both militarism and research |
| 2341 | New Amora Station constructed in the Shattered Belt as neutral ground for faction negotiations |
| 2387 | Present day — the game begins with players arriving at New Amora Station |

### 4.2 Key Locations

#### New Amora Station
The player's primary hub. New Amora Station is a massive orbital facility in the Shattered Belt, a debris field between Kedraxis-7 and its gas giant neighbor Kedraxis-Prime. The station has a permanent population of 47,000 and serves as the neutral ground for all three factions.

The station was designed by architect Thessa Vorin (now deceased, killed in the Incident of 2381) and is notable for its unusual hexagonal ring structure, which was originally intended to stabilize local Void Resonance readings. The design partially works: baseline VRF on the station is 0.8847, slightly above the galactic average of 0.83 but below the danger threshold of 1.0.

Key areas within New Amora Station:
- **The Concourse**: Main social hub, shops, mission boards
- **The Rift Exchange**: Player economy marketplace
- **Faction Embassies**: Three separate zones, each controlled by a faction
- **The Resonance Chamber**: A restricted area where the station's VRF stabilizer core is housed
- **Docking Ring Delta-7**: Where player ships dock; fast travel origin point

#### Kedraxis-7
The primary inhabited planet. Kedraxis-7 has three continents: Vorak (industrial), Serethal (agricultural), and the Northern Ruin (formerly a research complex, now a high-entropy combat zone). Surface VRF averages 0.91 on Vorak and rises to 1.8+ in the Northern Ruin, making it the most dangerous ground-level zone in the game.

#### The Shattered Belt
An asteroid field that serves as the setting for multiple combat zones and the location of hidden Void Rift nodes. VRF in the belt fluctuates wildly — from 0.6 in the outer belt to 2.4 near active Rift nodes.

#### The Void Rift Dimension
An unstable parallel space accessible through active Void Rifts. Inside Void Rift zones, normal physics are suspended. The EDR doubles to 0.0674 per tick, and all abilities cost 40% more resonance. Loot quality increases significantly, and some items are only obtainable inside active Rifts.

### 4.3 Factions

#### Voidborn Conclave
**Leader**: Elder Cassian Rhae, age 71, former xenobiologist from the University of Kedraxis-7. Rhae believes the Void entities are not enemies but displaced consciousnesses from a parallel civilization that was destroyed when the first Rift tore through their dimension. He advocates for a "Resonance Bridge" — a device that would allow communication with Void entities at a cost of permanently destabilizing local spacetime.

**Faction Bonus Set (on joining)**:
- Ability resonance cost reduced by 8%
- VRF contribution to cascade threshold increased by 0.1 (more tolerance before cascade)
- Bonus 12% XP in Void Rift zones
- Unique ability unlock: *Void Communion* (passive — 3.7-meter aura that slightly calms nearby Void entities, reducing their aggression by 22%)

**Faction Aesthetic**: Purple and silver, organic-curved armor designs, bioluminescent accents. Weapon skins feature flowing void-energy patterns rather than hard mechanical lines.

**Narrative Arc**: Players who reach Conclave Rank 5 unlock the "Cassian's Gambit" questline, which explores whether Rhae's theory is correct — and the catastrophic consequences if he's wrong.

#### Iron Sovereignty
**Leader**: Marshal Drek Volhari, age 54, decorated military veteran and former commander of the Terran Compact's 7th Void Response Fleet. Volhari lost his right arm and two members of his family to a Void entity incursion in 2372. He believes the only solution is total eradication of all Void entities and the permanent sealing of every Void Rift, regardless of the cost to scientific progress.

**Faction Bonus Set (on joining)**:
- Weapon damage increased by 6%
- Shield capacity increased by 340 HP flat
- Critical hit chance increased by 2.3% (total critical multiplier becomes 2.3x base)
- Unique ability unlock: *Iron Volley* (active — fires 7 kinetic rounds simultaneously, each dealing 47% weapon damage; no void resonance cost)

**Faction Aesthetic**: Dark charcoal and gold, angular military armor with visible wear and battle damage. Weapons are heavily reinforced, practical designs with minimal decoration.

**Narrative Arc**: Players who reach Iron Rank 5 uncover evidence that Volhari has been secretly experimenting on captured Void entities in a facility called Bulwark Station — contradicting everything his faction publicly stands for.

#### The Fractured
**Leader**: Phantom "Null" Osei (real name classified, identity obscured through surgical modification). Age unknown. Osei claims to have walked through a Void Rift in 2369 and returned "changed." The Fractured are anarchists who believe both other factions are deceiving the population and that the Void Rifts represent an opportunity for individuals to transcend their biological limitations.

**Faction Bonus Set (on joining)**:
- Movement speed increased by 8%
- Stealth ability duration increased by 40%
- Void Resonance generation from attacks increased by 11%
- Unique ability unlock: *Phase Slip* (active — brief 0.8-second invulnerability window during which the player exists partially in Void space; recharges in 37 seconds)

**Faction Aesthetic**: Chaotic, mismatched armor pieces from all three factions and non-aligned sources, spray-painted with Fractured symbols. Weapons are heavily modified, often visually unstable with visible void energy leaking from cracks.

**Narrative Arc**: Players at Fractured Rank 5 begin to question Null's true motives — specifically whether Osei's "transcendence" experience was genuine or manufactured to manipulate the faction.

### 4.4 Enemy Factions

#### Voidborn Entities
The primary enemy category. Voidborn are organisms from the Void Rift dimension that have been translated into normal space. They are not aggressive by default — they enter an aggressive state when the local VRF exceeds 0.95 or when attacked. In low-VRF environments, observant players can occasionally see Voidborn entities moving without aggression.

Voidborn entity types include:
- **Drifters**: Basic scouts, 840 HP, no shields. Entropy adaptation: gain ranged attack after 0.2 EDR accumulation.
- **Wardens**: Elite guardians, 4,200 HP, 1,100 shield. Entropy adaptation: spawn two Drifters at 0.5 EDR.
- **Cascaders**: Rare, dangerous. 9,800 HP, no shield but 60% damage reduction. Ability: *Void Pulse* (deals 840 void damage in 18.5-meter radius, matching the Void Rift explosion radius). Entropy adaptation: radius increases to 24.2 meters at 0.7 EDR.
- **Rift Architects**: Boss-tier entities. Each Rift Zone has one Architect as its final boss. HP varies by zone (47,000–320,000). Entropy adaptation: unique per Architect.

#### Entropy Pirates
Human adversaries who harvest Void energy for sale on the black market. They use cobbled-together Void-tech weapons and have no loyalty to any faction. In Breach Wars PvP content, Entropy Pirates serve as NPC objectives that both teams compete to eliminate.

---

## 5. Player Experience Goals

### 5.1 First Session Goals (0–60 minutes)

By the end of their first session, a new player should:
1. Understand that Void Resonance is a resource to be managed, not ignored
2. Have chosen their first character class (tutorial guides them through a brief demo of each class's playstyle)
3. Have arrived at New Amora Station and spoken with at least one faction representative
4. Have completed the introductory Void Rift breach (tutorial zone: "The First Unraveling")
5. Feel that the game rewards curiosity — finding a hidden room, a collectible data log, or an optional boss should feel serendipitous

### 5.2 First Week Goals (1–7 days)

By the end of their first week, a player should:
1. Have chosen a faction and understood why that choice matters
2. Reached character level 20 (approximately 30% of max level 87)
3. Completed the main story arc through Chapter 2
4. Participated in at least one Breach Wars PvP event
5. Made their first trade on the Rift Exchange

### 5.3 Endgame Goals (Level 87, post-story)

At endgame, the game must offer:
1. **Architect Raids**: High-difficulty 4-player co-op encounters against Rift Architects. Weekly rotation of 3 Architects from a pool of 12. Top-tier gear only available here.
2. **Breach Wars Ranked**: Competitive 6v6 faction PvP with seasonal rankings and exclusive cosmetics
3. **Faction Conquest**: 12v12 large-scale battles for control of Void Rift nodes; standings update every 6 hours
4. **Theorycrafting Depth**: The ability system should have enough combinations that players continue discovering new builds months after launch
5. **Story Expansion**: Quarterly story updates that advance faction narrative arcs

### 5.4 Onboarding Philosophy

Void Protocol's onboarding is designed around the principle of "**show, then ask**." Before the player is asked to make a choice (class, faction, build), the game shows them a concrete example of what that choice means. The tutorial for the Void Resonance system, for example, begins by showing a pre-scripted cascade event in a cutscene, then immediately puts the player in a controlled environment where they trigger a small cascade themselves — safely — before explaining the VRF number.

Starting resources for new players:
- Starting credits: **2,847** (a deliberately non-round number that players remember and ask about; in-universe it's the exact cost of a one-way docking permit at New Amora Station)
- Starting Void Shards: **0** (Void Shards must be earned or purchased; this is intentional to establish that they are premium)
- Starting equipment: Class-specific starter loadout, worth approximately 1,200 credits if sold

---

## 6. Core Gameplay Loop

### 6.1 Session-Level Loop (per 30–90 minute session)

```
Login → Check Faction Standing → Accept Mission(s) → Deploy to Zone →
Combat Encounters → Collect Loot → Optional: Rift Breach →
Return to Station → Sell/Craft/Trade → Check Faction Events → Logout
```

### 6.2 Combat Loop (per encounter, ~2–8 minutes)

```
Assess enemies → Identify VRF level → Select abilities accordingly →
Manage resonance during fight → Adapt to enemy entropy adaptations →
Secure area → Collect entropy-influenced loot drops
```

### 6.3 Progression Loop (weekly)

```
Complete daily missions (×3/day) → Earn Faction Reputation →
Participate in Breach Wars (PvP) → Earn weekly Architect Raid lockout →
Advance faction standing server-wide → Unlock narrative events →
Receive weekly bonus Void Shard cache
```

### 6.4 Long-Term Loop (monthly/quarterly)

```
Reach new Faction Rank → Unlock lore quests → Experience narrative events →
Seasonal content (new Void Rift nodes, limited-time Architects) →
Quarterly story chapter release → Faction meta-event resolution
```

---

## 7. Progression Systems

### 7.1 Character Level

- Maximum level: **87**
- XP curve: Exponential from levels 1–40, linear from 41–70, reduced gain from 71–87 (endgame grind phase)
- Level milestones at: 10, 20, 30, 40, 50, 60, 70, 80, 87

At each level milestone, players receive a **Resonance Crystal** which can be spent in any of six class ability trees.

### 7.2 Gear System

Gear is rated on a five-tier system:

| Tier | Name | Color | Drop Rate | VRF Bonus Range |
|---|---|---|---|---|
| 1 | Standard | Gray | 60% | +0.00 to +0.02 |
| 2 | Refined | Green | 25% | +0.02 to +0.06 |
| 3 | Augmented | Blue | 10% | +0.06 to +0.12 |
| 4 | Void-Touched | Purple | 4% | +0.12 to +0.22 |
| 5 | Architect-Forged | Gold | 1% | +0.22 to +0.40 |

Gear also carries a **Resonance Affinity** value — one of six affinities matching the six character classes. Equipping gear with a matching affinity provides a 14.7% stat bonus.

**Notable Legendary Item — "Mowat's Folly"** (Architect-Forged, Void-Touched pistol):
Named after Lead Systems Designer Seren Alyx Mowat who accidentally designed this weapon as a "math error" during early development (the weapon's resonance amplification formula was missing a denominator, resulting in 3× intended power). The team decided to keep it as a rare endgame item and name it as an inside joke. Stats: 847 base damage, +0.40 VRF, unique passive: *Resonance Feedback* (every 7th shot triggers a miniature void cascade on the target, dealing 0.8847 × weapon power as void damage in a 3.7-meter radius).

### 7.3 Faction Rank

Each faction has 10 ranks, earned through Faction Reputation points:

| Rank | Name | Rep Required | Notable Unlock |
|---|---|---|---|
| 1 | Initiate | 0 | Faction cosmetic set (basic) |
| 2 | Adept | 500 | Faction-exclusive vendor access |
| 3 | Vanguard | 1,500 | Faction narrative quest (Act 1) |
| 4 | Sentinel | 3,500 | Faction-exclusive weapon skin |
| 5 | Champion | 7,000 | Faction narrative quest (Act 2) — reveals major lore secret |
| 6 | Architect | 12,000 | Access to Faction Council meetings (instanced dialogue scenes) |
| 7 | Warden | 20,000 | Faction-exclusive armor set (Augmented tier) |
| 8 | Elder/Marshal/Phantom | 32,000 | Personal audience with faction leader (unique quest) |
| 9 | Chosen | 50,000 | Faction-exclusive legendary weapon pattern |
| 10 | Paragon | 75,000 | Permanent faction server-wide buff during your active sessions |

### 7.4 Void Mastery

A parallel progression system independent of character level. Void Mastery tracks total Void Resonance generated and managed over a character's lifetime. Every 10,000 accumulated Mastery Points unlocks a passive bonus that applies to all characters on the account.

Void Mastery milestones:
- **10,000**: +5% resonance generation across all abilities
- **25,000**: Unlock additional Resonance Crystal slot (total: 7 equipped at once, up from 6)
- **50,000**: Entropy Decay Rate reduced by 0.0042 per tick (from 0.0337 to 0.0295)
- **100,000**: Access to the "Void Veteran" title and unique aura cosmetic
- **250,000**: Unlock transmutation: can convert any Tier-4 item to a different Tier-4 item (10 Void Shards cost)

---

## 8. Economy and Monetization

### 8.1 Currency Types

| Currency | Acquisition | Usage |
|---|---|---|
| **Credits** | Mission rewards, loot sale, daily login | Crafting materials, basic vendors, station services |
| **Void Shards** | Earned in-game (~2,400/month max), purchased (1 VS = 0.0042 USD) | Cosmetics, premium passes, Transmutation |
| **Faction Rep** | Faction missions, Breach Wars, Conquest | Faction rank, faction-exclusive items |
| **Resonance Crystals** | Level milestones, Architect Raids | Ability tree nodes |
| **Architect Tokens** | Architect Raid completion | Architect-Forged gear pieces |

### 8.2 Premium Pass

The **Void Protocol Season Pass** costs 2,400 Void Shards per season (approximately $10.08 USD at direct purchase rates, though in-game earnings make it free for dedicated players). Each season lasts 90 days.

Season Pass provides:
- 40-tier cosmetic reward track (purely visual items: armor skins, weapon skins, ship skins, emotes)
- Daily Void Shard bonus (+15 Void Shards/day = 1,350 over season)
- Season narrative chapter (unique to pass holders for 30 days, then available to all)
- Season-exclusive title

### 8.3 Rift Exchange

The Rift Exchange is a player-to-player marketplace. All gear, crafting materials, and some cosmetics can be listed and purchased here.

Rules:
- Listing fee: 1% of listing price (minimum 5 Credits)
- Transaction fee: 4.7% (collected by studio; funds lore event prize pools)
- Listings expire after 14 days (returned to seller)
- Void Shards cannot be traded player-to-player (prevents secondary market arbitrage)
- No listing cap per player, but a maximum of 50 active listings simultaneously

### 8.4 Anti-Pay-to-Win Commitments

These commitments are published in the studio's public "Player Pact" document (available on the official website):

1. No stat-advantage item will ever be sold for real money or Void Shards
2. All gameplay-impacting items (gear, ability crystals) are earnable through gameplay alone
3. Season Pass never locks gameplay content — only cosmetics and early access to story chapters
4. If any item is found to provide unintended competitive advantage through purchase, it will be nerfed within 72 hours (with refund of Void Shards spent)

---

## 9. Technical Architecture Overview

### 9.1 Server Infrastructure

- **Game Server API Port**: 51847 (all internal service communication uses this port)
- **Combat Tick Rate**: 64 Hz (all combat calculations, including EDR and VRF updates, run at 64 ticks per second)
- **Session Timeout**: 1,847 seconds of inactivity (approximately 30.8 minutes)
- **Max DB Connections per Server**: 37 (determined by load testing during beta; beyond 37 connections, response time degraded below acceptable threshold)
- **Server Regions**: North America West (primary), North America East, Europe West, Europe East, Asia Pacific, South America

### 9.2 Key Technical Constraints

- VRF calculation runs server-side to prevent exploitation. Client receives VRF updates at 10 Hz (not 64 Hz) to reduce bandwidth.
- EDR accumulation is zone-local (not player-local). All players in a zone share the same EDR value, which creates natural incentives for coordination.
- Faction standings update from a separate microservice that aggregates player actions every 6 hours. This service runs independently of combat servers.
- Rift Exchange listings are stored in a dedicated PostgreSQL cluster with 37-connection max pool, replicated across three availability zones.

### 9.3 Anti-Cheat and Integrity

- Server-authoritative combat: all damage, movement, and ability activations are validated server-side
- VRF values cannot be modified client-side; any client-reported VRF that deviates from server value by more than 0.05 triggers a desync event and rollback
- Position validation runs at 20 Hz with a tolerance of 3.7 meters per second of travel (slightly above maximum player movement speed, which is 3.4 m/s base)

---

## 10. Content Roadmap

### v1.0 — Launch (2024-09-05)
- Core combat system with Void Resonance and Entropy Decay
- Six character classes
- Three factions with Ranks 1–5
- 8 Void Rift zones
- Main story: Prologue + Chapters 1–3
- Breach Wars PvP (6v6)
- Rift Exchange marketplace

### v1.1 — "Iron Rising" (2024-10-15)
- Iron Sovereignty Rank 6–8 content
- New Void Rift zone: The Forgeheart (Iron Sovereignty territory)
- Breach Wars Ranked season 1 launch
- Quality of life: Improved minimap VRF overlay

### v1.2 — "Conclave Secrets" (2024-12-03)
- Voidborn Conclave Rank 6–8 content
- New zone: The Communion Spire
- Guild system launch
- New Architect: Elder Warform Theta-9 (final boss of Communion Spire)

### v1.3 — "Fracture Point" (2025-02-14)
- The Fractured Rank 6–8 content
- New zone: The Null Web (Fractured territory)
- New Architect: The Hollow King
- Cross-faction alliance system (temporary alliances for specific raids)

### v2.0 — "Homeport" (Planned Q3 2025)
- Player housing: Base of Operations customization
- Expanded crafting system
- Faction Ranks 9–10 for all three factions
- Main story: Chapters 4–6
- New class: Timebreaker (teased in v1.3 ending)

---

## 11. Key Metrics and KPIs

### 11.1 Health Metrics (monitored daily)

| Metric | Target | Alert Threshold |
|---|---|---|
| Daily Active Users (DAU) | 180,000 | Below 140,000 |
| Session Length (avg) | 62 minutes | Below 45 minutes |
| D7 Retention | 38% | Below 28% |
| D30 Retention | 22% | Below 15% |
| Season Pass Conversion | 18% of MAU | Below 12% |
| Rift Exchange Daily Volume | 2.4M Credits | Below 1.5M Credits |

### 11.2 Balance Health Metrics (monitored weekly)

| Metric | Target | Designer Owner |
|---|---|---|
| Class pick rate distribution | No class above 25% or below 10% | Seren Alyx Mowat |
| Average VRF-triggered cascade rate | 0.8 cascades per 30-min session | Seren Alyx Mowat |
| Faction standing convergence | No faction above 45% server control | Narrative team |
| Top-tier gear distribution | All 6 Architect items obtainable within 4 weeks | Loot team |

### 11.3 Economy Health Metrics (monitored weekly)

| Metric | Target |
|---|---|
| Void Shard inflation rate | <3% price increase per month on Rift Exchange listings |
| Credit sink vs. source ratio | Within 5% of equilibrium |
| Black market activity | <0.1% of total trades identified as exploit-based |

---

## 12. Appendix: Design Decisions Log

### DDL-001: Why max level 87 instead of 100?
**Date**: 2023-11-07  
**Decided by**: Seren Alyx Mowat, Maricel Tran  
**Decision**: Cap character level at 87 rather than the conventional 100.  
**Rationale**: Level 87 was identified as the point at which the XP curve and content density produce the optimal time-to-endgame of approximately 80–100 hours for dedicated players. A level 100 cap would require either more content or a shallower curve that makes later levels feel insignificant. 87 is also a prime number — we found in playtesting that non-round cap numbers generate more community discussion ("why 87?"), which drives organic social media engagement.

### DDL-002: Why 0.8847 as the base VRF?
**Date**: 2023-12-19  
**Decided by**: Seren Alyx Mowat  
**Decision**: Set base Void Resonance Factor at 0.8847 rather than a round number like 0.9.  
**Rationale**: The VRF value feeds into multiple cascading formulas. A round number like 0.9 made several downstream calculations produce awkward results (e.g., base cascade threshold was an irrational number). 0.8847 was identified through simulation as the value that produces the most stable cascade-to-safe-play ratio while keeping all downstream values at clean 2-decimal precision. The value also became the base damage multiplier for "Mowat's Folly," creating an elegant in-universe explanation.

### DDL-003: Faction leader backstory policy
**Date**: 2024-01-15  
**Decided by**: Narrative team, Maricel Tran  
**Decision**: Each faction leader must have a personal loss or trauma tied to the Void Rifts.  
**Rationale**: Early focus testing showed players engaged significantly more with faction missions when they understood their leader's personal stakes. Leaders who seemed to have purely ideological motivations scored 34% lower on "I care about this faction" surveys than leaders with personal tragedy. This policy was applied retroactively to all three leader backstories.

### DDL-004: Why 2,847 starting credits?
**Date**: 2024-02-28  
**Decided by**: Economy team, Seren Alyx Mowat  
**Decision**: New player starting credits set at exactly 2,847.  
**Rationale**: The amount corresponds precisely to the docking fee at New Amora Station in the game's lore (as established in the lore document NP-LORE-0047). This creates narrative coherence — players start with enough to dock but not enough to immediately buy their way to better gear. The non-round number is intentional: it generates curiosity, and during beta testing, 23% of players looked it up or asked about it in community forums, driving organic wiki creation.

### DDL-005: Session timeout duration
**Date**: 2024-03-12  
**Decided by**: Infrastructure team  
**Decision**: Idle session timeout set at 1,847 seconds.  
**Rationale**: Infrastructure testing showed that 1,800 seconds (30 minutes) caused some players in co-op sessions to get disconnected during natural breaks (bathroom, food). Extending to 2,000 seconds increased orphaned session overhead by 14%. 1,847 was the sweet point that minimized both false disconnections and server load. The number also has an in-universe resonance with the station's design (New Amora Station docking ID: NASD-1847).

### DDL-006: EDR value of 0.0337 per tick
**Date**: 2024-04-01  
**Decided by**: Seren Alyx Mowat  
**Decision**: Entropy Decay Rate set at 0.0337 per tick at 64Hz tick rate.  
**Rationale**: At 64 Hz, an EDR of 0.0337 means maximum entropy accumulation (EDR = 1.0) is reached in approximately 463 seconds (7.7 minutes) of sustained combat in a Void Rift zone. This produces combat sessions that feel increasingly dangerous without ever reaching the maximum quickly enough to punish casual exploration. The value was iterated from an initial design spec of 0.05 (too fast — combat zones felt like racing against a timer) and 0.02 (too slow — entropy felt irrelevant).
