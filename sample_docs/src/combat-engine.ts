/**
 * Void Protocol — Combat Engine
 * Document ID: VP-SRC-COMBAT-001
 * Studio: Darkfield Interactive
 * Lead Designer: Seren Alyx Mowat
 *
 * Core combat calculation module. Runs server-side at 64 Hz.
 * All values must match VP-COMBAT-001 and VP-BALANCE-001.
 */

// =========================================
// Constants (from VP-BALANCE-001)
// =========================================

export const VRF_BASE = 0.8847;
export const VRF_CASCADE_THRESHOLD = 1.5;
export const VOID_RIFT_DAMAGE_COEFFICIENT = 1.4492;
export const ENTROPY_DECAY_RATE = 0.0337;
export const ENTROPY_DECAY_RATE_VOID_SPACE = 0.0674;
export const COMBAT_TICK_RATE_HZ = 64;
export const CASCADE_BASE_DAMAGE = 840;
export const VOID_RIFT_RADIUS_METERS = 18.5;
export const NPC_DIALOGUE_PROXIMITY_METERS = 3.7;
export const POSITION_VALIDATION_TOLERANCE_MS = 3.7;
export const SHIELD_REGEN_RATE_PER_SECOND = 47.3;
export const SHIELD_REGEN_DELAY_SECONDS = 4.0;
export const CRITICAL_HIT_BASE_CHANCE = 0.05;
export const CRITICAL_HIT_MULTIPLIER = 2.3;
export const SESSION_TIMEOUT_SECONDS = 1847;
export const MAX_PLAYER_LEVEL = 87;
export const STARTING_CREDITS = 2847;

// Cascade post-event modifiers
export const CASCADE_EDR_BOOST = 0.0042;
export const CASCADE_EDR_BOOST_DURATION_SECONDS = 18.5;

// VRE generation from combat
export const VRE_PER_BASIC_HIT = 3.7;
export const VRE_PER_ABILITY_HIT = 1.2;
export const VRE_PER_KILLING_BLOW = 14.7;
export const VRE_CASCADE_ACCIDENTAL_PENALTY = -47;

// =========================================
// Types
// =========================================

export type DamageType = 'kinetic' | 'void' | 'thermal' | 'neural';
export type VRFInteractionMode = 'A' | 'B' | 'C'; // A=amplified, B=neutral, C=harvesting
export type EntityState = 'dormant' | 'active' | 'frenzied';
export type StatusEffectId =
  | 'void_burn'
  | 'entropy_stun'
  | 'resonance_shield'
  | 'phase_shift'
  | 'void_marked'
  | 'entropy_slow'
  | 'fractured_armor'
  | 'cascade_resistant';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ZoneState {
  zoneId: string;
  vrfBase: number;
  vrfCurrent: number;
  entropyLevel: number;  // 0.0 to 1.0
  edrPerTick: number;
  tickRateHz: number;
  cascadeThreshold: number;
  cascadesThisSession: number;
  cascadeEdrBoostActive: boolean;
  cascadeEdrBoostTicksRemaining: number;
  tick: number;
}

export interface PlayerCombatState {
  playerId: string;
  classId: string;
  hp: number;
  hpMax: number;
  shield: number;
  shieldMax: number;
  vre: number;
  vreMax: number;
  vrfPersonal: number;
  statusEffects: ActiveStatusEffect[];
  position: Vector3;
  lastDamageTick: number;
  isDown: boolean;
  downedTicksRemaining: number;
  faction: string | null;
  factionBonuses: FactionBonuses;
}

export interface ActiveStatusEffect {
  effectId: StatusEffectId;
  ticksRemaining: number;
  magnitude?: number;
}

export interface FactionBonuses {
  vreCostReductionPct: number;
  cascadeThresholdBonus: number;
  weaponDamageBonusPct: number;
  shieldBonusFlat: number;
  critChanceBonusPct: number;
  movementSpeedBonusPct: number;
  stealthDurationBonusPct: number;
  vreGenerationBonusPct: number;
  cascadeThresholdPenalty: number;
}

