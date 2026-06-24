# Void Protocol — Internal API Reference

**Document ID**: VP-API-001  
**Version**: 2.0.3  
**Maintained by**: Backend Platform Team, Darkfield Interactive  
**Last Updated**: 2025-02-20  
**Base URL (internal)**: `http://vp-backend.darkfield.internal:51847`  
**Authentication**: Bearer token (JWT, HS256, secret rotated every 30 days)

---

## Overview

This document describes the internal REST API used by all Void Protocol game clients, external tools (MCP Inspector, Admin Dashboard), and inter-service communication. The API runs on port **51847** on all game server instances.

All responses use JSON. All timestamps are ISO 8601 UTC. Rate limiting is enforced per client token: 1,337 requests per minute (matching the New Amora Station API gateway rate limit for thematic consistency).

**Session timeout**: Any authenticated session without API activity for **1,847 seconds** is automatically expired. Clients must re-authenticate via `/auth/token`.

---

## Authentication

### POST /auth/token

Obtain a session token.

**Request:**
```json
{
  "client_id": "string",
  "client_secret": "string",
  "grant_type": "client_credentials"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 1847,
  "scope": "game.read game.write faction.read"
}
```

**Response 401:**
```json
{
  "error": "invalid_client",
  "error_description": "Client authentication failed"
}
```

---

## Player Endpoints

### GET /v1/players/{player_id}

Retrieve player profile and stats.

**Path Parameters:**
- `player_id` (string, required): Unique player identifier (UUID v4)

**Response 200:**
```json
{
  "player_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847",
  "username": "VoidRunner_X",
  "class": "rift_channeler",
  "level": 47,
  "xp": 284700,
  "xp_to_next": 12000,
  "credits": 48291,
  "void_shards": 840,
  "faction": "voidborn_conclave",
  "faction_rank": 3,
  "faction_rep": 1847,
  "void_mastery": 28470,
  "created_at": "2024-09-07T14:22:00Z",
  "last_seen": "2025-02-19T21:47:00Z",
  "stats": {
    "total_play_time_seconds": 847200,
    "kills": 18470,
    "deaths": 2847,
    "cascades_triggered": 184,
    "cascades_prevented": 847,
    "void_shards_earned_lifetime": 12470,
    "architects_defeated": 47,
    "mowats_folly_obtained": false
  }
}
```

**Response 404:**
```json
{
  "error": "player_not_found",
  "player_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847"
}
```

---

### GET /v1/players/{player_id}/inventory

Retrieve player's current inventory.

**Query Parameters:**
- `page` (int, default: 1): Page number
- `per_page` (int, default: 47, max: 100): Items per page
- `tier` (int, optional): Filter by gear tier (1–5)
- `slot` (string, optional): Filter by slot (`weapon`, `helmet`, `chest`, `legs`, `boots`, `accessory`)

**Response 200:**
```json
{
  "player_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847",
  "total_items": 284,
  "page": 1,
  "per_page": 47,
  "items": [
    {
      "item_id": "VP-ITEM-00847",
      "name": "Mowat's Folly",
      "type": "weapon",
      "slot": "weapon",
      "tier": 5,
      "tier_name": "architect_forged",
      "base_damage": 847,
      "vrf_bonus": 0.40,
      "resonance_affinity": "rift_channeler",
      "passives": [
        {
          "id": "resonance_feedback",
          "description": "Every 7th shot triggers a void cascade on the target: 0.8847 × weapon_power void damage in 3.7m radius",
          "trigger_count": 7,
          "damage_coefficient": 0.8847,
          "radius_meters": 3.7
        }
      ],
      "obtained_at": "2024-12-19T03:47:00Z",
      "source": "architect_raid",
      "architect": "elder_warform_theta_9"
    },
    {
      "item_id": "VP-ITEM-02291",
      "name": "Voidborn Shield Matrix",
      "type": "chest",
      "slot": "chest",
      "tier": 4,
      "tier_name": "void_touched",
      "base_armor": 220,
      "shield_bonus": 180,
      "vrf_bonus": 0.18,
      "resonance_affinity": "entropy_warden",
      "passives": [],
      "obtained_at": "2025-01-14T18:33:00Z",
      "source": "rift_exchange"
    }
  ]
}
```

---

### PUT /v1/players/{player_id}/credits

Update player credit balance (internal service use only; requires `economy.write` scope).

