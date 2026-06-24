# Void Protocol — Character Classes Reference

**Document ID**: VP-CLASS-001  
**Version**: 1.8.3  
**Author**: Seren Alyx Mowat, Class Design Team  
**Last Updated**: 2025-03-01  
**Status**: Live (reflects v1.3)

---

## Overview

Void Protocol features six character classes. Each class has a distinct combat role, ability philosophy, and interaction with the Void Resonance system. Players select their class at character creation; a single account can have up to six characters (one per class).

All classes share the same Void Resonance Factor exposure (VRF is zone-based, not player-based). Classes differ in how they generate and spend Void Resonance Energy (VRE), and in which direction their abilities push the zone's entropy level.

**Base stats apply before gear, faction bonuses, or ability tree nodes.**

---

## Class 1: Void Warden

**Role**: Tank / Frontline Disruptor  
**Faction Affinity**: Iron Sovereignty (first contact), but can join any  
**Origin**: Former Terran Compact military

### Philosophy
The Void Warden is designed for players who want to be in the center of every fight, absorbing damage and disrupting enemies. Wardens generate moderate VRE and prefer to keep the zone's entropy stable — not because they can't handle chaos, but because they're most effective when their teammates can operate freely.

### Base Stats
- HP: 1,200
- Shield: 680 SP (regenerates at 47.3 SP/sec after 4s no-damage)
- VRE: 180 (regeneration: 8.4/sec)
- Movement speed: 3.1 m/s
- Critical hit base: 5%

### Core Abilities

**Basic Attack: Kinetic Pulse**
- Type: Mode B (VRF Neutral)
- Damage: 120 kinetic
- Range: 18 meters
- Effect: A compressed kinetic burst. Hits single target; no splash. Generates +3.7 VRE per hit.

**Secondary 1: Resonance Shield (VRE: 30)**
- Cooldown: 8 seconds
- Effect: Generates a Resonance Shield absorbing up to (200 + VRE_remaining × 0.5) damage for 8.4 seconds
- VRF interaction: Mode A — shield strength scales with local VRF (higher VRF = stronger shield)

**Secondary 2: Void Slam (VRE: 35)**
- Cooldown: 10 seconds
- Effect: Ground slam dealing 280 void damage in 3.7-meter radius. Applies Entropy Stun (1.4 seconds) to all targets hit.
- VRF interaction: Mode A — damage scales with VRF

**Tactical 1: Void Anchor (VRE: 60)**
- Cooldown: 22 seconds
- Effect: Plants a resonance anchor at current position. For 12 seconds, all void damage dealt by the Warden is increased by 22% and all incoming Cascade damage is redirected to the anchor (anchor absorbs up to 1,200 void damage before breaking)
- VRF interaction: Mode A

**Tactical 2: Iron Stance (VRE: 40)**
- Cooldown: 15 seconds
- Effect: Activates a combat stance for 8 seconds. During this time: movement speed reduced to 1.4 m/s, but incoming damage reduced by 47%, and all enemy attacks targeting an ally within 3.7 meters are redirected to the Warden (co-op only; solo: reduced incoming damage applies to the Warden alone)
- VRF interaction: Mode B (kinetic-origin ability, no VRF scaling)

**Signature: Entropy Bulwark (VRE: 100)**
- Cooldown: 75 seconds
- Effect: Creates a 6-meter sphere around the Warden that reduces zone EDR accumulation by 80% for 20 seconds. All allies inside the sphere receive +340 shield (matching Iron Sovereignty faction bonus). Enemies inside the sphere have their Frenzied state suppressed.
- Note: This is the ability Seren Alyx Mowat calls "the team anchor" — in co-op play, proper Entropy Bulwark timing is the most impactful thing a Warden can do

**Ultimate: Resonance Surge (VRE: 180)**
- Cooldown: 240 seconds
- Effect: For 8.4 seconds, all of the Warden's attacks are guaranteed critical hits (2.3× multiplier), deal 40% more void damage, and each hit reduces the zone's entropy_level by 0.0042. The Warden is immune to Entropy Stun during this window.
- VRF interaction: Mode A — void damage bonus scales with VRF
- Visual: The Warden becomes surrounded by a crackling void-energy aura visible to all players in the zone