export interface DamageResult {
  damageDealt: number;
  shieldDamage: number;
  hpDamage: number;
  isCritical: boolean;
  vrfContribution: number;
  edrContribution: number;
  statusEffectsApplied: StatusEffectId[];
}

export interface CombatEvent {
  type: 'ability_use' | 'basic_attack' | 'status_applied' | 'entity_death' | 'cascade';
  tick: number;
  sourceId: string;
  targetId?: string;
  abilityId?: string;
  damage?: number;
  damageType?: DamageType;
  isCritical?: boolean;
  vrfAtTime?: number;
  entropyAtTime?: number;
}

// =========================================
// VRF Calculation
// =========================================

/**
 * Calculate the final local VRF for a given player in a zone.
 * Formula: VRF_local = VRF_zone_base + VRF_player_gear + VRF_environmental_modifiers
 */
export function calculateLocalVRF(
  zoneState: ZoneState,
  playerGearVRFBonus: number,
  environmentalModifiers: number = 0
): number {
  return zoneState.vrfBase + playerGearVRFBonus + environmentalModifiers;
}

/**
 * Calculate VRF-based damage amplification using the Void Rift Damage Coefficient.
 * Formula: damage_final = damage_base × (1 + (VRF_local - VRF_BASE) × VRDC)
 * At base VRF (0.8847): multiplier = 1.0 (no bonus/penalty).
 * At VRF 1.0: multiplier ≈ 1.167 (+16.7%)
 * At VRF 0.7: multiplier ≈ 0.736 (-26.4%)
 */
export function calculateVRFAmplification(vrfLocal: number): number {
  return 1 + (vrfLocal - VRF_BASE) * VOID_RIFT_DAMAGE_COEFFICIENT;
}

/**
 * Check if a cascade should trigger and process it.
 * Returns updated zone state and cascade damage value (0 if no cascade).
 */
export function checkAndProcessCascade(
  zone: ZoneState,
  effectiveCascadeThreshold: number
): { zone: ZoneState; cascadeDamage: number; triggered: boolean } {
  if (zone.vrfCurrent < effectiveCascadeThreshold) {
    return { zone, cascadeDamage: 0, triggered: false };
  }

  const cascadeDamage = (zone.vrfCurrent - 1.0) * CASCADE_BASE_DAMAGE;

  const updatedZone: ZoneState = {
    ...zone,
    vrfCurrent: VRF_BASE,
    cascadesThisSession: zone.cascadesThisSession + 1,
    cascadeEdrBoostActive: true,
    cascadeEdrBoostTicksRemaining: Math.floor(CASCADE_EDR_BOOST_DURATION_SECONDS * COMBAT_TICK_RATE_HZ),
  };

  return { zone: updatedZone, cascadeDamage, triggered: true };
}

// =========================================
// Damage Calculation
// =========================================

/**
 * Calculate final damage dealt.
 * Applies VRF amplification, critical hits, resistances, and armor.
 */
export function calculateDamage(params: {
  baseDamage: number;
  damageType: DamageType;
  vrfMode: VRFInteractionMode;
  vrfLocal: number;
  critChance: number;
  targetResistancePct: number;
  targetArmorFlat: number;
  targetHasVoidMark: boolean;
}): { finalDamage: number; isCritical: boolean } {
  const {
    baseDamage,
    damageType,
    vrfMode,
    vrfLocal,
    critChance,
    targetResistancePct,
    targetArmorFlat,
    targetHasVoidMark,
  } = params;

  let damage = baseDamage;

  // VRF amplification (Mode A only)
  if (vrfMode === 'A') {
    damage *= calculateVRFAmplification(vrfLocal);
  }
  // Mode B: no VRF modification
  // Mode C: handled separately (VRF harvesting reduces zone VRF instead)

  // Void Mark amplification (void damage only)
  if (targetHasVoidMark && damageType === 'void') {
    damage *= 1.40;
  }

  // Critical hit
  const isCritical = Math.random() < critChance;
  if (isCritical) {
    damage *= CRITICAL_HIT_MULTIPLIER;
  }

  // Apply resistance (percentage reduction)
  damage *= (1 - Math.min(targetResistancePct, 0.75));

  // Apply armor (flat reduction)
  damage = Math.max(0, damage - targetArmorFlat);

  return { finalDamage: Math.floor(damage), isCritical };
}

