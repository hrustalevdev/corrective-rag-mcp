/**
 * Void Protocol — Dialogue Engine
 * Document ID: VP-SRC-DIALOGUE-001
 * Studio: Darkfield Interactive
 *
 * Manages NPC dialogue, proximity triggers, and dynamic dialogue templating.
 * Runs client-side for rendering; server provides context data.
 *
 * Key constants (from VP-BALANCE-001 / VP-WORLD-CONFIG-001):
 *   - Dialogue proximity trigger: 3.7 meters
 *   - Data Archivist Solis: requires Voidborn Conclave Rank 3
 *   - Phase Slip invulnerability: 0.8 seconds
 *   - Faction update interval: 6 hours
 */

"use strict";

// =========================================
// Constants
// =========================================

const DIALOGUE_PROXIMITY_METERS = 3.7;
const SOLIS_MINIMUM_FACTION_RANK = 3;
const SOLIS_REQUIRED_FACTION = "voidborn_conclave";
const FACTION_UPDATE_INTERVAL_HOURS = 6;
const MAX_DIALOGUE_HISTORY = 47;
const AMBIENT_DIALOGUE_COOLDOWN_SECONDS = 30;

// =========================================
// NPC Definitions
// =========================================

const NPC_REGISTRY = {
  veysa_ord: {
    id: "veysa_ord",
    name: "Quartermaster Veysa Ord",
    faction: null,
    location: "new_amora_station_concourse",
    role: "vendor",
    portrait: "npc_veysa_ord",
    greetings: [
      "Credits upfront. I don't do charity.",
      "Don't mention the Sovereignty to me. We're conducting business.",
      "You want gear or you want conversation? I only do one of those.",
      "2,847 credits to dock here. Did they even tell you that? Probably not.",
    ],
    ambient_lines: [
      "You hear that hum? That's the VRF stabilizer. Been running since 2341. Never missed a tick.",
      "Volhari sends his people through here sometimes. I smile and take their credits. That's all.",
      "Rhae was in here earlier. Always asking me about the resonance readings. I tell him 0.8847, same as every day.",
      "The Fractured broke into the Resonance Chamber in '81. Thessa Vorin died. I knew her. Good engineer.",
      "Station's at capacity. 47,000 people. Malo Fenn says the stabilizer wasn't designed for this many.",
    ],
    faction_specific_lines: {
      voidborn_conclave: "Conclave, hm? Don't let Rhae talk your ear off about the frequency. He's been at it for 36 years.",
      iron_sovereignty: "Sovereignty. Right. Keep your weapons holstered in the Concourse.",
      the_fractured: "Fractured. Surprised you walked in the front door. Security's been twitchy since the Chamber Incident.",
    },
  },

  malo_fenn: {
    id: "malo_fenn",
    name: "Chief Engineer Malo Fenn",
    faction: null,
    location: "new_amora_station_concourse",
    role: "quest_giver",
    portrait: "npc_malo_fenn",
    greetings: [
      "Good. Someone who might actually help. The north ring's resonance coupling is acting up again.",
      "VRF is 0.8847. As always. I check every four hours. Have for 20 years.",
      "Thessa Vorin designed this station with equations I still can't derive. Sometimes that keeps me up at night.",
    ],
    ambient_lines: [
      "The stabilizer core is running at 99.3% efficiency. That 0.7% has been bothering me for a decade.",
      "Vorin's original notes reference a formula I've never seen in any engineering textbook. It predates the Void Rift.",
      "I have 37 connections max on the database pool. Learn that lesson now: don't go above 37.",
      "The docking ID for this station is NASD-1847. That number's not random. Vorin chose it.",
      "Session timeout on the station systems is 1,847 seconds. Vorin again. I've stopped questioning it.",
    ],
    quest_lines: {
      north_ring_maintenance: [
        "The north ring's resonance coupling shows a 0.003 deviation from 0.8847. That's nothing by most standards. By Vorin's standards it's a crisis.",
        "I need someone to physically inspect coupling node N-47. I can't leave the Chamber unattended.",
        "If the VRF drifts above 0.89 in the residential ring, we'll have panicking colonists within an hour. Void entities get restless.",
      ],
    },
  },

  data_archivist_solis: {
    id: "data_archivist_solis",
    name: "Data Archivist Solis",
    faction: SOLIS_REQUIRED_FACTION,
    location: "new_amora_station_resonance_chamber",
    role: "lore_interface",
    portrait: "npc_solis_hologram",
    access_requirement: {
      faction: SOLIS_REQUIRED_FACTION,
      min_rank: SOLIS_MINIMUM_FACTION_RANK,
    },
    greetings: [
      "Archivist Solis. Elder Rhae named me after Technician Petra Solis — she died on 2301-06-15. I find it appropriate that a memory system bears her name.",
      "My archive contains 284,700 indexed entries. What would you like to know?",
    ],
    query_responses: {
      void_rift_origins: "The first Void Rift opened above K7-III on 2301-06-15 at 03:47:22 UTC. Technician Petra Solis's final log entry was recorded at 08:05:11 KST — 4 hours and 17 minutes after the Rift opened. The Void entities entered the mining facility K7-III-07 at 08:03:44 KST. They did not immediately attack. Dr. Lin Chen's analysis, cross-referencing 847 subsequent observations, concludes the initial behavior was investigative rather than hostile.",
      vrf_constant: "The Void Resonance Factor base value of 0.8847 was first precisely measured by Dr. Lin Chen in 2318, using instruments calibrated at K7-III in the aftermath of the original Rift. The value appears in three other unrelated contexts: the speed ratio of information transfer in Ω-Space to normal space (0.8847), the orbital resonance harmonic of Kedraxis-7's moons (0.8847 Hz), and the sampled density of Void entities in Ω-Space (0.8847 per cubic kilometer). Elder Rhae considers this meaningful. Dr. Chen's original notes say 'probably coincidence, but I've stopped writing that in my reports.'",
      cassian_rhae: "Elder Cassian Rhae, age 71. Former xenobiologist, University of Kedraxis-7. Founded the Voidborn Conclave in 2318 alongside Dr. Lin Chen. First direct observation of a VE-Type IV entity: 2351-09-12, in what is now the Communion Spire. He has been attempting to communicate with that entity — designated Theta-9 — for 36 years. He believes the universal VRF constant of 0.8847 is a 'greeting frequency.' He may be right. I am not programmed to have opinions.",
      thessa_vorin: "Architect Thessa Vorin, deceased 2381. Designed New Amora Station beginning 2334-11-22, completed 2341. Her hexagonal ring design maintains a station-wide VRF of precisely 0.8847 — matching the universal Rift edge constant. Her design notes reference 47 equations that no known engineering discipline can fully explain. Chief Engineer Malo Fenn has been attempting to derive them for 20 years. He has successfully derived 31 of 47. Vorin died during the Chamber Incident when a Fractured explosive breach damaged the corridor outside this room. She was 84 years old.",
      the_fractured: "The Fractured emerged organically from displaced populations circa 2335. First official records appear 2335-03-09 in Iron Sovereignty border patrol logs. Phantom 'Null' Osei emerged as a leader circa 2369, claiming to have 'walked through the Rift and returned changed.' The Iron Sovereignty has classified files on Osei's pre-2369 identity. I have access to the classification index but not the files themselves. The index lists 3 candidate identities with confidence ratings of 47%, 31%, and 22%. I am instructed not to disclose these. Elder Rhae has asked me not to disclose them either, which I find more interesting than the instruction itself.",
    },
    farewell_lines: [
      "Archive updated. Safe travels.",
      "My 47th query of the day. I find this figure meaningful. Goodbye.",
    ],
  },

  elder_cassian_rhae: {
    id: "elder_cassian_rhae",
    name: "Elder Cassian Rhae",
    faction: "voidborn_conclave",
    location: "voidborn_conclave_embassy",
    role: "faction_leader",
    portrait: "npc_cassian_rhae",
    first_meeting: [
      "Welcome. Sit. You'll want to hear this standing up.",
      "The base VRF of this station is 0.8847. The orbital resonance of Kedraxis-7's moons is 0.8847 Hz. The information transfer rate in Ω-Space compared to normal space is 0.8847. The density of Void entities in the sampled regions of Ω-Space is 0.8847 per cubic kilometer. I have been looking at this number for 36 years. It is not a coincidence.",
      "I have been sitting across from a VE-Type IV Architect in the Communion Spire for a very long time. I am 71 years old. I intend to hear it speak before I die.",
    ],
    rank_dialogue: {
      rank_1: "You're new. Good. Fresh perspectives are useful. Learn the VRF system first. Everything else follows.",
      rank_3: "You're beginning to understand. The cascade threshold isn't a danger indicator — it's a conversation limit. Exceed 1.5 and you've been shouting so loudly the entities can't hear you.",
      rank_5: "The entities graded as VE-Type IV in the Communion Spire — I've observed the same one for 36 years. I believe it recognized my frequency shift when I changed my Resonance Beacon's carrier wave to 0.8847 Hz. I believe it responded. I need your help to verify this before anyone else finds out.",
      rank_8: "You have earned the right to stand in this room. What I'm about to show you will redefine everything. The Resonance Chamber under this station isn't stabilizing the VRF. It's *generating* it. Vorin designed this station to produce the signal. New Amora Station is a Resonance Beacon broadcasting at 0.8847 Hz to Ω-Space. It has been broadcasting since 2341. The question I cannot answer is: who asked Vorin to build it?",
    },
  },

  marshal_drek_volhari: {
    id: "marshal_drek_volhari",
    name: "Marshal Drek Volhari",
    faction: "iron_sovereignty",
    location: "iron_sovereignty_embassy",
    role: "faction_leader",
    portrait: "npc_drek_volhari",
    first_meeting: [
      "Marshal Volhari. If you're here, you've chosen the Sovereignty. Good. We have use for people who act rather than theorize.",
      "I lost my right arm in the Shattered Belt in 2372. Two of my people — my brother's children. Sera. Emrak. They were 22 and 19. I heard Sera singing to keep the younger ones calm when the Cascade hit. I heard her for 0.8847 seconds after the burst. Then silence.",
      "I don't cite that number to be poetic. That precise duration has been measured. It's the standard Void Cascade audio signature decay interval. 0.8847 seconds. Every time. I carry that number like a wound.",
    ],
    rank_dialogue: {
      rank_5: "There are things about how we protect people that I'm not proud of. Bulwark Station. Find it. Then come back and tell me I was wrong.",
      rank_8: "You found Bulwark. Then you know. Yes — we have been experimenting on captive Void entities. I ordered it. I need to know what they are before I can destroy them properly. Lin Chen spent 30 years observing and achieved nothing. I've spent 3 years experimenting and I know more than she ever did. I am not proud of the method. I will not stop.",
    },
  },

  phantom_null_osei: {
    id: "phantom_null_osei",
    name: "Phantom \"Null\" Osei",
    faction: "the_fractured",
    location: "fractured_safehouse",
    role: "faction_leader",
    portrait: "npc_null_osei",
    first_meeting: [
      "You know what that number means? 0.8847? They'll tell you it's a physics constant. The frequency at the edge of a Void Rift. The universal baseline. Very tidy.",
      "The first Rift opened on 2301-06-15 at 03:47:22 UTC. Write those digits down: 0.3 — 47 — 22. Now read them: 0.3 + 47 + 22. That's meaningless. Now read: first two digits after the decimal — 88. Next two — 47. That's not meaningless. The Iron Sovereignty uses 47 in all its iconography. Iron Volley fires 7 rounds for 47% damage each. Their docking levy when the station opened: 47 credits. That's not a number. That's a signature.",
      "I walked through a Void Rift in 2369. I came back. I know what's on the other side. Not what's there — what isn't. There's no dimension of Void entities waiting to communicate with Cassian Rhae. There's just the echo of something that used to be there. The Rifts aren't doors. They're mirrors showing you who opened them.",
    ],
    rank_dialogue: {
      rank_3: "You're starting to see it. Good. Keep questioning the 0.8847. Keep asking why that number keeps appearing. When they can't answer, that's when you understand The Fractured.",
      rank_5: "Static transmission received on Resonance Beacon frequency 0.8847 Hz. Message length exactly 2,847 characters — the Beacon buffer limit. Message content: coordinates. Specific, detailed, unambiguous coordinates for a location that doesn't appear on any map. I've verified the coordinates. There's something there. I need you to find it before Rhae or Volhari do.",
      rank_8: "My name before 2369? Why does it matter? I walked through the Rift. What came back isn't the person who went in. That's not metaphor. The entity in the Communion Spire that Rhae calls Theta-9 — it had a name once. Before the Rifts. I know that name. I remembered it when I came back from the Void. And when I look at the resonance pattern of Void entities, I recognize it. I think some of what Null Osei was ended up in Theta-9. And some of Theta-9 ended up in me. The Iron Sovereignty's classified files on my pre-2369 identity: they're not wrong. They just can't explain what happened next."
    },
  },
};