### Ability Tree Highlights
The Warden tree has 47 nodes total. Notable endgame nodes:
- **Void Fortress** (Node 38): Resonance Shield can now be cast on allies (co-op; 12-meter range)
- **Cascade Harvester** (Node 42): When zone VRF would trigger a Cascade, the Warden absorbs 40% of the cascade energy as shield HP instead
- **Iron Will** (Node 47, final): Downed State timer extended from 47 to 94 seconds; upon revive, gain a 3.7-second window of 0 incoming damage

---

## Class 2: Rift Channeler

**Role**: DPS / Void Energy Specialist  
**Faction Affinity**: Voidborn Conclave (first contact)  
**Origin**: Conclave-affiliated researcher who survived a Rift immersion accident

### Philosophy
The Rift Channeler is the highest single-target void damage dealer in the game. They achieve this by accepting a high personal VRE cost and learning to operate effectively at elevated VRF levels. Skilled Channelers push the zone's VRF deliberately — close to but not past the Cascade Threshold — to maximize the VRDC amplification on their abilities.

### Base Stats
- HP: 800
- Shield: 440 SP
- VRE: 240 (regeneration: 12.7/sec)
- Movement speed: 3.2 m/s
- Critical hit base: 5% (passive adds +8% crit on abilities only)

### Core Abilities

**Basic Attack: Void Lance**
- Type: Mode A (VRF Amplified)
- Damage: 85 void
- Range: 30 meters
- Effect: Long-range precision bolt. 15% chance to apply Void Burn (8.4 seconds, 37 void damage/sec).

**Secondary 1: Void Mark (VRE: 25)**
- Cooldown: 6 seconds
- Effect: Marks target for 12 seconds. Marked target takes 40% increased void damage from all sources. Does not deal direct damage.
- Note: The core of Channeler DPS rotation — Mark, then use high-damage abilities on the marked target

**Secondary 2: Rift Spike (VRE: 35)**
- Cooldown: 8 seconds
- Effect: Fires a high-velocity void spike dealing 340 void damage. If target is Void Marked: deals additional 180 void damage and Void Mark duration refreshes.
- VRF interaction: Mode A (scales with VRDC formula)

**Tactical 1: Entropy Lens (VRE: 65)**
- Cooldown: 25 seconds
- Effect: Creates a 3.7-second window where all Channeler ability damage ignores 60% of target void resistance. Does not affect kinetic or thermal damage types.
- VRF interaction: Mode A

**Tactical 2: Resonance Overcharge (VRE: 50)**
- Cooldown: 18 seconds
- Effect: Temporarily increases the Channeler's personal VRF contribution by 0.12 for 14 seconds, effectively boosting all VRF-amplified damage by approximately 17.4% (using VRDC coefficient 1.4492). Side effect: increases zone EDR by 0.0042 per tick during this window.
- Risk/reward: Powerful but pushes zone entropy faster

**Signature: Cascade Burst (VRE: 110)**
- Cooldown: 80 seconds
- Effect: Triggers a controlled miniature cascade event. Deals `(current VRF - 0.8847) × 1,400` void damage to all enemies in 8.4-meter radius. If zone entropy_level > 0.6, damage is doubled. Resets zone VRF to 0.8847 after detonation.
- Note: This ability deliberately triggers a small cascade — which is why Channelers have low HP. They need to be clear of the blast radius.

**Ultimate: Void Singularity (VRE: 200)**
- Cooldown: 280 seconds
- Effect: Creates a void singularity at target location (range 24 meters). For 12.7 seconds, the singularity: pulls all enemies within 14 meters toward its center at 2.4 m/s; deals 180 void damage per second to all entities within 6 meters; increases zone VRF by 0.22 (significant cascade risk); upon expiration, detonates for `VRF_at_expiration × 2,800` void damage in 18.5-meter radius. If zone VRF at expiration exceeds 1.5, triggers a major Cascade Event in addition to the detonation.
- Risk: This ability can kill the Channeler's own team if used carelessly

---

## Class 3: Phase Breaker

**Role**: Mobility / Disruption / Skirmisher  
**Faction Affinity**: The Fractured (first contact)  
**Origin**: Fractured defector with illegal void-tech modifications