/**
 * Apply damage to a player or entity, distributing between shield and HP.
 */
export function applyDamageToTarget(
  target: PlayerCombatState,
  damage: number,
  tick: number
): PlayerCombatState {
  let remainingDamage = damage;
  let shieldAfter = target.shield;
  let hpAfter = target.hp;

  if (shieldAfter > 0) {
    const shieldDamage = Math.min(remainingDamage, shieldAfter);
    shieldAfter -= shieldDamage;
    remainingDamage -= shieldDamage;
  }

  if (remainingDamage > 0) {
    hpAfter -= remainingDamage;
  }

  const isDown = hpAfter <= 0;

  return {
    ...target,
    shield: Math.max(0, shieldAfter),
    hp: Math.max(0, hpAfter),
    lastDamageTick: tick,
    isDown,
    downedTicksRemaining: isDown ? Math.floor(47 * COMBAT_TICK_RATE_HZ) : target.downedTicksRemaining,
  };
}

// =========================================
// Entropy System
// =========================================

/**
 * Update zone entropy level for one tick.
 * Returns updated zone state.
 */
export function updateEntropyTick(
  zone: ZoneState,
  combatActiveMultiplier: number
): ZoneState {
  let edr = zone.edrPerTick;

  // Apply post-cascade boost
  if (zone.cascadeEdrBoostActive) {
    edr += CASCADE_EDR_BOOST;
  }

  let newEntropy = zone.entropyLevel;
  if (combatActiveMultiplier > 0) {
    newEntropy += edr * combatActiveMultiplier;
  } else {
    // No combat: entropy decreases
    newEntropy -= edr;
  }

  newEntropy = Math.max(0, Math.min(1.0, newEntropy));

  let cascadeEdrBoostTicksRemaining = zone.cascadeEdrBoostTicksRemaining;
  let cascadeEdrBoostActive = zone.cascadeEdrBoostActive;
  if (cascadeEdrBoostActive) {
    cascadeEdrBoostTicksRemaining -= 1;
    if (cascadeEdrBoostTicksRemaining <= 0) {
      cascadeEdrBoostActive = false;
      cascadeEdrBoostTicksRemaining = 0;
    }
  }

  return {
    ...zone,
    entropyLevel: newEntropy,
    tick: zone.tick + 1,
    cascadeEdrBoostActive,
    cascadeEdrBoostTicksRemaining,
  };
}

/**
 * Get enemy state based on current entropy level and zone VRF.
 */
export function getEnemyStateFromEntropy(
  entropyLevel: number,
  zoneVRF: number,
  enemyDefaultAggressive: boolean
): EntityState {
  if (entropyLevel >= 0.6) return 'frenzied';
  if (enemyDefaultAggressive || zoneVRF >= 0.95) return 'active';
  return 'dormant';
}

/**
 * Entropy effect on players (debuffs above certain thresholds).
 */
export function getPlayerEntropyEffect(entropyLevel: number): {
  vreRegenReductionPct: number;
  abilityCostIncreasePct: number;
  voidDamageReceivedIncreasePct: number;
  vreRegenHalted: boolean;
} {
  if (entropyLevel >= 0.9) {
    return {
      vreRegenReductionPct: 0,
      abilityCostIncreasePct: 30,
      voidDamageReceivedIncreasePct: 10,
      vreRegenHalted: true,
    };
  }
  if (entropyLevel >= 0.7) {
    return {
      vreRegenReductionPct: 0,
      abilityCostIncreasePct: 15,
      voidDamageReceivedIncreasePct: 10,
      vreRegenHalted: false,
    };
  }
  if (entropyLevel >= 0.5) {
    return {
      vreRegenReductionPct: 22,
      abilityCostIncreasePct: 0,
      voidDamageReceivedIncreasePct: 0,
      vreRegenHalted: false,
    };
  }
  return {
    vreRegenReductionPct: 0,
    abilityCostIncreasePct: 0,
    voidDamageReceivedIncreasePct: 0,
    vreRegenHalted: false,
  };
}

// =========================================
// Shield Regeneration
// =========================================

