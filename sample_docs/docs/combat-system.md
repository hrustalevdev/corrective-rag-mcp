# Void Protocol — Combat System Design Reference

**Document ID**: VP-COMBAT-001  
**Version**: 2.4.1  
**Author**: Seren Alyx Mowat (Lead Systems Designer)  
**Last Updated**: 2025-01-19  
**Status**: Live (reflects v1.3 combat state)

---

## Overview

This document describes the complete combat system for Void Protocol, including the Void Resonance system, Entropy Decay mechanics, ability framework, damage formulas, and status effects. It is the authoritative reference for all combat-related content decisions.

The combat system runs at **64 Hz** (64 ticks per second). All values described as "per tick" refer to this rate unless otherwise noted.

---

## 1. Void Resonance System

### 1.1 Void Resonance Factor (VRF)

The Void Resonance Factor is the central variable in all combat calculations. VRF represents the density of Void energy at a given location and influences ability power, cascade thresholds, and enemy behavior.

**Base VRF formula:**
```
VRF_local = VRF_zone_base + VRF_player_gear + VRF_environmental_modifiers
```

Where:
- `VRF_zone_base` = 0.8847 (universal constant near Void Rifts; varies by zone)
- `VRF_player_gear` = sum of all equipped gear's VRF bonus values
- `VRF_environmental_modifiers` = EDR-based additions and Cascade event modifiers

**Zone base VRF values:**

| Zone | VRF Base | Notes |
|---|---|---|
| New Amora Station (Concourse) | 0.8847 | Station stabilizer maintains this value |
| New Amora Station (Resonance Chamber) | 1.12 | Restricted access |
| Kedraxis-7 (Vorak continent) | 0.91 | Industrial zone, moderate void presence |
| Kedraxis-7 (Northern Ruin) | 1.80–2.40 | Varies; extremely dangerous |
| Shattered Belt (outer) | 0.62 | Low void activity |
| Shattered Belt (near Rift nodes) | 2.10–2.40 | Near-Rift active nodes |
| Void Rift zones (interior) | 1.47 + EDR accumulation | Starts high, increases with combat |
| The Forgeheart | 1.03 | Iron Sovereignty territory, moderate |
| The Communion Spire | 0.97 | Conclave territory, near-neutral |
| The Null Web | 1.18 | Fractured territory, elevated |

### 1.2 Ability Amplification from VRF

All void-based abilities are amplified by the local VRF at the time of use:

```
damage_final = damage_base × (1 + (VRF_local - 0.8847) × 1.4492)
```

The coefficient **1.4492** is the Void Rift Damage Coefficient (VRDC), derived empirically from gameplay testing. At base VRF (0.8847), the multiplier is 1.0 (no bonus or penalty). At VRF 1.0, damage increases by approximately 16.7%. At VRF 0.7, damage decreases by approximately 26.4%.

**Designer's note (Seren Alyx Mowat, 2024-01-07)**: *"The VRDC of 1.4492 was chosen after 3 months of simulation. Lower values made VRF feel irrelevant; higher values made low-VRF zones feel like punishment. 1.4492 creates a 15-20% damage swing in normal gameplay, which feels meaningful without being frustrating."*

### 1.3 Void Resonance Energy (VRE)

Every player has a Void Resonance Energy pool, separate from their health and shield. VRE fuels void-based abilities.

**Base VRE pool by class:**

| Class | Base VRE | VRE Regen (per sec) |
|---|---|---|
| Void Warden | 180 | 8.4 |
| Rift Channeler | 240 | 12.7 |
| Phase Breaker | 160 | 9.1 |
| Shadow Operative | 120 | 6.3 |
| Resonance Engineer | 200 | 11.2 |
| Entropy Warden | 220 | 10.5 |

VRE generation from combat actions:
- Basic attack: +3.7 VRE per hit
- Ability hit: +1.2 VRE per hit (reduced to prevent chain-generation)
- Killing blow: +14.7 VRE
- Entropy Cascade trigger (accidental): -47 VRE (penalty)

### 1.4 Cascade Events

A **Void Cascade** triggers when the zone's cumulative VRF exceeds the **Cascade Threshold**. The base Cascade Threshold is 1.5. Player abilities and enemy behavior can raise or lower this threshold.

**Cascade Event sequence:**
1. Zone VRF reaches Cascade Threshold
2. 3-second warning period (visual and audio cues, VRF indicator flashes)
3. Cascade pulse: deals `(zone_VRF - 1.0) × 840` void damage to all entities in the zone
4. Zone VRF resets to 0.8847 (base)
5. EDR temporarily increases by 0.0042 per tick for 18.5 seconds post-cascade