// =========================================
// Dialogue Engine Core
// =========================================

class DialogueEngine {
  constructor() {
    this.activeDialogue = null;
    this.dialogueHistory = [];
    this.ambientCooldowns = new Map();
    this.currentPlayerContext = null;
  }

  /**
   * Check if player is within proximity of an NPC to trigger dialogue.
   * Proximity threshold: 3.7 meters (DIALOGUE_PROXIMITY_METERS).
   */
  checkProximity(playerPosition, npcPosition) {
    const dx = playerPosition.x - npcPosition.x;
    const dy = playerPosition.y - npcPosition.y;
    const dz = playerPosition.z - npcPosition.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance <= DIALOGUE_PROXIMITY_METERS;
  }

  /**
   * Attempt to start dialogue with an NPC.
   * Returns false if access requirements not met.
   */
  startDialogue(npcId, playerContext) {
    const npc = NPC_REGISTRY[npcId];
    if (!npc) return false;

    if (npc.access_requirement) {
      const { faction, min_rank } = npc.access_requirement;
      if (playerContext.faction !== faction || playerContext.factionRank < min_rank) {
        this._displayAccessDenied(npc, playerContext);
        return false;
      }
    }

    this.activeDialogue = { npc, playerContext, lineIndex: 0 };
    this.currentPlayerContext = playerContext;

    this._recordHistory(npcId, "dialogue_start");
    this._selectAndDisplayGreeting(npc, playerContext);
    return true;
  }