/**
 * Process shield regeneration for one tick.
 * Shield regenerates at 47.3 HP/sec after 4.0 seconds of no damage.
 */
export function processShieldRegen(
  player: PlayerCombatState,
  currentTick: number
): PlayerCombatState {
  if (player.shield >= player.shieldMax) return player;
  if (player.isDown) return player;

  const ticksSinceLastDamage = currentTick - player.lastDamageTick;
  const secondsSinceLastDamage = ticksSinceLastDamage / COMBAT_TICK_RATE_HZ;

  if (secondsSinceLastDamage < SHIELD_REGEN_DELAY_SECONDS) return player;

  const regenPerTick = SHIELD_REGEN_RATE_PER_SECOND / COMBAT_TICK_RATE_HZ;
  const newShield = Math.min(player.shieldMax, player.shield + regenPerTick);

  return { ...player, shield: newShield };
}

// =========================================
// VRE (Void Resonance Energy)
// =========================================

/**
 * Generate VRE from a combat action.
 */
export function generateVRE(
  player: PlayerCombatState,
  source: 'basic_hit' | 'ability_hit' | 'killing_blow' | 'cascade_accidental',
  factionBonusMultiplier: number = 1.0
): PlayerCombatState {
  const vreGain: Record<typeof source, number> = {
    basic_hit: VRE_PER_BASIC_HIT,
    ability_hit: VRE_PER_ABILITY_HIT,
    killing_blow: VRE_PER_KILLING_BLOW,
    cascade_accidental: VRE_CASCADE_ACCIDENTAL_PENALTY,
  };

  const gain = vreGain[source] * factionBonusMultiplier;
  const newVRE = Math.max(0, Math.min(player.vreMax, player.vre + gain));

  return { ...player, vre: newVRE };
}

// =========================================
// Status Effects
// =========================================

const STATUS_EFFECT_DURATIONS_TICKS: Record<StatusEffectId, number> = {
  void_burn: Math.floor(8.4 * COMBAT_TICK_RATE_HZ),
  entropy_stun: Math.floor(1.4 * COMBAT_TICK_RATE_HZ),
  resonance_shield: -1, // variable
  phase_shift: Math.floor(0.8 * COMBAT_TICK_RATE_HZ),
  void_marked: Math.floor(12 * COMBAT_TICK_RATE_HZ),
  entropy_slow: Math.floor(6 * COMBAT_TICK_RATE_HZ),
  fractured_armor: Math.floor(10 * COMBAT_TICK_RATE_HZ),
  cascade_resistant: Math.floor(20 * COMBAT_TICK_RATE_HZ),
};

export function applyStatusEffect(
  target: PlayerCombatState,
  effectId: StatusEffectId,
  customDurationTicks?: number,
  magnitude?: number
): PlayerCombatState {
  const durationTicks = customDurationTicks ?? STATUS_EFFECT_DURATIONS_TICKS[effectId];

  const existingIndex = target.statusEffects.findIndex(e => e.effectId === effectId);
  const newEffect: ActiveStatusEffect = {
    effectId,
    ticksRemaining: durationTicks,
    magnitude,
  };

  const statusEffects = existingIndex >= 0
    ? target.statusEffects.map((e, i) => i === existingIndex ? newEffect : e)
    : [...target.statusEffects, newEffect];

  return { ...target, statusEffects };
}

export function tickStatusEffects(target: PlayerCombatState): {
  target: PlayerCombatState;
  expiredEffects: StatusEffectId[];
  voidBurnDamage: number;
} {
  let voidBurnDamage = 0;
  const expiredEffects: StatusEffectId[] = [];

  const updatedEffects = target.statusEffects
    .map(effect => {
      if (effect.effectId === 'void_burn') {
        // 37 void damage per second = 37/64 per tick
        voidBurnDamage += 37 / COMBAT_TICK_RATE_HZ;
      }
      return { ...effect, ticksRemaining: effect.ticksRemaining - 1 };
    })
    .filter(effect => {
      if (effect.ticksRemaining <= 0) {
        expiredEffects.push(effect.effectId);
        return false;
      }
      return true;
    });

  return {
    target: { ...target, statusEffects: updatedEffects },
    expiredEffects,
    voidBurnDamage,
  };
}