The number **840** in the cascade damage formula is the same as the Drifter entity base HP (847 is slightly higher — the formula was calibrated so a cascade event at threshold reliably kills all Drifters but never one-shots Wardens or players with full shields).

**Faction modifiers to Cascade Threshold:**
- Voidborn Conclave: +0.1 (higher tolerance, players generate VRF slower)
- Iron Sovereignty: no modifier to threshold; -0.08 to VRF generation rate
- The Fractured: -0.1 to threshold (cascades trigger easier; The Fractured have mechanics that benefit from cascade events)

---

## 2. Entropy Decay System

### 2.1 Entropy Decay Rate (EDR)

EDR represents the rate at which Void energy is "leaking" into the local environment, accumulating entropy that affects entity behavior and ability strength.

**Base EDR**: 0.0337 per tick at 64 Hz  
**EDR in Void Rift interiors**: 0.0674 per tick (doubled)

EDR accumulates in a zone-local variable `entropy_level` (range: 0.0 to 1.0):
```
entropy_level(t+1) = entropy_level(t) + EDR × combat_active_modifier
```

Where `combat_active_modifier`:
- 0.0 (no combat in zone for 30+ seconds): entropy level decreases at EDR rate
- 1.0 (active combat): normal accumulation
- 1.5 (multiple ability uses per second): accelerated accumulation
- 2.0 (Cascade event active): maximum accumulation

### 2.2 Entropy Effects on Enemies

Entropy Decay causes the zone's enemies to evolve mid-combat. Enemy behavior changes at the following `entropy_level` thresholds:

| Entropy Level | Effect |
|---|---|
| 0.0–0.2 | Baseline behavior |
| 0.2–0.4 | Enemies gain +15% movement speed, attack rate increases 20% |
| 0.4–0.6 | Drifters gain ranged attack; Wardens spawn 1 additional Drifter when below 50% HP |
| 0.6–0.8 | All enemies gain 25% damage reduction; Cascaders' Void Pulse radius expands to 24.2m |
| 0.8–1.0 | Enemy abilities become unpredictable; random additional spawns; Architects gain a unique "Entropy Form" |

### 2.3 Entropy Effects on Players

High entropy levels affect players directly:

| Entropy Level | Player Effect |
|---|---|
| 0.0–0.5 | No player effect |
| 0.5–0.7 | VRE regeneration reduced by 22% |
| 0.7–0.9 | Ability costs increased by 15%; void damage received increased by 10% |
| 0.9–1.0 | Ability costs increased by 30%; all VRE regeneration halted; visual distortion effects |

---

## 3. Damage System

### 3.1 Damage Types

Void Protocol uses four damage types:

| Type | Abbreviation | Resisted by | Amplified by |
|---|---|---|---|
| Kinetic | KIN | Armor | Nothing (baseline) |
| Void | VRF | Void Resistance gear | High local VRF |
| Thermal | THM | Thermal resistance | Heated environment zones |
| Neural | NEU | Neural shielding | High entropy levels |

### 3.2 Shield and Health System

Players have two health pools:

**Shield (SP)**:
- Absorbs all damage types before health
- Base shield by class:
  - Void Warden: 680 SP
  - Rift Channeler: 440 SP
  - Phase Breaker: 520 SP
  - Shadow Operative: 380 SP
  - Resonance Engineer: 560 SP
  - Entropy Warden: 500 SP
- Shield regenerates at **47.3 SP/second** after 4.0 seconds of not taking damage
- Iron Sovereignty joining bonus adds flat **340 SP**

**Health (HP)**:
- Does not regenerate passively
- Base health by class:
  - Void Warden: 1,200 HP
  - Rift Channeler: 800 HP
  - Phase Breaker: 1,000 HP
  - Shadow Operative: 900 HP
  - Resonance Engineer: 1,100 HP
  - Entropy Warden: 950 HP
- Restored via abilities, consumables, or returning to a rest point
- At 0 HP: player enters **Downed State** (can be revived by teammates; solo players have a 47-second self-revive timer)

### 3.3 Damage Calculation

**Standard damage formula:**
```
damage_dealt = (weapon_base_damage + ability_base_damage)
             × damage_type_modifier
             × VRF_amplification
             × critical_hit_modifier
             × (1 - target_resistance)
             - target_armor_flat
```

Where:
- `damage_type_modifier`: depends on damage type and target (default 1.0)
- `VRF_amplification`: see Section 1.2
- `critical_hit_modifier`: 2.3× on critical hit (base; can be modified by abilities and gear)
- `target_resistance`: 0.0 to 0.75 (percentage damage reduction from resistance stats)
- `target_armor_flat`: flat HP reduction before percentage, typically 0–120

