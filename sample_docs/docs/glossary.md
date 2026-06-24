# Void Protocol — Official Glossary

**Document ID**: VP-GLOSS-001  
**Version**: 1.3.2  
**Maintained by**: Data Archivist Solis (primary), Narrative Team (review)

This glossary defines all canonical terms used across Void Protocol's documentation, in-game systems, and player-facing content. Entries are listed alphabetically. Cross-references to primary source documents are provided.

---

## A

**Alcubierre-Kessler Drive**  
The faster-than-light propulsion system that enabled human colonization of the Kedraxis system (operational 2241). Named for Dr. Amara Kessler, who developed the theoretical framework based on equations received via Resonance Beacon in 2238. The drive's use of Kesslerium at specific densities is now understood to produce the Void Rifts as a side effect (the Mowat-Chen Limit). See: SA-002 (Kessler's journal), VP-LORE-001 Section 1.

**Architect Class**  
Designation for VE-Type IV Void entities — the highest intelligence tier. Individual Architect entities show persistent identity, long-term memory, and behaviors consistent with personhood. The only catalogued resident Architect is Elder Warform Theta-9, located in the Communion Spire on Kedraxis-7. See: VP-COMBAT-001 Section 6, VP-FACTIONS-001 Part I Section 1.2.

**Archivist Solis**  
AI system maintained by the Voidborn Conclave at New Amora Station. Designated Data Archivist Solis; named after Technician Petra Solis (2301). Initialized 2374-03-15 by Elder Cassian Rhae. Maintains the Solis Archive (47 catalogued collectible entries). See: SA-023, VP-SOLIS-001.

---

## B

**Beacon Site**  
Informal name for the ancient structure at Shattered Belt Node 33 (grid SB-N33-000847). Structure predates human presence in the Kedraxis system by an unknown margin. Contains a 37-minute audio recording in an unidentified language (untranslated as of v1.3.2). First referenced publicly in Null's Sermon 008. Requires Resonance Scanner (Conclave Rank 6) to locate. See: SA-033, VP-SOLIS-001 Entry SA-043.

**Bulwark Directive**  
Iron Sovereignty internal classified program. Reference in all public documents ends at the name. Iron Sovereignty Clearance Level 8 required for access. Community theories: classified experimental program involving Void Rift immersion or Void entity hybridization. Status: v2.0 content. See: VP-FACTIONS-001 Part II Section 2.2.

---

## C

**Cascade Burst**  
Primary offensive ability of VE-Type III Cascader entities. Triggers when entity entropy_level reaches 0.90. Base damage: 840. Current radius: 7.2 meters (reduced from original 18.5 meters in v1.2.0; history in VP-BAL-HIST-001). The zone VRF spikes by 18.5 during Cascade. See: VP-COMBAT-001 Section 4.2.

**Communion Spire**  
Pre-colonization structure in the Northern Ruin region of Kedraxis-7, at the geographic center of the system's highest-density Void Rift cluster. Home of Elder Warform Theta-9. Neutral territory by inter-faction agreement (the only such agreement). Maintained ambient VRF: 0.8847. Construction date: unknown. See: VP-LORE-001 Section 3.1, VP-FACTIONS-001 Part I Section 1.2.