export function hasStatusEffect(player: PlayerCombatState, effectId: StatusEffectId): boolean {
  return player.statusEffects.some(e => e.effectId === effectId);
}

// =========================================
// Position Validation (anti-cheat)
// =========================================

/**
 * Validate player position against maximum movement speed.
 * Server validates at 20 Hz with 3.7 m/s tolerance (above max player speed of 3.4 m/s).
 * Returns true if position is valid.
 */
export function validatePosition(
  previousPosition: Vector3,
  newPosition: Vector3,
  elapsedSeconds: number,
  hasPhaseShift: boolean
): boolean {
  const dx = newPosition.x - previousPosition.x;
  const dy = newPosition.y - previousPosition.y;
  const dz = newPosition.z - previousPosition.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Phase Breaker in Void Step moves at 4.8 m/s — validated server-side
  const maxSpeed = hasPhaseShift ? 5.5 : POSITION_VALIDATION_TOLERANCE_MS;
  const maxDistance = maxSpeed * elapsedSeconds;

  return distance <= maxDistance;
}

// =========================================
// Mowat's Folly passive (special case)
// =========================================

let mowatsFollyShotCounter: Map<string, number> = new Map();

/**
 * Process Mowat's Folly passive: every 7th shot triggers a cascade.
 * Cascade damage = 0.8847 × weapon_power in 3.7m radius.
 */
export function processMowatsFollyPassive(
  playerId: string,
  weaponPower: number,
  targetPosition: Vector3,
  allEntitiesInZone: Array<{ id: string; position: Vector3 }>
): { triggered: boolean; affectedEntityIds: string[]; cascadeDamage: number } {
  const currentCount = (mowatsFollyShotCounter.get(playerId) ?? 0) + 1;
  mowatsFollyShotCounter.set(playerId, currentCount % 7);

  if (currentCount % 7 !== 0) {
    return { triggered: false, affectedEntityIds: [], cascadeDamage: 0 };
  }

  // 7th shot: cascade
  const cascadeDamage = VRF_BASE * weaponPower; // 0.8847 × weapon power
  const radius = NPC_DIALOGUE_PROXIMITY_METERS; // 3.7 meters (reused constant — intentional design)

  const affectedEntityIds = allEntitiesInZone
    .filter(entity => {
      const dx = entity.position.x - targetPosition.x;
      const dy = entity.position.y - targetPosition.y;
      const dz = entity.position.z - targetPosition.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz) <= radius;
    })
    .map(e => e.id);

  return { triggered: true, affectedEntityIds, cascadeDamage };
}

// =========================================
// Faction bonuses factory
// =========================================

export function getFactionBonuses(factionId: string | null): FactionBonuses {
  const defaults: FactionBonuses = {
    vreCostReductionPct: 0,
    cascadeThresholdBonus: 0,
    weaponDamageBonusPct: 0,
    shieldBonusFlat: 0,
    critChanceBonusPct: 0,
    movementSpeedBonusPct: 0,
    stealthDurationBonusPct: 0,
    vreGenerationBonusPct: 0,
    cascadeThresholdPenalty: 0,
  };

  switch (factionId) {
    case 'voidborn_conclave':
      return { ...defaults, vreCostReductionPct: 8, cascadeThresholdBonus: 0.1 };
    case 'iron_sovereignty':
      return { ...defaults, weaponDamageBonusPct: 6, shieldBonusFlat: 340, critChanceBonusPct: 2.3 };
    case 'the_fractured':
      return {
        ...defaults,
        movementSpeedBonusPct: 8,
        stealthDurationBonusPct: 40,
        vreGenerationBonusPct: 11,
        cascadeThresholdPenalty: -0.1,
      };
    default:
      return defaults;
  }
}

/**
 * Calculate effective cascade threshold for a player given faction bonuses.
 */
export function getEffectiveCascadeThreshold(factionBonuses: FactionBonuses): number {
  return VRF_CASCADE_THRESHOLD + factionBonuses.cascadeThresholdBonus + factionBonuses.cascadeThresholdPenalty;
}