### 3.4 Critical Hits

**Base critical hit chance**: 5% (all classes)  
**Critical hit multiplier**: 2.3× (deliberately not 2.0× — the extra 0.3× was added by Seren Alyx Mowat to make critical hits feel "lucky" without making them feel "cheap")

**Critical hit modifiers:**
- Iron Sovereignty joining bonus: +2.3% crit chance
- Rift Channeler passive: +8% crit chance on abilities (not basic attacks)
- Gear: various bonuses, max practical crit chance through gear: ~35%
- Void Warden ultimate ability "Resonance Surge": guaranteed crit for 8.4 seconds

---

## 4. Ability Framework

### 4.1 Ability Categories

Every class has abilities in five categories:

| Category | Count per Class | VRE Cost | Cooldown |
|---|---|---|---|
| Basic Attack | 1 | 0 VRE | None |
| Secondary Ability | 2–3 | 20–40 VRE | 4–12 seconds |
| Tactical Ability | 2 | 40–80 VRE | 15–30 seconds |
| Signature Ability | 1 | 80–120 VRE | 60–90 seconds |
| Ultimate Ability | 1 | 150–200 VRE | 180–300 seconds |

### 4.2 Faction Unique Abilities

In addition to class abilities, faction membership unlocks one additional ability:

**Void Communion** (Voidborn Conclave):
- Type: Passive aura
- Effect: Projects a 3.7-meter radius aura that reduces Void entity aggression by 22% (does not prevent combat if already engaged)
- VRE cost: None (passive)
- Interaction: If zone entropy_level > 0.6, this ability is suppressed

**Iron Volley** (Iron Sovereignty):
- Type: Active ability
- Effect: Fires 7 kinetic rounds simultaneously, each dealing 47% weapon damage
- VRE cost: 0 (kinetic ability, no void energy)
- Cooldown: 12 seconds
- Total damage: 329% weapon damage (7 × 47%)
- Note: The "7 rounds for 47% each" mirrors the VE-Type I Drifter HP of 847 and the in-universe use of the number 47 in Iron Sovereignty iconography

**Phase Slip** (The Fractured):
- Type: Active ability
- Effect: 0.8-second invulnerability window during which the player exists partially in Void space
- VRE cost: 37 VRE
- Cooldown: 37 seconds
- Note: During Phase Slip, the player appears to enemies as a translucent ghost; abilities can be used but cannot be activated or cancelled by player input during the 0.8-second window

### 4.3 Ability Interactions with VRF

Void-based abilities have three VRF interaction modes:

**Mode A — VRF Amplified (most void abilities)**:
- Damage scales with VRF using the VRDC formula (Section 1.2)
- High VRF = more damage, but also contributes more to cascade accumulation

**Mode B — VRF Neutral (kinetic abilities, Iron Volley)**:
- Not affected by VRF at all
- Does not contribute to cascade accumulation
- Iron Sovereignty builds often use these to avoid cascade risk

**Mode C — VRF Harvesting (Fractured class abilities)**:
- Ability cost is paid by harvesting local VRF (reducing zone VRF slightly)
- Creates a unique tactical situation where Fractured players can reduce cascade risk while casting

---

## 5. Enemy Combat AI

### 5.1 AI Behavior States

All enemies use a three-state behavior model:

**State 1: Dormant**
- Default state in low-VRF environments (zone VRF < 0.95)
- Enemy moves slowly through scripted patrol paths
- No attacks; does not pursue the player
- Triggered → Active by: player approaching within 3.7 meters, player using an ability within 18.5 meters, or zone VRF exceeding 0.95

**State 2: Active**
- Standard combat state
- Enemy uses all available abilities
- Pursues players at full movement speed
- Returns to Dormant if no player detected for 20 seconds and zone VRF < 0.95

**State 3: Frenzied (Entropy-Adaptive)**
- Triggered when `entropy_level` exceeds 0.6 in the zone
- All enemies in the zone simultaneously transition to Frenzied
- Movement speed +40%, attack rate +30%, damage +25%
- Does not return to Active until `entropy_level` drops below 0.4

### 5.2 Architect-Class Enemy AI

Rift Architects are fully unique boss entities. Each has a custom AI behavior tree. Shared properties across all Architects:

- Immune to Dormant state (always Active when player is in their zone)
- Entropy adaptation triggers at entropy_level 0.5 (earlier than standard enemies)
- Each has a unique "Entropy Form" that activates above 0.8 entropy_level
- All Architects have exactly three combat phases (HP thresholds at 75%, 50%, 25%)
- All Architects deal void damage as their primary damage type