### Philosophy
The Phase Breaker is designed for players who want to be unpredictable. They have moderate damage but extreme mobility, and their abilities interact with the VRF system in a unique way — Mode C (VRF Harvesting). Phase Breakers can actually reduce zone VRF by using abilities, making them valuable in high-entropy situations despite their disruptive reputation.

### Base Stats
- HP: 1,000
- Shield: 520 SP
- VRE: 160 (regeneration: 9.1/sec)
- Movement speed: 3.4 m/s (highest in class — matches server position validation tolerance of 3.4 m/s)
- Critical hit base: 5%

### Core Abilities

**Basic Attack: Phase Shot**
- Type: Mode C (VRF Harvesting)
- Damage: 110 void + 40 kinetic (split damage type)
- Range: 22 meters
- Effect: Each Phase Shot harvests 0.0042 VRF from the zone. Over an extended fight, a Phase Breaker's basic attacks measurably reduce cascade risk.

**Secondary 1: Blink Strike (VRE: 28)**
- Cooldown: 6 seconds
- Effect: Teleports the Phase Breaker up to 12 meters in any direction, dealing 200 void damage to any enemy within 1.5 meters of the arrival point. The teleport triggers a Phase Shift (0.8 seconds of partial invulnerability at arrival point).
- VRF interaction: Mode C (harvests VRF equal to 0.0042 per use)

**Secondary 2: Phase Grenade (VRE: 32)**
- Cooldown: 10 seconds
- Effect: Throws a grenade that detonates after 1.4 seconds or on impact. Explosion: 180 void damage in 6-meter radius; applies Entropy Slow to all hit targets (6 seconds, -60% movement, -40% attack rate). Harvests 0.0084 VRF from zone on detonation.

**Tactical 1: Void Step (VRE: 55)**
- Cooldown: 20 seconds
- Effect: Enters a stealth-adjacent state for 8 seconds. While active: the Phase Breaker moves at 4.8 m/s (above server validation threshold — compensated for on server side); enemy threat level for the Breaker drops to zero (they lose aggro unless attacked); all abilities used during Void Step cost 40% less VRE.
- Note: This is the Stealth state; Fractured faction bonus extends it by 40% (to 11.2 seconds)

**Tactical 2: Entropy Drain (VRE: 65)**
- Cooldown: 28 seconds
- Effect: Targets a single enemy or the zone center. Drains entropy_level by 0.12 over 4 seconds. For each 0.01 entropy drained, the Phase Breaker regenerates 4 VRE. Net VRE income if full drain completes: 48 VRE (partially offsetting cost). Enemy targeted also receives 240 void damage.

**Signature: Phase Cascade (VRE: 90)**
- Cooldown: 70 seconds
- Effect: The Phase Breaker rapidly blinks between 7 random positions within 18.5-meter radius, dealing 160 void damage at each position (total: 1,120 void damage if all 7 positions hit at least one enemy). Each blink harvests 0.0042 VRF. After all 7 blinks complete, Phase Slip activates automatically (regardless of its cooldown status).