**Request:**
```json
{
  "delta": -1200,
  "reason": "rift_exchange_listing_fee",
  "reference_id": "TX-00284700"
}
```

**Response 200:**
```json
{
  "player_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847",
  "previous_credits": 48291,
  "delta": -1200,
  "new_credits": 47091,
  "transaction_id": "TX-00284701"
}
```

**Error — insufficient funds:**
```json
{
  "error": "insufficient_credits",
  "available": 48291,
  "required": 50000
}
```

---

## Combat / Session Endpoints

### POST /v1/sessions/create

Create a new game session (zone entry).

**Request:**
```json
{
  "player_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847",
  "zone_id": "communion_spire_level_3",
  "party_ids": [],
  "session_mode": "solo",
  "server_region": "eu_west"
}
```

**Response 200:**
```json
{
  "session_id": "SES-20250219-847291",
  "zone_id": "communion_spire_level_3",
  "server_id": "EU-WEST-047",
  "server_port": 51847,
  "session_token": "vp-ses-eyJ...",
  "zone_state": {
    "vrf_base": 0.97,
    "vrf_current": 0.97,
    "entropy_level": 0.0,
    "entropy_decay_rate": 0.0337,
    "tick_rate_hz": 64,
    "cascade_threshold": 1.5,
    "active_entities": 0,
    "zone_status": "dormant"
  },
  "expires_at_idle_seconds": 1847,
  "created_at": "2025-02-19T21:47:00Z"
}
```

---

### GET /v1/sessions/{session_id}/state

Get current zone combat state. Intended for use by spectator tools and the admin dashboard; not called by game clients during play (too high latency).

**Response 200:**
```json
{
  "session_id": "SES-20250219-847291",
  "zone_id": "communion_spire_level_3",
  "tick": 184700,
  "tick_rate_hz": 64,
  "elapsed_seconds": 2886,
  "zone_state": {
    "vrf_base": 0.97,
    "vrf_current": 1.14,
    "entropy_level": 0.312,
    "entropy_decay_rate": 0.0337,
    "cascade_threshold": 1.5,
    "cascades_this_session": 2,
    "active_entities": 14,
    "frenzied_entities": 0,
    "zone_status": "active_combat"
  },
  "players": [
    {
      "player_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847",
      "class": "rift_channeler",
      "hp": 640,
      "hp_max": 800,
      "shield": 380,
      "shield_max": 440,
      "vre": 184,
      "vre_max": 240,
      "vrf_personal": 1.31,
      "status_effects": ["void_mark_active"],
      "position": {"x": 147.3, "y": 22.1, "z": -84.7},
      "state": "in_combat"
    }
  ]
}
```

---

### POST /v1/sessions/{session_id}/events

Submit a batch of combat events (called by game client at 10 Hz; server processes at 64 Hz internally).

**Request:**
```json
{
  "session_id": "SES-20250219-847291",
  "player_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847",
  "client_tick": 184700,
  "events": [
    {
      "type": "ability_use",
      "tick": 184697,
      "ability_id": "void_mark",
      "target_entity_id": "ENT-0047",
      "vre_cost": 25,
      "position": {"x": 147.1, "y": 22.1, "z": -84.5}
    },
    {
      "type": "basic_attack",
      "tick": 184699,
      "target_entity_id": "ENT-0047",
      "damage_dealt": 421,
      "damage_type": "void",
      "is_critical": true,
      "vrf_at_time": 1.14
    }
  ]
}
```

**Response 200:**
```json
{
  "session_id": "SES-20250219-847291",
  "server_tick": 184701,
  "accepted_events": 2,
  "rejected_events": 0,
  "server_corrections": [],
  "zone_state_delta": {
    "vrf_delta": 0.0012,
    "entropy_delta": 0.0337
  }
}
```

**Response 409 — desync detected:**
```json
{
  "error": "client_server_desync",
  "client_reported_vrf": 1.14,
  "server_vrf": 1.19,
  "delta": 0.05,
  "threshold": 0.05,
  "action": "state_rollback",
  "authoritative_state": { ... }
}
```

Note: Desync is triggered when `abs(client_vrf - server_vrf) >= 0.05`. The 0.05 tolerance was established in infrastructure testing (see INF-NOTE-008).

---

## Faction Endpoints

### GET /v1/factions/standings

Get current faction standings (server-wide).