  _selectAndDisplayGreeting(npc, playerContext) {
    let greeting;

    if (npc.role === "faction_leader" && npc.rank_dialogue) {
      const rank = playerContext.factionRank;
      // Find the highest rank dialogue the player qualifies for
      const qualifyingRanks = Object.keys(npc.rank_dialogue)
        .map(k => parseInt(k.replace("rank_", "")))
        .filter(r => r <= rank)
        .sort((a, b) => b - a);

      if (qualifyingRanks.length > 0) {
        const rankKey = `rank_${qualifyingRanks[0]}`;
        const rankLines = npc.rank_dialogue[rankKey];
        greeting = Array.isArray(rankLines) ? rankLines[0] : rankLines;
      }
    }

    if (!greeting && npc.greetings) {
      const isFirstMeeting = !this.dialogueHistory.some(h => h.npcId === npc.id);
      if (isFirstMeeting && npc.first_meeting) {
        greeting = npc.first_meeting[0];
      } else {
        const idx = Math.floor(Math.random() * npc.greetings.length);
        greeting = npc.greetings[idx];
      }
    }

    if (greeting) {
      this._displayLine(npc, greeting);
    }
  }

  /**
   * Query Data Archivist Solis with a topic.
   * Requires Voidborn Conclave Rank 3+.
   */
  querySolis(topic, playerContext) {
    if (playerContext.faction !== SOLIS_REQUIRED_FACTION ||
        playerContext.factionRank < SOLIS_MINIMUM_FACTION_RANK) {
      return {
        success: false,
        error: `Requires ${SOLIS_REQUIRED_FACTION} rank ${SOLIS_MINIMUM_FACTION_RANK}+`,
      };
    }

    const solis = NPC_REGISTRY.data_archivist_solis;
    const topicKey = this._normalizeTopicKey(topic);
    const response = solis.query_responses[topicKey];

    if (!response) {
      return {
        success: true,
        response: `Archive query for "${topic}" returned 0 results. This topic may not be indexed, or access level is insufficient.`,
      };
    }

    this._recordHistory("data_archivist_solis", `query_${topicKey}`);

    return {
      success: true,
      npc: solis.name,
      topic: topicKey,
      response,
    };
  }