**Ultimate: Fracture Point (VRE: 160)**
- Cooldown: 220 seconds
- Effect: Shatters local spacetime for 14 seconds. All enemies in a 24-meter radius are pulled into a partial Phase dimension: they cannot attack or use abilities for 4 seconds (initial stun), then are released into a confused state (random movement, 60% of normal attack rate) for the remaining 10 seconds. The Phase Breaker deals +47% damage to enemies in the Phase dimension. Zone VRF is harvested at 0.0337 per second during Fracture Point (matching the EDR rate — effectively neutralizing entropy gain during the ultimate's duration).
- Lore connection: The ability is named after the v1.3 content patch "Fracture Point"

---

## Class 4: Shadow Operative

**Role**: Burst DPS / Infiltrator  
**Faction Affinity**: Neutral (approached by all three factions simultaneously at intro)  
**Origin**: Corporate mercenary, no faction history

### Philosophy
The Shadow Operative is a burst damage specialist with the highest single-window damage output of any class, at the cost of sustained damage and survivability. Operatives have the lowest base HP and shield values, compensated by high mobility and a kit designed to eliminate single targets quickly.

### Base Stats
- HP: 900
- Shield: 380 SP
- VRE: 120 (regeneration: 6.3/sec — lowest in class)
- Movement speed: 3.3 m/s
- Critical hit base: 5% (burst window mechanics push effective crit much higher)

### Core Abilities

**Basic Attack: Precision Shot**
- Type: Mode A (VRF Amplified)
- Damage: 140 kinetic (with 30% of damage converting to void if VRF > 1.0)
- Range: 35 meters (longest basic attack range in class)
- Effect: High single-target damage, no splash. At VRF 0.8847, pure kinetic. As VRF rises, increasing portion converts to void damage.

**Secondary 1: Shadow Mark (VRE: 20)**
- Cooldown: 5 seconds
- Effect: Marks target for 8 seconds. While target is Shadow Marked: the Operative's basic attacks deal +80% damage against that target; critical hits against the marked target deal 2.76× (normal 2.3× + 0.46× from shadow amplification).

**Secondary 2: Neural Spike (VRE: 30)**
- Cooldown: 9 seconds
- Effect: Fires a neural disruption dart dealing 180 neural damage. Applies Fractured Armor (reduces armor by 47% for 10 seconds). High-value opener against armored targets.

**Tactical 1: Predator's Cloak (VRE: 45)**
- Cooldown: 18 seconds
- Effect: Full stealth for 6 seconds or until next attack. First attack from stealth: +120% damage, guaranteed critical hit (2.3× from crit × additional 120% = effectively 5.06× damage multiplier on the burst opener). Breaking stealth by attacking resets Shadow Mark's cooldown.

**Tactical 2: Burst Window (VRE: 60)**
- Cooldown: 25 seconds
- Effect: Activates a 7-second burst window where all ability cooldowns are halved and VRE costs reduced by 30%. Maximum DPS is achievable only during this window combined with Shadow Mark and Predator's Cloak opener.

**Signature: Void Contract (VRE: 95)**
- Cooldown: 68 seconds
- Effect: Selects a single target as a "Contract." For 20 seconds, the Operative deals +60% all damage to the Contract target. If the Contract target dies within 20 seconds (by any source, not just the Operative), the Operative regains 80 VRE and Void Contract's cooldown resets to 20 seconds (allowing immediate re-cast on a new target). If the target survives: cooldown proceeds normally, no VRE refund.

**Ultimate: Phantom Protocol (VRE: 150)**
- Cooldown: 200 seconds
- Effect: The Operative enters a 12-second assassination mode. During this time: permanent stealth (cannot be detected by enemies regardless of action); movement speed increases to 5.1 m/s; all attacks deal +100% damage; critical hit multiplier increases to 3.7× (the 3.7 appears again — in-universe, corporate contracts specify exactly 3.7× payment bonus for targets eliminated in Phantom Protocol). At the end of 12 seconds, the Operative automatically emerges from stealth with a shockwave (200 void damage in 3.7-meter radius).

---

## Class 5: Resonance Engineer

**Role**: Support / Entropy Management  
**Faction Affinity**: Neutral (station-side; works with station engineering teams)  
**Origin**: New Amora Station technician who worked on VRF systems

### Philosophy
The Resonance Engineer is the most technically complex class to play effectively. Their primary role is managing the zone's entropy level — keeping it in the "sweet spot" where teammates are buffed by moderate entropy effects while preventing Frenzied enemy states. In co-op, a skilled Engineer extends the effective combat window by an estimated 40% (from ~7 minutes to ~11 minutes in a Void Rift zone).

### Base Stats
- HP: 1,100
- Shield: 560 SP
- VRE: 200 (regeneration: 11.2/sec)
- Movement speed: 2.9 m/s (lowest in class)
- Critical hit base: 5%

### Core Abilities

**Basic Attack: Resonance Beam**
- Type: Mode A (VRF Amplified)
- Damage: 75 void
- Range: 20 meters
- Unique property: Continuously calibrates zone VRF while active. Each second of sustained beam reduces zone entropy_level by 0.0042 (passively, without VRE cost). This is the lowest damage basic attack but the most entropy-efficient.

**Secondary 1: Entropy Suppressor (VRE: 30)**
- Cooldown: 8 seconds
- Effect: Deploys a stationary device at target location (range 15 meters). Device reduces entropy accumulation in a 6-meter radius by 50% for 12 seconds. Up to 3 Suppressors can be active simultaneously.

**Secondary 2: Resonance Field (VRE: 40)**
- Cooldown: 12 seconds
- Effect: Creates a 4-meter shield dome at a target location for 8 seconds. Allies inside take 40% less void damage. Zone EDR accumulation is reduced by 0.0337 per tick inside the dome (exactly offsetting normal EDR accumulation — creating a "safe zone" of stable entropy).

**Tactical 1: Void Calibration (VRE: 55)**
- Cooldown: 20 seconds
- Effect: Instantly reduces zone entropy_level by 0.18 and resets all Entropy Suppressor device cooldowns to 0 (allowing immediate redeployment). The entropy_level reduction can prevent or delay Frenzied state transitions. Void Calibration is the closest thing to a "panic button" in the Engineer's kit.

**Tactical 2: System Override (VRE: 65)**
- Cooldown: 30 seconds
- Effect: Targets a single enemy. For 6 seconds, the target's abilities are disabled, its movement speed is reduced by 60%, and it generates 0 entropy (its personal contribution to EDR). Useful for isolating Architects during phase transitions.

**Signature: Resonance Cascade Control (VRE: 100)**
- Cooldown: 75 seconds
- Effect: For 18.5 seconds, the Engineer gains direct control over the zone's VRF. Can push VRF up or down by up to 0.12 per second (using left/right inputs). Team damage scales with VRF as normal, but cascade threshold is temporarily raised to 2.0 (from 1.5) for the duration. This allows the Engineer to safely maximize team damage by pushing VRF to exactly 1.999 without triggering a cascade.
- Note: Considered the highest-skill-ceiling ability in the game by the community

**Ultimate: Station Protocol Omega (VRE: 190)**
- Cooldown: 270 seconds
- Effect: Activates a massive resonance calibration pulse. Immediately resets zone entropy_level to 0.0. Zone VRF is fixed at 0.8847 (the New Amora Station constant) for 37 seconds. During this window: no entropy accumulates, no cascades can trigger, and all enemies revert to Dormant state (if they were in Active or Frenzied). The Engineer and all allies receive a 20-second shield of 840 HP (matching base Cascade damage formula).
- Lore: This ability replicates the function of New Amora Station's VRF stabilizer at field scale. Chief Engineer Malo Fenn designed the ability parameters.

---

## Class 6: Entropy Warden

**Role**: Adaptive DPS / Battlefield Controller  
**Faction Affinity**: Voidborn Conclave (first contact)  
**Origin**: Void entity researcher who believes coexistence is possible

### Philosophy
The Entropy Warden is the most unique class conceptually: they gain power from high entropy rather than fighting it. Their abilities become stronger as zone entropy_level rises, and they can use void entities as temporary allies. The Entropy Warden is designed for players who want a high-risk, high-reward experience — they're weakest when the zone is stable and most powerful when everyone else is struggling.

### Base Stats
- HP: 950
- Shield: 500 SP
- VRE: 220 (regeneration: 10.5/sec)
- Movement speed: 3.0 m/s
- Critical hit base: 5%

### Core Abilities

**Basic Attack: Entropy Pulse**
- Type: Mode A (VRF Amplified) with entropy scaling
- Base damage: 95 void
- Entropy modifier: damage × (1 + entropy_level × 0.8847) — at maximum entropy (1.0), deals 95 × 1.8847 = 179 void damage
- Range: 24 meters

**Secondary 1: Void Communion Bolt (VRE: 25)**
- Cooldown: 7 seconds
- Effect: Fires a bolt that deals 150 void damage to enemies and 0 damage to Voidborn entities. If the bolt hits a VE-Type I or VE-Type II entity, that entity is temporarily pacified for 14 seconds (does not attack anyone for duration). At entropy_level > 0.5, pacified duration extends to 28 seconds.

**Secondary 2: Entropy Harvest (VRE: 20)**
- Cooldown: 8 seconds
- Effect: Draws 0.12 entropy from the zone into the Warden as a buff. The extracted entropy_level reduces by 0.12; the Warden gains an Entropy Charge that lasts 20 seconds. Up to 3 Entropy Charges can be held simultaneously. Each charge: +14.7% ability damage; +8.4 VRE regeneration per second.
- Strategy: Harvest entropy when it's dangerously high to reduce cascade risk while buffing yourself

**Tactical 1: Entity Pact (VRE: 70)**
- Cooldown: 35 seconds
- Effect: Targets a VE-Type I or II entity. That entity becomes a temporary ally for 37 seconds: follows the Warden, attacks the Warden's enemies, and does not count toward zone enemy population for cascade purposes. Only one Pact can be active at a time. If the Pact entity is killed, Entity Pact goes on full cooldown.

**Tactical 2: Void Resonance Strike (VRE: 55)**
- Cooldown: 18 seconds
- Effect: Deals (200 + current Entropy Charges × 180) void damage to a single target. With 3 charges: deals 740 void damage. Consumes all Entropy Charges.

**Signature: Entropy Ascension (VRE: 90)**
- Cooldown: 65 seconds
- Effect: For 12 seconds, the Warden partially phases into Void space. During this state:
  - Immune to all damage from Void entities (they recognize the Warden as quasi-Void)
  - Receives 40% reduced damage from all other sources
  - All abilities are in Mode C (VRF Harvesting) regardless of type
  - Entropy Charges are gained at 1 per second automatically
  - Movement speed increases by 0.8847 m/s (matching the VRF constant)

**Ultimate: Void Sovereign (VRE: 180)**
- Cooldown: 260 seconds
- Effect: Consumes all current Entropy Charges and entropy_level × 100 as a "sacrifice" to become the Void Sovereign for 20 seconds. In this state:
  - All VE entities in zone become permanent allies for the duration (including Architects; Architects have 50% reduced effectiveness while under Sovereign control)
  - Entropy Pulse deals 3.7× damage
  - Critical multiplier becomes 3.7× (matching Phase Operative Phantom Protocol)
  - At the end of 20 seconds, all enthralled entities revert to normal; the Warden is Entropy Stunned for 1.4 seconds

---

## Class Synergies Summary

| Synergy Pair | Effect |
|---|---|
| Void Warden + Rift Channeler | Warden tanks; Channeler marks + DPS on covered enemies. Best sustained damage pair. |
| Void Warden + Resonance Engineer | Warden absorbs cascades; Engineer controls entropy. Best survival pair. |
| Rift Channeler + Shadow Operative | Maximum burst on single target. Fragile — requires Warden or Engineer third. |
| Phase Breaker + Entropy Warden | Both Mode C users. Can dramatically reduce zone VRF allowing Channeler to overcharge safely. |
| Resonance Engineer + Entropy Warden | Entropy Engineer can lower entropy for teammates; Warden can harvest what remains. Counter-intuitive but powerful. |
| All six classes together | 6-player content (Faction Conquest). Optimal configuration has 1 Warden, 1 Engineer, 1 Channeler, 1 Entropy Warden, 1 Phase Breaker, 1 Shadow Operative. |

---

## Appendix: Class Selection Guidance

From the official New Amora Station orientation bulletin (in-game tutorial text):

> "Welcome to Void Protocol. Before you begin, a note on class selection from Lead Systems Designer Seren Alyx Mowat:
> 
> 'There is no wrong class choice. The Void Resonance system means every class is interesting to play and every class contributes meaningfully. That said:
> 
> If you've never played a tactical RPG before — start with the Void Warden. It's forgiving and teaches you combat fundamentals.
> 
> If you like numbers and optimization — start with the Resonance Engineer. You'll spend more time in the pause menu than anyone else, and you'll love it.
> 
> If you want to feel powerful immediately — start with the Shadow Operative. Your burst numbers will be impressive from level 1.
> 
> If you want to understand the world's lore through gameplay — start with the Rift Channeler or Entropy Warden. These classes put you in closest contact with Void phenomena.
> 
> And if you want to confuse everyone in the zone, including yourself — start with the Phase Breaker.
> 
> Whatever you choose, remember: the base VRF is 0.8847. Stay below 1.5. Watch the entropy meter. And have fun.'
> 
> — Seren Alyx Mowat, Darkfield Interactive, 2024-09-05"