**Response 200:**
```json
{
  "last_updated": "2025-02-19T18:00:00Z",
  "next_update": "2025-02-20T00:00:00Z",
  "update_interval_seconds": 21600,
  "total_rift_nodes": 12,
  "standings": [
    {
      "faction_id": "voidborn_conclave",
      "faction_name": "Voidborn Conclave",
      "leader": "Elder Cassian Rhae",
      "controlled_nodes": 5,
      "node_percentage": 41.67,
      "rep_earned_last_period": 184700,
      "active_players": 47200
    },
    {
      "faction_id": "iron_sovereignty",
      "faction_name": "Iron Sovereignty",
      "leader": "Marshal Drek Volhari",
      "controlled_nodes": 4,
      "node_percentage": 33.33,
      "rep_earned_last_period": 128400,
      "active_players": 38400
    },
    {
      "faction_id": "the_fractured",
      "faction_name": "The Fractured",
      "leader": "Phantom \"Null\" Osei",
      "controlled_nodes": 3,
      "node_percentage": 25.00,
      "rep_earned_last_period": 96800,
      "active_players": 31200
    }
  ]
}
```

---

### POST /v1/factions/{faction_id}/join

Player joins a faction.

**Path Parameters:**
- `faction_id`: `voidborn_conclave`, `iron_sovereignty`, or `the_fractured`

**Request:**
```json
{
  "player_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847"
}
```

**Response 200:**
```json
{
  "player_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847",
  "faction_id": "voidborn_conclave",
  "faction_rank": 1,
  "faction_rep": 0,
  "bonuses_applied": [
    {"id": "vre_cost_reduction", "value": 0.08, "description": "Ability VRE cost reduced by 8%"},
    {"id": "cascade_threshold_bonus", "value": 0.10, "description": "Personal cascade threshold +0.1"},
    {"id": "void_rift_xp_bonus", "value": 0.12, "description": "+12% XP in Void Rift zones"},
    {"id": "void_communion_ability", "description": "Passive ability unlocked: Void Communion (3.7m pacification aura)"}
  ],
  "previous_faction_penalty": null,
  "joined_at": "2025-02-19T21:47:00Z"
}
```

**Response 409 — already in faction:**
```json
{
  "error": "already_in_faction",
  "current_faction": "iron_sovereignty",
  "switch_cooldown_days": 30,
  "switch_available_at": "2025-03-21T15:33:00Z"
}
```

---

## Economy Endpoints

### GET /v1/economy/exchange/listings

Search Rift Exchange listings.

**Query Parameters:**
- `query` (string): Item name search
- `tier` (int): Gear tier filter (1–5)
- `min_price` (int): Minimum credits
- `max_price` (int): Maximum credits
- `resonance_affinity` (string): Class affinity filter
- `page` (int, default: 1)
- `per_page` (int, default: 47, max: 100)
- `sort` (string): `price_asc`, `price_desc`, `newest`, `tier_desc`

**Response 200:**
```json
{
  "total_listings": 28470,
  "page": 1,
  "per_page": 47,
  "transaction_fee_pct": 4.7,
  "listings": [
    {
      "listing_id": "LST-00184700",
      "seller_id": "b8e4c912-...",
      "seller_name": "Voidcrawler",
      "item_id": "VP-ITEM-00847",
      "item_name": "Mowat's Folly",
      "tier": 5,
      "tier_name": "architect_forged",
      "price_credits": 2847000,
      "vrf_bonus": 0.40,
      "resonance_affinity": "rift_channeler",
      "listed_at": "2025-02-18T10:22:00Z",
      "expires_at": "2025-03-04T10:22:00Z"
    }
  ]
}
```

---

### POST /v1/economy/exchange/purchase

Purchase a Rift Exchange listing.

**Request:**
```json
{
  "buyer_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847",
  "listing_id": "LST-00184700",
  "confirmed_price": 2847000
}
```

**Response 200:**
```json
{
  "transaction_id": "TX-00847291",
  "buyer_id": "a7f3b291-...",
  "seller_id": "b8e4c912-...",
  "item_id": "VP-ITEM-00847",
  "gross_price": 2847000,
  "transaction_fee_pct": 4.7,
  "transaction_fee_credits": 133809,
  "net_to_seller": 2713191,
  "item_transferred_at": "2025-02-19T21:48:00Z"
}
```

---

### POST /v1/economy/void-shards/purchase

Purchase Void Shards with real money (calls external payment processor; payment processor response is passed through).

