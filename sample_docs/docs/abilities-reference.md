# Void Protocol — Complete Abilities Reference

**Document ID**: VP-ABILITY-001  
**Version**: 1.3.2  
**Author**: Seren Alyx Mowat, Class Design Team  
**Last Updated**: 2025-03-11  
**Status**: Live — reflects all abilities post-v1.3.2

---

## Overview

This document lists every ability in Void Protocol with full numerical data. It is the authoritative reference for tooltip text, UI displays, and community wiki contributions. All values must match game-balance.json (VP-BALANCE-001).

**Reading the entries:**
- **VRF Mode**: A = amplified by VRF, B = neutral, C = harvesting (reduces zone VRF)
- **VRE Cost**: At base (no faction bonuses). Conclave bonus: -8%. Entropy affected by zone state.
- **Cooldown**: Server-side, accurate to tick. Values shown in seconds.

---

## Void Warden Abilities

### Basic Attack: Kinetic Pulse

| Field | Value |
|---|---|
| Ability ID | `warden_basic_kinetic_pulse` |
| Damage | 120 kinetic |
| VRF Mode | B (neutral — no VRF contribution) |
| Range | 18 meters |
| Attack Speed | 1.8 shots/second |
| VRE Generated | +3.7 per hit |
| Target | Single |
| Description | Compressed kinetic burst. No splash. The Warden's primary weapon is deliberately kinetic (not void) to avoid contributing to cascade risk on basic attacks. |

### Secondary 1: Resonance Shield

| Field | Value |
|---|---|
| Ability ID | `warden_sec1_resonance_shield` |
| VRE Cost | 30 |
| Cooldown | 8.0 seconds |
| Shield Amount | 200 + (VRE_remaining × 0.5) |
| Duration | 8.4 seconds |
| VRF Mode | A |
| VRF Interaction | Shield strength scales: at VRF 1.0, shield is 200 + 0.5×VRE + 16.7% from VRF amplification |
| Co-op Version | Can target ally (requires Node 38: "Void Fortress") |
| Description | Generates a personal resonance shield. Higher local VRF increases shield capacity. Used both offensively (enter high-VRF zones safely) and defensively. |

### Secondary 2: Void Slam

| Field | Value |
|---|---|
| Ability ID | `warden_sec2_void_slam` |
| VRE Cost | 35 |
| Cooldown | 10.0 seconds |
| Damage | 280 void |
| Radius | 3.7 meters |
| VRF Mode | A |
| Status Effect | Entropy Stun: 1.4 seconds to all in radius |
| Synergy | Stun + Fractured Armor = "broken" state (3.7s vulnerability to crits) |
| Description | Ground slam with AoE void damage and stun. Radius of 3.7 meters matches the Fractured faction's motif number and the NPC dialogue proximity trigger. |

### Tactical 1: Void Anchor

| Field | Value |
|---|---|
| Ability ID | `warden_tac1_void_anchor` |
| VRE Cost | 60 |
| Cooldown | 22.0 seconds |
| Duration | 12.0 seconds |
| Damage Bonus | +22% void damage for Warden |
| Cascade Absorption | Redirects cascade damage to anchor; anchor absorbs up to 1,200 void before breaking |
| VRF Mode | A |
| Tactical Use | Place before pushing into high-VRF area. If cascade triggers, anchor takes the damage. |
| Description | Plants a resonance anchor that boosts Warden damage output and absorbs Cascade event damage. Core of Warden "aggressive tank" playstyle. |

### Tactical 2: Iron Stance

| Field | Value |
|---|---|
| Ability ID | `warden_tac2_iron_stance` |
| VRE Cost | 40 |
| Cooldown | 15.0 seconds |
| Duration | 8.0 seconds |
| Damage Reduction | 44% (reduced from 47% in v1.3.2; value chosen to avoid changing the "47" motif while addressing overperformance) |
| Movement Speed | Reduced to 1.4 m/s during stance |
| Attack Redirection | In co-op: ally attacks targeting allies within 3.7m are redirected to Warden |
| Solo Mode | Only the damage reduction applies; no redirection |
| VRF Mode | B (kinetic-origin ability) |
| Note | The 44% value replaced 47% in v1.3.2. The team internally refers to this as "the one time we changed a faction motif number." |