**Current Architect Roster:**

| Name | Zone | HP | Phase Threshold Abilities |
|---|---|---|---|
| Null-Form Theta | The First Unraveling (tutorial) | 47,000 | Phase 2: Void Shield; Phase 3: Cascade Burst |
| Elder Warform Theta-9 | Communion Spire | 128,400 | Phase 2: Entropy Surge; Phase 3: Rift Rend |
| The Hollow King | The Null Web | 184,200 | Phase 2: Fracture Wave; Phase 3: Null Collapse |
| Warform Prime | The Forgeheart | 96,800 | Phase 2: Iron Shell; Phase 3: Kinetic Resonance |
| The Undivided | Shattered Belt Node 7 | 247,000 | Phase 2: Split Form (spawns 2 copies); Phase 3: Merge Strike |
| Cascade Sovereign | Northern Ruin | 312,000 | Phase 2: Entropy Storm; Phase 3: Ascendant Form |

---

## 6. Status Effects

### 6.1 Standard Status Effects

| Status | Source | Duration | Effect |
|---|---|---|---|
| Void Burn | Void damage over time | 8.4 seconds | 37 void damage per second |
| Entropy Stun | High-entropy cascade | 1.4 seconds | Unable to move or use abilities |
| Resonance Shield | Player ability | Variable | Absorbs next X damage |
| Phase Shift | Phase Breaker ability | 0.8–2.4 seconds | Partial invulnerability |
| Void Marked | Rift Channeler ability | 12 seconds | Target takes 40% more void damage |
| Entropy Slow | Resonance Engineer ability | 6 seconds | Target movement -60%, attack rate -40% |
| Fractured Armor | Neural damage | 10 seconds | Armor reduced by 47% |
| Cascade Resistant | Void Warden ability | 20 seconds | Immune to cascade damage; VRF generation halved |

### 6.2 Status Effect Interactions

Several status effects have notable interactions:

- **Void Burn + Void Marked**: Total void damage from burn increases by 40% (void marked multiplier applies to DoT)
- **Entropy Stun + Fractured Armor**: Both trigger the "broken" state — enemy becomes vulnerable to critical hits for 3.7 seconds
- **Phase Shift + Entropy Stun**: Phase Shift provides immunity to Entropy Stun; the Fractured faction can exploit this to operate freely during cascade events
- **Cascade Resistant + Void Marked**: Conflicting effect — Cascade Resistant wins (player does not take cascade damage, but still receives reduced VRF generation)

---

## 7. Balance Philosophy

From Seren Alyx Mowat's balance design notes (2023-10-12):

> "Void Protocol's combat should never have a 'correct answer.' The Void Resonance system is designed so that every powerful play creates a risk. High VRF = more damage and more cascade risk. Every ability that kills faster also creates more entropy. The best players aren't the ones who maximize damage — they're the ones who know exactly how much damage they can extract before the cascade threshold, and stop at exactly the right moment.
> 
> The Void Resonance Factor base of 0.8847 is not arbitrary. It's below 1.0 — below the danger threshold — to ensure that the default game state is 'safe but fragile.' Players always start on the right side of the danger line. Every build decision, every ability use, every gear choice is about managing the distance between you and 1.0.
> 
> The Entropy Decay Rate of 0.0337 per tick is the heartbeat of combat. At 64 Hz, that's 2.1568 entropy units per second in active combat. Maximum entropy in a Void Rift zone is reached in 463.4 seconds — just under 8 minutes. A well-coordinated 4-player squad managing their resonance can extend this by approximately 40%, giving them 11 minutes of effective combat before entropy forces a withdrawal. That 11-minute window is the design space for every Rift encounter."

### 7.1 Class Balance Targets

- No class should be more than 8% above or below average damage output in a neutral VRF environment
- Rift Channeler should be the highest single-target void damage dealer
- Void Warden should have the highest survivability
- Phase Breaker should have the highest mobility
- Shadow Operative should have the highest burst window (short periods of extreme damage)
- Resonance Engineer should be the best at controlling entropy levels (entropy management specialist)
- Entropy Warden should be the best at managing the cascade threshold (cascade prevention specialist)

### 7.2 Update Policy for Balance Changes

Balance changes follow a strict protocol:
- Simulation testing for 72 hours before any stat change ships
- Changes of >10% to any base stat require Seren Alyx Mowat's sign-off
- Emergency balance hotfixes (for exploits or game-breaking interactions) can ship within 4 hours with Lead Designer approval; standard balance passes ship on Tuesdays
- All balance changes are published in patch notes with precise numerical values (never "slightly increased" — always "increased by 6.2%")