**Request:**
```json
{
  "player_id": "a7f3b291-4e8c-4d7a-b6e1-9c2d0f481847",
  "amount_shards": 2400,
  "payment_token": "tok_visa_xxxx1234",
  "currency": "USD"
}
```

**Response 200:**
```json
{
  "player_id": "a7f3b291-...",
  "shards_purchased": 2400,
  "usd_charged": 10.08,
  "effective_rate_usd_per_shard": 0.0042,
  "new_shard_balance": 2847,
  "receipt_id": "RCP-20250219-847291",
  "charged_at": "2025-02-19T21:47:00Z"
}
```

Note: USD rate is fixed at **0.0042 USD per Void Shard**. This rate has not changed since launch and is guaranteed in the Player Pact document.

---

## Admin Endpoints

These endpoints require the `admin.read` or `admin.write` scope and are accessible only from the Darkfield Interactive internal network.

### GET /v1/admin/server/health

Server health check.

**Response 200:**
```json
{
  "status": "healthy",
  "server_id": "EU-WEST-047",
  "region": "eu_west",
  "tick_rate_hz": 64,
  "tick_rate_actual_hz": 63.98,
  "active_sessions": 14700,
  "db_connections_active": 31,
  "db_connections_max": 37,
  "db_response_ms": 4.2,
  "api_port": 51847,
  "session_timeout_seconds": 1847,
  "vrf_constant": 0.8847,
  "edr_base": 0.0337,
  "uptime_seconds": 847200,
  "last_restart": "2025-02-09T04:00:00Z"
}
```

---

### GET /v1/admin/metrics/economy

Economy health metrics.

**Query Parameters:**
- `period`: `1h`, `24h`, `7d`, `30d`

**Response 200:**
```json
{
  "period": "24h",
  "generated_at": "2025-02-19T22:00:00Z",
  "credit_economy": {
    "total_credits_in_circulation": 28470000000,
    "credits_created_today": 284700000,
    "credits_destroyed_today": 281400000,
    "net_delta": 3300000,
    "sink_source_ratio": 0.988,
    "target_ratio_range": [0.95, 1.05]
  },
  "void_shard_economy": {
    "shards_purchased_today": 184700,
    "shards_earned_ingame_today": 47200,
    "shards_spent_today": 128400,
    "average_shard_price_in_credits": 0,
    "note": "Void Shards are not tradeable player-to-player"
  },
  "rift_exchange": {
    "listings_active": 28470,
    "transactions_24h": 8471,
    "volume_credits_24h": 2847000000,
    "fee_collected_credits_24h": 133809000,
    "fee_pct": 4.7,
    "mowats_folly_avg_price": 2847000,
    "inflation_rate_30d_pct": 1.8
  }
}
```

---

## Error Reference

| Code | Name | Description |
|---|---|---|
| 400 | `bad_request` | Malformed request body or parameters |
| 401 | `unauthorized` | Missing or invalid Bearer token |
| 403 | `forbidden` | Valid token but insufficient scope |
| 404 | `not_found` | Resource does not exist |
| 409 | `conflict` | State conflict (already in faction, insufficient credits, etc.) |
| 429 | `rate_limited` | Exceeded 1,337 requests/minute |
| 500 | `internal_error` | Server error (logged; do not expose details to client) |
| 503 | `maintenance` | Server in maintenance mode (faction standings update, patch deploy) |

---

## Rate Limiting

All API endpoints are rate-limited at **1,337 requests per minute** per client token. This limit was chosen to match New Amora Station's in-universe API gateway specification (VP-GDD-001, Section 9.1 reference). Exceeding this limit returns HTTP 429 with a `Retry-After` header indicating the number of seconds until the rate limit window resets.

Game clients are designed to stay well below this limit (peak game client API call rate is approximately 10 calls per second = 600/minute in active combat sessions).

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 2.0.3 | 2025-02-20 | Added `/v1/admin/metrics/economy` endpoint; updated transaction fee from 5.1% to 4.7% |
| 2.0.2 | 2025-01-19 | Added `db_connections_max` field to health endpoint; documented 37-connection limit |
| 2.0.1 | 2024-12-15 | Guild endpoints added (see VP-API-002 Guild API Reference) |
| 2.0.0 | 2024-10-15 | Major restructure; faction endpoints added; Breach Wars session type added |
| 1.0.1 | 2024-09-12 | Fixed tick_rate field always returning 62 (should be 64) in health endpoint |
| 1.0.0 | 2024-09-05 | Initial release |