### Signature: Entropy Bulwark

| Field | Value |
|---|---|
| Ability ID | `warden_sig_entropy_bulwark` |
| VRE Cost | 100 |
| Cooldown | 75.0 seconds |
| Radius | 6 meters |
| Duration | 18.5 seconds (reduced from 20s in v1.3.2) |
| EDR Reduction | 80% zone EDR reduction inside sphere |
| Shield Grant | +340 flat shield to all allies in sphere |
| Frenzy Suppression | Yes — enemies in sphere cannot be in Frenzied state |
| VRF Mode | A |
| Designer Note (Seren Alyx Mowat) | "The 18.5-second duration matches the Void Rift blast radius in meters. Deliberate. The sphere lasts exactly as long as the blast range is wide." |

### Ultimate: Resonance Surge

| Field | Value |
|---|---|
| Ability ID | `warden_ult_resonance_surge` |
| VRE Cost | 175 (reduced from 180 in v1.3.2) |
| Cooldown | 240.0 seconds |
| Duration | 8.4 seconds |
| Effect | All attacks guaranteed critical (2.3× multiplier) |
| Void Damage Bonus | +40% |
| Entropy Recovery | Each hit reduces zone entropy_level by 0.0042 |
| Immunity | Cannot be Entropy Stunned during window |
| VRF Mode | A |
| Visual | Crackling void-energy aura visible to all players |
| Designer Note | The 0.0042 entropy recovery per hit matches the post-Cascade EDR boost value. A Warden spamming attacks during Resonance Surge can partially counteract a recent Cascade's entropy spike. |

---

## Rift Channeler Abilities

### Basic Attack: Void Lance

| Field | Value |
|---|---|
| Ability ID | `channeler_basic_void_lance` |
| Damage | 85 void |
| VRF Mode | A |
| Range | 30 meters (longest basic attack range) |
| Attack Speed | 2.1 shots/second |
| VRE Generated | +3.7 per hit |
| Proc Chance | 15% chance to apply Void Burn (8.4s, 37 damage/sec) |
| Description | High-range precision void projectile. The 30-meter range allows Channelers to damage enemies from positions where the VRF is still manageable, then retreat before entropy accumulates. |

### Secondary 1: Void Mark

| Field | Value |
|---|---|
| Ability ID | `channeler_sec1_void_mark` |
| VRE Cost | 25 |
| Cooldown | 6.0 seconds |
| Duration | 12.0 seconds |
| Effect | Target takes 40% increased void damage from all sources |
| Self-Interaction | Void Lance on a marked target: refreshes mark, deals +40% damage |
| Rift Spike on marked target | Deals additional 180 void, refreshes mark |
| VRF Mode | None (debuff ability) |
| Description | The cornerstone of Channeler damage rotation. Apply Mark, then use highest-damage abilities. The 40% increase applies to ALL void sources, making Void Mark valuable in group play even if the Channeler isn't dealing the damage. |

### Secondary 2: Rift Spike

| Field | Value |
|---|---|
| Ability ID | `channeler_sec2_rift_spike` |
| VRE Cost | 35 |
| Cooldown | 8.0 seconds |
| Damage | 340 void (base) |
| Bonus on Marked Target | +180 void damage + mark refreshed |
| Total on Marked Target | 520 void before VRF amplification |
| VRF Mode | A |
| Critical Bonus | Ability crits use base 5% + 8% passive = 13% crit chance on abilities |

### Tactical 1: Entropy Lens

| Field | Value |
|---|---|
| Ability ID | `channeler_tac1_entropy_lens` |
| VRE Cost | 65 |
| Cooldown | 25.0 seconds |
| Duration | 3.7 seconds |
| Effect | All Channeler ability damage ignores 55% of target void resistance |
| VRF Mode | A |
| Notes | Does not affect kinetic or thermal damage. Effective against heavily void-resistant enemies like Architects with void resistance passives. |