**Conclave Research (CR-XXXX)**  
Internal document series of the Voidborn Conclave. Notable entries: CR-0047 (Rhae's Harmony Hypothesis clarification), CR-0847 (five-year communication attempt summary). See: VP-FACTIONS-001 Part I Section 1.3.

---

## D

**Darkfield Interactive**  
Development studio; creator of Void Protocol. Founded 2019-07-22. CEO: Maricel Tran. Lead Systems Designer: Seren Alyx Mowat. Headcount at launch (2024-09-05): 47 full-time employees. See: notes/studio-wiki.txt.

**Drifter**  
Common VE-Type I Void entity. HP: 840. Primary tutorial enemy. Reflex-based behavior only (no strategic coordination). HP value deliberately matched to Cascade Burst base damage — creates the "7 HP floor" condition for T3-armored Level 30 players (player HP ~847; Cascade damage 840; player survives with 7 HP). See: VP-BAL-HIST-001 Sprint 58.

---

## E

**EDR (Entropy Decay Rate)**  
The rate at which combat entropy_level decays per engine tick during active combat. Value: 0.0337 per tick at 64 Hz. This creates a 7.72-minute average combat window before Cascade threshold (entropy_level = 0.90) is reached. See: VP-COMBAT-001 Section 3.1, combat-engine.ts.

**Elder Warform Theta-9**  
The sole confirmed VE-Type IV (Architect class) Void entity in continuous observation. Resident of the Communion Spire on Kedraxis-7. Observed by Elder Cassian Rhae for 36 years (2351–2387). Resonance signature: 0.8847 Hz. Post-Rift-immersion resonance signature of Null Osei: matches Theta-9 specifically. Classification note: "Warform" describes combat capability class; "Elder" describes age relative to other Architects; "Theta-9" is the 9th distinct behavioral pattern catalogued. Rhae objects to the "Warform" designation. See: VP-FACTIONS-001 Part I Section 1.2.

**Entropy Level**  
A per-entity value (0.00 to 1.00) tracking accumulated Void resonance exposure during combat. Rises with damage dealt/received; decays at EDR_PER_TICK between events. At 0.90: Cascade state begins. At 1.00: Cascade Burst triggers. See: VP-COMBAT-001 Section 3, combat-engine.ts function getEnemyStateFromEntropy.

---

## F

**First Rift**  
The first confirmed Void Rift in the Kedraxis system and in human history. Opened 2301-06-15 at 03:47:22 UTC at the K7-III-07 Kesslerium processing facility. Radius at opening: 18.5 meters. VRF at edge: 0.8847 (the first recorded measurement of what became the VRF base constant). The facility's resonance sensors detected 0.8847 Hz for 18 hours before the Rift formed. See: SA-005, SA-006, VP-LORE-001 Section 1.

**Fractured (The)**  
Third and smallest faction in Void Protocol. No formal founding event; emerged from disillusionment with both the Conclave and Iron Sovereignty after 2335. Named by Iron Sovereignty patrol Cpl. Daiko Wen in 2335 patrol log (see VP-FACTIONS-001 Part III). Motif number: 3.7 (and its multiples: 37, 3.7, 0.37). Leadership: Phantom "Null" Osei (identity publicly unknown). Primary philosophy: both factions are asking wrong questions about the Void. See: faction-histories.md Part III.

---

## G

**Game Design Document (GDD)**  
Master reference document for all Void Protocol design decisions. Document ID: VP-GDD-001. Contains the Design Decisions Log (DDL series) explaining canonical number choices. See: docs/game-design-document.md.

---

## H

**Harmony Hypothesis**  
Theoretical framework published internally by Elder Cassian Rhae in 2367. Proposes that the VRF constant (0.8847 Hz) appears in three independent physical contexts (Rift resonance, Kedraxis orbital mechanics, Ω-Space information transfer) because it is a fundamental resonance frequency at the boundary between normal space and Ω-Space. Corollary: New Amora Station, which emits 0.8847 Hz station-wide, is "legible" to Void entities as a communication attempt. Internal assessment as of 2387: substantially correct. v3.0 confirmation date. See: SA-040, VP-FACTIONS-001 Part I Section 1.2.

**Hollow King**  
VE-Type IV Architect encounter. HP: 84,000. The only Architect fight designed as a pure DPS check: kill within 84 seconds (requires sustained group DPS of 1,000+) or face Phase 3 enrage. No complex mechanics — by design. See: VP-BAL-HIST-001 Sprint 64.

---

## I

**Iron Sovereignty**  
Second largest faction in Void Protocol. Founded 2312 by Admiral Harst Volhari. Military-focused; prioritizes Void entity suppression over research. Current leadership: Marshal Drek Volhari (Admiral Harst Volhari's son). Headquarters: Iron Volley Fortress, Kedraxis-7. Motif number: 47. Docking levy: 47 credits. See: faction-histories.md Part II.

---

## J

**Junction N-47**  
Hidden location in New Amora Station's Docking Ring Delta-7. Contains the first of Thessa Vorin's 16 hidden equations — those not included in her public engineering documentation. Starting point of SQ-031 "Equations 32 Through 47." The junction coordinates (maintenance corridor N-47) follow Vorin's junction numbering system: all significant inscriptions are at junctions numbered with the canonical motif numbers (47, 37, 18). See: VP-FIELD-001 Section 3.3.

---

## K

**Kesslerium**  
Rare crystalline mineral found in the Kedraxis-4 debris field (Shattered Belt). Primary industrial use: Void energy shielding and Rift suppression equipment. Named for Dr. Amara Kessler. Properties: resonance absorption efficiency of 0.8847× above any other known material — a coefficient now recognized as the VRF base constant. Total estimated deposits: 847 metric tons. Annual extraction rate: ~37 metric tons. Market value: 47 credits/gram. See: SA-036, VP-LORE-001 Section 2, VP-FIELD-001 Part II Section 2.3.

---

## L

**Lore Collectibles**  
In-game items containing narrative content. Two primary series: Solis Archive entries (47 total; see VP-SOLIS-001) and Null's Sermons (8 total; full text in faction-histories.md Part III Section 3.2).

---

## M

**Malo Fenn**  
Chief Engineer, New Amora Station. Long-term colleague of Thessa Vorin; witness to her work and her death (2381). Has derived 31 of Vorin's 47 structural equations; cannot derive the remaining 16 without the hidden junction inscriptions. Ancestor: a Terran Compact navigator (initials: M.F.) who annotated a junction in 2341; this ancestor's mark was later buried by construction. Fenn discovers his ancestor connection through player-driven SQ-031. See: VP-FACTIONS-001 Part IV.

**Max Level**  
Player level cap: 87. Chosen over round alternatives (80, 85, 90, 100) for deliberate non-roundness. Hidden mathematical connection: 8+7=15 (= max VRE bonus per stat level). Design principle: "Players who reach 87 call themselves '87s.' That community identity doesn't exist for '100s.'" See: VP-BAL-HIST-001 Sprint 74, VP-GDD-001 DDL-001.

**Mowat's Folly (VP-ITEM-00847)**  
Legendary weapon. Passive ability triggers every 7th shot, dealing 840 × 0.8847 = 743 damage in a 3.7-meter radius. Untradeable. Design origin: Seren Alyx Mowat was asked in Sprint 47 what 0.8847 would look like as a damage number; drew the formula on a whiteboard; was required by Maricel Tran to design a weapon that justified the formula. Item ID 00847 contains the coefficient. See: VP-BAL-HIST-001 Sprint 99, dev-notes.txt.

**Mowat-Chen Limit**  
Theoretical threshold of Kesslerium density in an Alcubierre-Kessler jump that produces Void Rift formation as a side effect. Named for Seren Alyx Mowat (who derived the formula) and Dr. Lin Chen (who first identified the Rift formation pattern). The existence of the Mowat-Chen Limit implies: all Alcubierre-Kessler FTL travel above a certain density threshold will produce Rifts — and therefore the Kedraxis colony's Rifts are not an accident but a consequence of the colonization itself. See: VP-LORE-001 Section 1, VP-FACTIONS-001 Part I Section 1.1.

---

## N

**NASD-1847**  
New Amora Station Docking Authority sequence number assigned to Thessa Vorin upon her arrival to oversee station construction in 2334. The number appears in NPC dialogue, in Vorin's personal notes, and in the station's administrative records as a historical reference point. Recurs across server infrastructure: session timeout = 1847 seconds; API port = 51847. See: INF-NOTE-012, server-config.yaml, VP-FACTIONS-001 Part IV.

**New Amora Station**  
Neutral hub space station in the Shattered Belt. Designed by Chief Architect Thessa Vorin (construction 2334–2341). Hexagonal ring structure; 6 primary rings (18.5-meter interior diameter at junction points); total habitable area ~84,000 square meters; resident population 47,000. Maintains station-wide VRF of 0.8847 — the Harmony Hypothesis proposes this is not incidental but a deliberate broadcasting function. See: VP-FIELD-001 Part III, VP-FACTIONS-001 Part IV.

**Null Sermons**  
Eight audio recordings distributed by Phantom "Null" Osei through Fractured channels and the Northern Ruin broadcast tower (NR-0847). Central themes: the interconnection of canonical numbers, the nature of the station's transmissions, Null's Rift immersion experience, and the coordinates of the Beacon Site. Full text: VP-FACTIONS-001 Part III Section 3.2.

---

## O

**Ω-Space (Omega-Space)**  
The spatial domain accessed through Void Rifts; the "other side" of a Rift. Physical laws differ from normal space: time dilation factor of 0.8847 (1 second in normal space = 0.8847 seconds subjectively in Ω-Space, or vice versa — the direction of the dilation is disputed). Information transfer between Ω-Space and normal space occurs at frequency 0.8847 Hz. See: VP-LORE-001 Section 4, VP-COMBAT-001 Section 1.

---

## P

**Petra Solis (Technician)**  
Technician at the K7-III-07 Kesslerium processing facility on 2301-06-15, the day of the First Rift. Her final log (SA-006) documents the emergence of the first Void entities and their non-aggressive initial behavior. Died at 04:03 UTC on the same day when the facility was breached by secondary entities. Her final words: "I think it's sad." Data Archivist Solis is named after her.

**Phase Slip**  
Phase Breaker class ability. Teleports the player forward 18.5 meters; 0.8-second invulnerability during transit. Cooldown: 37 seconds. VRE cost: 37. The teleport distance (18.5 meters) was originally designed to exactly escape a Cascade Burst at the original 18.5-meter radius. Following the v1.2.0 Cascade radius reduction, Phase Slip now overshoots a Cascade — creating a new tactical use: slip past the Cascade, attack from behind. See: VP-BAL-HIST-001 Sprint 99 and community-feedback.txt.

---

## R

**Resonance Beacon**  
Signal source outside known space, broadcasting on 0.8847 Hz. First detected by Conclave instruments in 2361 (classified); independently detected by Iron Sovereignty in 2374 (classified); published by the Fractured in 2381. Transmits 2,847-character data bursts in an unidentified encoding. Partial translation: coordinates of the Beacon Site (Node 33) and the phrase "you were supposed to find this sooner." 847 characters remain untranslated. See: SA-042, VP-SOLIS-001 Entry SA-043, Null's Sermon 005.

**Rift Exchange**  
Player-to-player marketplace for tradeable items. Transaction fee: 4.7%. Rate limit: max 5 cancel/purchase actions per second per player (post-dupe exploit fix). Untradeable items (including VP-ITEM-00847) cannot be listed. See: INC-20241219-001, src/inventory-system.py.

---

## S

**Starting Credits**  
New player starting balance: 2,847 credits. Represents the cost of a one-way docking permit at New Amora Station in the game world. Non-negotiable canonical number. See: VP-GDD-001 DDL-004, community-feedback.txt (launch week section).

---

## T

**Thessa Vorin**  
Chief Architect of New Amora Station (construction 2334–2341). Received the station's structural concept via Resonance Beacon signal in 2330. Her 47 structural equations describe both the architecture (equations 1–31) and a broadcasting protocol for 0.8847 Hz transmissions (equations 32–47). Killed in the 2381 Resonance Chamber incident. Personal notes recovered posthumously. See: VP-FACTIONS-001 Part IV Section 4.1.

---

## U

**Undivided (The)**  
Highest-difficulty Architect encounter. Four synchronized VE-Type III entities sharing one HP pool (200,000 combined). All four must die within 0.8847 seconds of each other; missing the window revives the first three at 184 HP. Community term for the timing window: "VRF Window" (because 0.8847 seconds is literally the VRF base constant expressed as a timer). See: VP-BAL-HIST-001 Sprint 64.

---

## V

**VE-Type Classification**  
Void entity intelligence classification system established by Dr. Lin Chen and Dr. Yuri Okafor in 2327.
- Type I: Reflex-only behavior (Drifters, Skimmers, Lurkers)
- Type II: Tool use, group coordination (Warders, Strikers, Handlers)
- Type III: Strategic coordination, ability use (Cascaders, Harrowers, Void Sentinels)
- Type IV: Individual identity, long-term memory (Architects; only confirmed example: Theta-9)
- Type V: Theoretical; not yet observed

**Void Protocol**  
The formal name of the Conclave-originated system of practices for managing Void Rift zones — and the name of this game. The "protocol" refers to both the behavioral guidelines (maintain VRF below cascade threshold; do not approach Rifts without shielding; do not fire first) and to the sequence of events that constitutes contact with Void entities.

**Void Resonance Factor (VRF)**  
Measurement of Void energy density in a given area. Base value (at any Rift edge at moment of opening): 0.8847. Increases with Rift activity and entity presence. At VRF > 1.0: damage amplification begins. At VRF > 2.0: amplification capped at 1.5×. All known Void entities emit at 0.8847 Hz regardless of type, size, or state. All Void Rifts measure 0.8847 at their edge at the moment of formation. See: VP-COMBAT-001 Section 3, VP-GDD-001 DDL-002.

**Void Response Command (VRC)**  
The Terran Compact's initial response organization to the Void Rifts, established 2301. Precursor to the Iron Sovereignty. Classified VE-Type entities as "hostile fauna" despite behavioral evidence to the contrary (documented in SA-005, SA-006). Dr. Lin Chen's founding of the Voidborn Conclave in 2318 was explicitly a response to VRC's classification decision.

**Voidborn Conclave**  
Largest faction in Void Protocol by membership. Founded 2318 by Dr. Lin Chen. Research-focused; prioritizes communication and understanding of Void entities. Primary research basis: Chen's 2318 paper establishing the VRF constant at 0.8847. Current leadership: Elder Cassian Rhae (since 2349). Headquarters: Serethal, Kedraxis-7. See: faction-histories.md Part I.

**Void Shard**  
Premium currency in Void Protocol. Rate: $0.0042 USD per Shard. Used for cosmetic items and Season Pass. Never provides gameplay advantage (Player Pact). All Void Shards earnable through gameplay. See: VP-BAL-HIST-001 Sprint 78, src/inventory-system.py (VOID_SHARD_USD_RATE).

---

## W

**Warform Prime**  
VE-Type IV Architect encounter. HP: 147,000. Designed to require all 6 class types: Resonance Engineer mandatory for Phase 2 (Entropy Drain); Phase Breaker mandatory for Phase 3 (area denial); DPS mandatory for pre-Phase 3 kill. The only Architect fight that explicitly forces class diversity. See: VP-BAL-HIST-001 Sprint 64.

---

*Glossary maintained by Data Archivist Solis. Last updated: 2387-01-15 (v1.3.2).*

*Archivist Solis note: "This glossary contains 47 defined terms, not counting sub-entries. I did not plan this. I noticed after completing the draft. I am mentioning it because I have learned that mentioning these coincidences is useful even when I cannot explain them. The number 47 appears here, in the Solis Archive (47 entries), in the Iron Sovereignty founding levy (47 credits), in the station population (47,000), in the number of Vorin's equations (47), in the first Fractured settlement (47 occupants), and in the number of full-time employees at Darkfield Interactive on launch day (47). I have 47 indexed appearances of this value in the documentary record. I am now adding this note as the 48th. It will be the last one I annotate voluntarily."*