  _normalizeTopicKey(topic) {
    return topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  /**
   * Trigger ambient dialogue when player lingers near an NPC.
   * 30-second cooldown per NPC per player.
   */
  triggerAmbientDialogue(npcId, playerContext) {
    const npc = NPC_REGISTRY[npcId];
    if (!npc || !npc.ambient_lines) return;

    const cooldownKey = `${npcId}_${playerContext.playerId}`;
    const lastTrigger = this.ambientCooldowns.get(cooldownKey) || 0;
    const now = Date.now() / 1000;

    if (now - lastTrigger < AMBIENT_DIALOGUE_COOLDOWN_SECONDS) return;

    this.ambientCooldowns.set(cooldownKey, now);

    let lines = [...npc.ambient_lines];

    // Add faction-specific ambient lines if available
    if (npc.faction_specific_lines && playerContext.faction) {
      const factionLine = npc.faction_specific_lines[playerContext.faction];
      if (factionLine) lines = [factionLine, ...lines];
    }

    const line = lines[Math.floor(Math.random() * lines.length)];
    this._displayAmbientLine(npc, line);
  }

  /**
   * Apply dynamic template variables to a dialogue string.
   * Templates: {player_faction}, {faction_rank}, {zone_vrf}, {server_time}
   */
  applyTemplate(template, playerContext, zoneState) {
    return template
      .replace("{player_faction}", playerContext.faction || "Unaffiliated")
      .replace("{faction_rank}", playerContext.factionRank || 0)
      .replace("{zone_vrf}", (zoneState?.vrfCurrent || 0.8847).toFixed(4))
      .replace("{entropy_level}", (zoneState?.entropyLevel || 0.0).toFixed(3))
      .replace("{starting_credits}", "2,847")
      .replace("{vrf_constant}", "0.8847");
  }

  /**
   * Get faction-specific dialogue line for a given NPC and player faction.
   * Used in voiced cinematic scenes.
   */
  getFactionAwareLine(npcId, lineKey, playerFaction) {
    const npc = NPC_REGISTRY[npcId];
    if (!npc) return null;

    const factionLines = npc[`${lineKey}_by_faction`];
    if (factionLines && factionLines[playerFaction]) {
      return factionLines[playerFaction];
    }

    return npc[lineKey] || null;
  }

  _displayLine(npc, text) {
    // In production: dispatches to UI overlay system
    console.log(`[${npc.name}]: ${text}`);
  }

  _displayAmbientLine(npc, text) {
    console.log(`[AMBIENT - ${npc.name}]: ${text}`);
  }

  _displayAccessDenied(npc, playerContext) {
    const req = npc.access_requirement;
    console.log(
      `[System]: ${npc.name} requires ${req.faction} Rank ${req.min_rank}. ` +
      `Current: ${playerContext.faction || "none"} Rank ${playerContext.factionRank || 0}`
    );
  }

  _recordHistory(npcId, event) {
    this.dialogueHistory.push({ npcId, event, timestamp: Date.now() });
    if (this.dialogueHistory.length > MAX_DIALOGUE_HISTORY) {
      this.dialogueHistory.shift();
    }
  }

  endDialogue() {
    if (!this.activeDialogue) return;
    const { npc } = this.activeDialogue;
    if (npc.farewell_lines) {
      const line = npc.farewell_lines[Math.floor(Math.random() * npc.farewell_lines.length)];
      this._displayLine(npc, line);
    }
    this.activeDialogue = null;
  }
}

// =========================================
// Faction Standings Display
// =========================================

/**
 * Format faction standings for HUD display.
 * Updates every 6 hours (FACTION_UPDATE_INTERVAL_HOURS).
 */
function formatFactionStandings(standings, lastUpdated) {
  const nextUpdate = new Date(lastUpdated.getTime() + FACTION_UPDATE_INTERVAL_HOURS * 3600 * 1000);
  const minutesUntilUpdate = Math.floor((nextUpdate - Date.now()) / 60000);

  return {
    display: standings.map(s => ({
      name: s.faction_name,
      leader: s.leader,
      nodes: s.controlled_nodes,
      pct: s.node_percentage.toFixed(1) + "%",
    })),
    next_update_minutes: minutesUntilUpdate,
    update_interval_hours: FACTION_UPDATE_INTERVAL_HOURS,
  };
}

// =========================================
// Collectible Data Log Reader
// =========================================

const DATA_LOG_CONTENT = {
  "solis_archive_001": {
    series: "Solis Archive",
    entry: 1,
    narrator: "Data Archivist Solis",
    text: "Entry 001. The Unraveling. 2301-06-15. Dr. Lin Chen's field notes describe the initial Void entity emergence above K7-III. She records the sound frequency as approximately 0.8847 Hz — a measurement she describes as 'hauntingly precise.' I have cross-referenced 84 subsequent measurements of Void entity vocalizations. The frequency is always 0.8847 Hz, regardless of entity type or zone location. I have three possible interpretations. First: coincidence. Second: all Void entities share a common resonance that happens to match the universal VRF constant. Third: what Elder Rhae believes, which I will not summarize because he says it better than I can.",
  },
  "letters_pale_moon_003": {
    series: "Letters from the Pale Moon",
    entry: 3,
    narrator: "Technician Petra Solis (text)",
    date: "2301-05-14",
    text: "Hey everyone. The moon is beautiful tonight. There is a shimmer above K7-III that I keep trying to photograph but the cameras won't capture it right. Facility Manager Chen-Alvarez says the resonance sensors are picking up something at exactly 0.8847 on the scale. She has filed a report to station command. I told her it is probably the Kesslerium deposits doing something weird with the light. She gave me a look. The look that means she knows I am wrong and is too polite to say it. 4,200 credits a gram and the stuff still surprises everyone. Miss you all. Tell Dad the hydroponics are doing well up here. — Petra",
  },
  "null_sermon_003": {
    series: "Null's Sermons",
    entry: 3,
    narrator: "Phantom Null Osei (audio)",
    date: "unknown",
    text: "They tell you the number is 0.8847. They say it is a physics constant. The frequency at the edge of a Void Rift. Measured by Dr. Lin Chen in 2318. Very tidy. But the first Rift opened on 2301-06-15 at 03:47:22 UTC. Write those digits. 0.3 — 47 — 22. And look at Iron Sovereignty iconography. Their levy when the station opened: 47 credits. Iron Volley: 7 rounds at 47% each. Their internal designation for Marshal Volhari's birthdate month: month 4, day 7. 47. And this station. Docking ID NASD-1847. Session timeout 1,847 seconds. Chief Engineer Fenn's database pool: 37 connections, chosen because 37 plus 10 is 47. You are living inside a design. 0.8847 is not a measurement. It is a signature. The people in the Resonance Chamber know this. Ask yourself why that room is restricted. Ask yourself what Thessa Vorin actually built.",
  },
  "rhae_codex_audio": {
    series: "Unique Drops",
    narrator: "Elder Cassian Rhae (audio)",
    date: "2351-09-12",
    text: "Personal record. 2351-09-12. My 35th birthday was four days ago. I did not celebrate because I spent the day in the apex chamber. Today is different. The entity has been in its usual position for 7 days — immobile, facing away from the observation window, emitting the 0.8847 Hz resonance that they all emit. At 14:22 KST today, it turned. Faced the window directly. It did not attack. I have never seen a VE-Type IV demonstrate that level of directed attention toward a human observer. It resonated at 0.8847. Then at 0.8847 again but with an overtone I have not catalogued. Then it turned away. I do not know what this means. I know what I hope it means. I know that I have 36 more years if my genetics are average and I intend to use every one of them. — C. Rhae.",
  },
};

// =========================================
// Module Exports
// =========================================

module.exports = {
  DialogueEngine,
  NPC_REGISTRY,
  DATA_LOG_CONTENT,
  formatFactionStandings,
  DIALOGUE_PROXIMITY_METERS,
  SOLIS_MINIMUM_FACTION_RANK,
  SOLIS_REQUIRED_FACTION,
  FACTION_UPDATE_INTERVAL_HOURS,
  MAX_DIALOGUE_HISTORY,
};