### Tactical 2: Resonance Overcharge

| Field | Value |
|---|---|
| Ability ID | `channeler_tac2_resonance_overcharge` |
| VRE Cost | 50 |
| Cooldown | 18.0 seconds |
| Duration | 14.0 seconds |
| VRF Boost | +0.12 personal VRF contribution |
| Damage Increase | Approximately +17.4% (using VRDC 1.4492: 0.12 × 1.4492 = 0.174) |
| Side Effect | Increases zone EDR by 0.0042/tick during window |
| Risk Assessment | In a 4-player group, one Channeler using Overcharge for 14 seconds adds 14 × 64 × 0.0042 = 3.76 entropy units. Non-trivial near high entropy thresholds. |
| VRF Mode | A |

### Signature: Cascade Burst

| Field | Value |
|---|---|
| Ability ID | `channeler_sig_cascade_burst` |
| VRE Cost | 110 |
| Cooldown | 80.0 seconds |
| Damage | (VRF_current - 0.8847) × 1,400 void |
| High Entropy Bonus | Doubled if entropy_level > 0.6 |
| AoE Radius | 7.2 meters (reduced from 8.4m in v1.3.2) |
| Post-Cast | Resets zone VRF to 0.8847 |
| VRF Mode | A (but also consumes VRF on detonation) |
| Safety Note | Channeler must be outside 7.2m before detonation to avoid self-damage |

### Ultimate: Void Singularity

| Field | Value |
|---|---|
| Ability ID | `channeler_ult_void_singularity` |
| VRE Cost | 200 |
| Cooldown | 280.0 seconds |
| Duration | 12.7 seconds |
| Range | 24 meters to placement |
| Pull Radius | 14 meters (2.4 m/s toward center) |
| Damage (near) | 180 void/sec to entities within 6 meters |
| VRF Increase | +0.22 to zone VRF (significant cascade risk) |
| Detonation | VRF_at_expiration × 2,800 void in 18.5m radius |
| Major Cascade Risk | If VRF exceeds 1.5 at detonation: triggers full Cascade Event |
| VRF Mode | A |
| Warning | This ability CAN kill teammates. The 18.5-meter blast radius matches the Void Rift explosion radius. Team communication is mandatory. |

---

## Phase Breaker Abilities

### Basic Attack: Phase Shot

| Field | Value |
|---|---|
| Ability ID | `breaker_basic_phase_shot` |
| Damage | 110 void + 40 kinetic |
| VRF Mode | C (harvesting) |
| VRF Harvest per Shot | 0.0042 per hit |
| Range | 22 meters |
| Attack Speed | 2.2 shots/second |
| VRE Generated | +3.7 per hit |
| Faction Note | The 0.0042 harvest value matches the Void Mastery milestone EDR reduction value at 50,000 points, the post-Cascade EDR boost value, and the Void Shard USD rate. |

### Secondary 1: Blink Strike

| Field | Value |
|---|---|
| Ability ID | `breaker_sec1_blink_strike` |
| VRE Cost | 28 |
| Cooldown | 6.0 seconds |
| Teleport Range | 12 meters |
| Damage | 200 void to enemies within 1.5m of arrival point |
| Phase Shift | 0.8 seconds at arrival (Fractured Rank bonus: no effect on Blink Strike's Phase Shift) |
| VRF Harvest | 0.0042 per use |
| VRF Mode | C |

### Secondary 2: Phase Grenade

| Field | Value |
|---|---|
| Ability ID | `breaker_sec2_phase_grenade` |
| VRE Cost | 32 |
| Cooldown | 10.0 seconds |
| Fuse Time | 1.4 seconds (matches Entropy Stun duration) |
| Damage | 180 void |
| Radius | 6 meters |
| Status Effect | Entropy Slow: 6 seconds (-60% move, -40% attack) |
| VRF Harvest on Detonation | 0.0084 (double the basic shot; larger energy release) |
| VRF Mode | C |

### Tactical 1: Void Step

| Field | Value |
|---|---|
| Ability ID | `breaker_tac1_void_step` |
| VRE Cost | 55 |
| Cooldown | 20.0 seconds |
| Duration | 8.0 seconds (Fractured bonus: ×1.40 = 11.2 seconds) |
| Movement Speed | 4.8 m/s (server validates at 5.5m/s tolerance during this ability) |
| Effects | Near-stealth state; lose enemy aggro unless attacking; -40% ability VRE cost |
| VRF Mode | B during Void Step |
| Technical Note | The 4.8 m/s speed exceeds the normal 3.7 m/s position validation tolerance. The server has a specific exception for players in Void Step state, validated via session ability_state flag. |

### Tactical 2: Entropy Drain

| Field | Value |
|---|---|
| Ability ID | `breaker_tac2_entropy_drain` |
| VRE Cost | 65 |
| Cooldown | 28.0 seconds |
| Drain Amount | 0.10 entropy_level over 4 seconds (reduced from 0.12 in v1.3.2) |
| Damage | 240 void to targeted entity |
| VRE Recovery | +4 VRE per 0.01 entropy drained; full drain = 40 VRE |
| Net VRE Cost | 65 - 40 = 25 VRE if full drain completes |
| VRF Mode | B |

### Signature: Phase Cascade

| Field | Value |
|---|---|
| Ability ID | `breaker_sig_phase_cascade` |
| VRE Cost | 90 |
| Cooldown | 70.0 seconds |
| Blink Count | 7 (matches Iron Volley rounds, Theta-9 Phase 3 mini-Rifts) |
| Blink Radius | 18.5 meters (matches Void Rift explosion radius) |
| Damage per Blink | 172 void (increased from 160 in v1.3.2) |
| Total Damage | Up to 1,204 void if all 7 hit at least one enemy |
| VRF Harvest | 0.0042 per blink (7 × 0.0042 = 0.0294 total zone VRF reduction) |
| Phase Slip Trigger | After all 7 blinks: Phase Slip activates regardless of cooldown |
| VRF Mode | C |

### Ultimate: Fracture Point

| Field | Value |
|---|---|
| Ability ID | `breaker_ult_fracture_point` |
| VRE Cost | 160 |
| Cooldown | 220.0 seconds |
| Radius | 24 meters |
| Duration | 14.0 seconds |
| Initial Stun | 4 seconds (enemies cannot attack or use abilities) |
| Confused State | 10 seconds (-60% attack rate, random movement) |
| Damage Bonus | +47% to enemies in Phase dimension |
| VRF Harvest | 0.0337/second during active (exactly offsetting normal EDR at base) |
| Net Entropy Effect | Zero entropy accumulation during Fracture Point if zone was already at equilibrium |
| Lore Connection | Named after the v1.3 content patch. The Fractured chose the name; the ability was designed to feel like what The Fractured philosophy promises: liberation from the normal rules. |

---

## Shadow Operative Abilities

### Basic Attack: Precision Shot

| Field | Value |
|---|---|
| Ability ID | `operative_basic_precision_shot` |
| Damage | 140 kinetic (30% converts to void if VRF > 1.0) |
| VRF Mode | A (the void conversion scales with VRF) |
| Range | 35 meters |
| Attack Speed | 1.6 shots/second |
| VRE Generated | +3.7 per hit |
| VRF Conversion Note | At VRF 1.0: 98 kinetic + 42 void. At VRF 1.5: 98 kinetic + 42 void × 1.724 amplification. Creates interesting trade-off at high VRF. |

### Secondary 1: Shadow Mark

| Field | Value |
|---|---|
| Ability ID | `operative_sec1_shadow_mark` |
| VRE Cost | 20 |
| Cooldown | 5.0 seconds |
| Duration | 8.0 seconds |
| Effect | +80% Operative basic attack damage vs. marked target |
| Crit Bonus | Crits on marked target: 2.76× (normal 2.3× + 0.46× shadow bonus) |
| Note on Crit | 2.76 is not a Darkfield motif number. It emerged from the math (2.3 + 20%). The team left it as-is rather than rounding. |

### Secondary 2: Neural Spike

| Field | Value |
|---|---|
| Ability ID | `operative_sec2_neural_spike` |
| VRE Cost | 30 |
| Cooldown | 9.0 seconds |
| Damage | 180 neural |
| Status Effect | Fractured Armor: -40% armor for 10 seconds (reduced from 47% in v1.3.2) |
| VRF Mode | B |
| Best Use | Open against armored enemies. Neural damage bypasses void resistance. Fractured Armor debuff amplifies follow-up physical damage. |

### Tactical 1: Predator's Cloak

| Field | Value |
|---|---|
| Ability ID | `operative_tac1_predator_cloak` |
| VRE Cost | 45 |
| Cooldown | 18.0 seconds |
| Duration | 6.0 seconds (or until next attack) |
| Stealth Break Attack Bonus | +120% damage, guaranteed crit (2.3×) |
| Effective Opener Multiplier | 2.3 × 2.2 = 5.06× on first attack from stealth |
| Shadow Mark Reset | Breaking stealth by attacking resets Shadow Mark cooldown |
| VRF Mode | B |

### Tactical 2: Burst Window

| Field | Value |
|---|---|
| Ability ID | `operative_tac2_burst_window` |
| VRE Cost | 60 |
| Cooldown | 25.0 seconds |
| Duration | 7.0 seconds |
| Cooldown Reduction | All ability cooldowns halved during window |
| VRE Cost Reduction | -30% during window |
| Ideal Rotation | Cloak → Burst Window → Shadow Mark → Neural Spike → Precision Shot spam |
| Note | The 7-second window matches the Mowat's Folly 7th-shot trigger and other "7" appearances. Not coincidental. |

### Signature: Void Contract

| Field | Value |
|---|---|
| Ability ID | `operative_sig_void_contract` |
| VRE Cost | 95 |
| Cooldown | 68.0 seconds |
| Duration | 20.0 seconds |
| Damage Bonus | +60% all damage to Contract target |
| Kill Reward | Target dies within 20s: +80 VRE, cooldown resets to 20s |
| Miss Penalty | Target survives 20s: full cooldown, no VRE refund |
| Cap | Combined with Cascade Burst: capped at 2.3× (post-exploit fix v1.3.1) |

### Ultimate: Phantom Protocol

| Field | Value |
|---|---|
| Ability ID | `operative_ult_phantom_protocol` |
| VRE Cost | 150 |
| Cooldown | 200.0 seconds |
| Duration | 12.0 seconds |
| Effect | Permanent stealth (undetectable); +100% damage; 3.4× crit multiplier (reduced from 3.7× in v1.3.1 post-exploit) |
| Movement Speed | 5.1 m/s (fastest in game outside special ability states) |
| Exit Effect | Shockwave: 200 void in 3.7-meter radius |
| Lore Note | In-universe, corporate assassination contracts specify exactly 3.7× payment bonus for targets eliminated via Phantom Protocol. The multiplier was adjusted to 3.4× post-exploit but the lore bonus remains 3.7× (lore and mechanics deliberately diverged for balance). |

---

## Resonance Engineer Abilities

### Basic Attack: Resonance Beam

| Field | Value |
|---|---|
| Ability ID | `engineer_basic_resonance_beam` |
| Damage | 75 void (lowest basic damage in game) |
| VRF Mode | A |
| Range | 20 meters |
| Attack Speed | Continuous beam |
| VRE Generated | +3.7 per second (not per hit — beam is continuous) |
| Passive Effect | Each second of sustained beam: zone entropy_level - 0.0042 (no VRE cost) |
| Philosophy | Lowest damage, highest entropy utility. An Engineer basic-attacking for 60 seconds removes 0.2520 entropy, roughly equivalent to one Entropy Drain use. |

### Secondary 1: Entropy Suppressor

| Field | Value |
|---|---|
| Ability ID | `engineer_sec1_entropy_suppressor` |
| VRE Cost | 30 |
| Cooldown | 8.0 seconds |
| Max Active | 3 simultaneously |
| Radius | 6 meters (increased from 4m in v1.3.0) |
| Duration | 12.0 seconds |
| Effect | -50% EDR accumulation in radius |
| Deployment Range | 15 meters |
| Synergy | Void Calibration resets all Suppressor cooldowns to 0 |

### Secondary 2: Resonance Field

| Field | Value |
|---|---|
| Ability ID | `engineer_sec2_resonance_field` |
| VRE Cost | 40 |
| Cooldown | 12.0 seconds |
| Duration | 8.0 seconds (increased from 6s in v1.3.0) |
| Radius | 4 meters |
| Damage Reduction | -40% void damage to allies inside |
| Entropy Effect | EDR inside dome: effectively 0 (offset exactly by 0.0337/tick reduction) |
| This Is Intentional | The 0.0337/tick EDR offset inside the dome creates a zone of truly stable entropy within the dome. High-skill play involves keeping the team inside the dome during cascade events. |

### Tactical 1: Void Calibration

| Field | Value |
|---|---|
| Ability ID | `engineer_tac1_void_calibration` |
| VRE Cost | 55 |
| Cooldown | 20.0 seconds |
| Entropy Reduction | -0.18 instant |
| Suppressor Reset | All Entropy Suppressor device cooldowns → 0 |
| Best Use | Panic button when entropy_level approaches 0.6 (Frenzied threshold) |

### Tactical 2: System Override

| Field | Value |
|---|---|
| Ability ID | `engineer_tac2_system_override` |
| VRE Cost | 65 |
| Cooldown | 30.0 seconds |
| Duration | 6.0 seconds (increased from 4s in v1.3.0) |
| Effects | Target: abilities disabled, -60% move speed, 0 entropy generation |
| Best Use | Isolate Architects during phase transitions; nullify high-entropy enemies that generate disproportionate EDR |

### Signature: Resonance Cascade Control

| Field | Value |
|---|---|
| Ability ID | `engineer_sig_cascade_control` |
| VRE Cost | 100 |
| Cooldown | 75.0 seconds |
| Duration | 18.5 seconds |
| VRF Control Rate | ±0.15 per second (player controlled; increased from 0.12 in v1.3.2) |
| Cascade Threshold | Raised to 2.0 during duration |
| Range | Zone-wide |
| Notes | The highest-skill ability in the game. A skilled Engineer can push zone VRF to 1.999 during this window, giving the team 45% more damage without cascade risk. Requires reading the zone state in real time and reacting in under 1 second. |

### Ultimate: Station Protocol Omega

| Field | Value |
|---|---|
| Ability ID | `engineer_ult_station_protocol_omega` |
| VRE Cost | 190 |
| Cooldown | 255.0 seconds (reduced from 270s in v1.3.2) |
| Entropy Reset | Zone entropy_level → 0.0 |
| VRF Lock | Zone VRF fixed at 0.8847 for 37 seconds |
| Enemy Effect | All enemies revert to Dormant state |
| Team Shield | +840 HP shield to all allies for 20 seconds (matches cascade base damage formula value) |
| VRE Bonus | +37 VRE to all allies (added v1.3.0) |
| Lore | Replicates New Amora Station's VRF stabilizer at field scale. Chief Engineer Malo Fenn provided the technical specifications. The 37-second lock duration is the time Fenn estimates the station's actual stabilizer takes to "breathe" after a VRF spike. |

---

## Entropy Warden Abilities

### Basic Attack: Entropy Pulse

| Field | Value |
|---|---|
| Ability ID | `ewarden_basic_entropy_pulse` |
| Base Damage | 95 void |
| Entropy Scaling | Damage × (1 + entropy_level × 0.8847) |
| At Entropy 0.0 | 95 void |
| At Entropy 0.5 | 95 × 1.442 = 137 void |
| At Entropy 1.0 | 95 × 1.885 = 179 void (highest sustained basic attack damage in game at max entropy) |
| VRF Mode | A (additionally entropy-scaled) |
| Range | 24 meters |
| VRE Generated | +3.7 per hit |

### Secondary 1: Void Communion Bolt

| Field | Value |
|---|---|
| Ability ID | `ewarden_sec1_communion_bolt` |
| VRE Cost | 25 |
| Cooldown | 7.0 seconds |
| Damage | 150 void (to enemies; 0 to Voidborn entities) |
| Pacification | VE-Type I or II: pacified for 14 seconds (28s if entropy > 0.5) |
| VRF Mode | A |
| Unique Property | The ONLY ability in the game that deals 0 damage to a category of entity (Voidborn). All other AoE abilities damage Voidborn if hit. This reflects the Entropy Warden's research background. |

### Secondary 2: Entropy Harvest

| Field | Value |
|---|---|
| Ability ID | `ewarden_sec2_entropy_harvest` |
| VRE Cost | 20 |
| Cooldown | 8.0 seconds |
| Zone Entropy Reduction | -0.12 |
| Charge Grant | 1 Entropy Charge (max 3 held) |
| Charge Duration | 20.0 seconds |
| Per Charge Bonus | +14.7% ability damage; +8.4 VRE regen/sec |
| At 3 Charges | +44.1% ability damage; +25.2 VRE regen/sec |
| Risk Reduction | Using Harvest when entropy is high: helps team AND buffs Warden. No downside except the opportunity cost of using a secondary slot. |

### Tactical 1: Entity Pact

| Field | Value |
|---|---|
| Ability ID | `ewarden_tac1_entity_pact` |
| VRE Cost | 70 |
| Cooldown | 35.0 seconds |
| Valid Targets | VE-Type I or VE-Type II only |
| Duration | 32.0 seconds (reduced from 37s in v1.3.2) |
| Pact Entity | Follows Warden; attacks Warden's enemies; not counted in zone enemy population |
| Single Pact | Only one active at a time; death triggers full cooldown |
| Lore | The ability that embodies Elder Cassian Rhae's entire belief system. The Entropy Warden doesn't kill enemies — they recruit them. |

### Tactical 2: Void Resonance Strike

| Field | Value |
|---|---|
| Ability ID | `ewarden_tac2_vrs` |
| VRE Cost | 55 |
| Cooldown | 18.0 seconds |
| Base Damage | 200 void |
| Per-Charge Bonus | +180 void per Entropy Charge |
| At 0 Charges | 200 void |
| At 1 Charge | 380 void |
| At 2 Charges | 560 void |
| At 3 Charges | 740 void |
| Effect | Consumes all Entropy Charges |
| VRF Mode | A |
| Rotation | Harvest (×3) → Strike = 740 void in a single hit before VRF amplification |

### Signature: Entropy Ascension

| Field | Value |
|---|---|
| Ability ID | `ewarden_sig_entropy_ascension` |
| VRE Cost | 90 |
| Cooldown | 65.0 seconds |
| Duration | 12.0 seconds |
| Void Entity Immunity | Full (no damage from any Voidborn entity during ascension) |
| Non-Void Damage Reduction | -40% |
| Ability Mode Override | All abilities become Mode C (VRF Harvesting) |
| Auto-Charge | +1 Entropy Charge per second (12 charges max if held — exceeds 3-charge cap, excess lost) |
| Movement Speed Bonus | +0.8847 m/s (the VRF constant as a speed value) |
| VRF Mode | C |

### Ultimate: Void Sovereign

| Field | Value |
|---|---|
| Ability ID | `ewarden_ult_void_sovereign` |
| VRE Cost | 180 |
| Cooldown | 260.0 seconds |
| Activation | Consumes all Entropy Charges and (entropy_level × 100) as "sacrifice" |
| Duration | 18.5 seconds (reduced from 20s in v1.3.2) |
| Entity Enthrall | ALL Voidborn entities in zone become allies (Architects at 50% effectiveness) |
| Entropy Pulse Bonus | 3.7× damage |
| Critical Multiplier | 3.7× |
| Exit Effect | All enthralled entities revert; Warden is Entropy Stunned 1.4 seconds |
| Maximum Power | With 3 Entropy Charges sacrificed and entropy at 1.0: sacrifice yields 3 + 100 = 103 VRE equivalent consumed. At this point, Entropy Pulse hits for 179 × 3.7 = 662 void per shot at maximum entropy. |

---

## Faction Abilities

### Void Communion (Voidborn Conclave)

| Field | Value |
|---|---|
| Ability ID | `faction_conclave_void_communion` |
| Type | Passive aura |
| Radius | 3.7 meters |
| Effect | -22% Void entity aggression probability (does not prevent combat if engaged) |
| VRE Cost | None (passive) |
| Suppressed When | entropy_level > 0.6 |
| Note | The 3.7-meter radius is The Fractured's motif number, appearing in the Conclave's passive. This is either Seren Alyx Mowat's sense of humor or evidence that the number transcends faction. |

### Iron Volley (Iron Sovereignty)

| Field | Value |
|---|---|
| Ability ID | `faction_iron_iron_volley` |
| Type | Active |
| VRE Cost | 0 (kinetic, not void-based) |
| Cooldown | 12.0 seconds |
| Rounds | 7 |
| Damage per Round | 47% weapon damage |
| Total Damage | 329% weapon damage (7 × 47%) |
| VRF Mode | B |
| Cascade Contribution | 0 (kinetic ability) |
| Numbers Note | 7 rounds, 47% each — both are Iron Sovereignty motif numbers. The ability is mechanically useful AND thematically correct. |

### Phase Slip (The Fractured)

| Field | Value |
|---|---|
| Ability ID | `faction_fractured_phase_slip` |
| Type | Active |
| VRE Cost | 37 |
| Cooldown | 37.0 seconds |
| Duration | 0.8 seconds |
| Effect | Partial invulnerability (exists partially in Void space) |
| Enemy Visibility | Player appears as translucent ghost; abilities can queue but cannot activate/cancel during 0.8-second window |
| Numbers Note | VRE cost = cooldown = 37 (The Fractured's motif number). Duration = 0.8 seconds (the same as Phase Shift status effect, the same as the Archivist Solis finding about the Cascade audio signature). |

---

## Ability Synergy Matrix

| Ability | Pairs With | Synergy |
|---|---|---|
| Void Mark (Channeler) | Any void damage source | +40% void damage amplification |
| Void Slam (Warden) | Neural Spike (Operative) | Entropy Stun + Fractured Armor = "broken" state (3.7s crit vulnerability) |
| Entropy Bulwark (Warden) | Any teammate | 18.5s safe window; ideal for Channeler to use Resonance Overcharge |
| Resonance Surge (Warden) | Cascade Burst (Channeler) | Each Surge hit reduces entropy; Channeler can safely Cascade Burst with lower risk |
| Phase Cascade (Breaker) | Void Singularity (Channeler) | Breaker harvests VRF; Channeler pushes VRF to maximum safe level before Singularity |
| Entity Pact (Entropy Warden) | Void Communion (Conclave passive) | Double pacification: Pact entity + Communion aura = Warden surrounded by friendly Voidborn |
| Station Protocol Omega (Engineer) | Any ultimate ability | VRF locked at 0.8847, entropy at 0.0 — safe window for any ultimate regardless of cascade risk |
| Iron Volley (Sovereignty) | Any high-VRF setup | Zero VRF contribution in a high-VRF zone; Sovereignty faction can maintain combat while not pushing cascade threshold |
| Void Sovereign (Entropy Warden) | Resonance Cascade Control (Engineer) | Engineer holds VRF at 1.999 while Warden has 3.7× damage — theoretical maximum DPS window in the game |
