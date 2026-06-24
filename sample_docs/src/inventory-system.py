"""
Void Protocol — Inventory System
Document ID: VP-SRC-INVENTORY-001
Studio: Darkfield Interactive

Handles player inventory, Rift Exchange listings, and item transactions.
Server-side logic; all state is authoritative server state.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional
from enum import Enum
import uuid
import math


# =========================================
# Constants (from VP-BALANCE-001)
# =========================================

STARTING_CREDITS: int = 2847
MAX_ACTIVE_LISTINGS_PER_PLAYER: int = 50
RIFT_EXCHANGE_TRANSACTION_FEE_PCT: float = 4.7
RIFT_EXCHANGE_LISTING_FEE_PCT: float = 1.0
RIFT_EXCHANGE_LISTING_MIN_FEE: int = 5
LISTING_EXPIRY_DAYS: int = 14
VRF_BASE: float = 0.8847
VOID_SHARD_USD_RATE: float = 0.0042
VOID_MASTERY_EDR_REDUCTION_MILESTONE: int = 50_000
VOID_MASTERY_EDR_REDUCTION_VALUE: float = 0.0042
RESONANCE_AFFINITY_BONUS_PCT: float = 14.7
MOWATS_FOLLY_ITEM_ID: str = "VP-ITEM-00847"
ARCHITECT_FORGED_TIER: int = 5
VOID_TOUCHED_TIER: int = 4


class DamageType(Enum):
    KINETIC = "kinetic"
    VOID = "void"
    THERMAL = "thermal"
    NEURAL = "neural"


class ItemType(Enum):
    WEAPON = "weapon"
    ARMOR = "armor"
    ACCESSORY = "accessory"
    CONSUMABLE = "consumable"
    COLLECTIBLE = "collectible"
    MATERIAL = "material"
    COSMETIC = "cosmetic"


class ArmorSlot(Enum):
    HELMET = "helmet"
    CHEST = "chest"
    LEGS = "legs"
    BOOTS = "boots"
    ACCESSORY = "accessory"
    RESONANCE_CRYSTAL = "resonance_crystal"


# =========================================
# Data Models
# =========================================

@dataclass
class ItemPassive:
    passive_id: str
    description: str
    parameters: dict = field(default_factory=dict)


@dataclass
class Item:
    item_id: str
    name: str
    item_type: ItemType
    tier: int  # 1-5
    vrf_bonus: float
    resonance_affinity: Optional[str]  # class id or None
    lore: str = ""
    passives: list[ItemPassive] = field(default_factory=list)
    untradeable: bool = False
    sell_price_credits: int = 0

    # Weapon-specific
    base_damage: Optional[int] = None
    damage_type: Optional[DamageType] = None

    # Armor-specific
    base_armor: Optional[int] = None
    shield_bonus: int = 0
    slot: Optional[ArmorSlot] = None

    def get_resonance_affinity_bonus(self, player_class: str) -> float:
        """Returns 14.7% bonus if item affinity matches player class."""
        if self.resonance_affinity == player_class:
            return RESONANCE_AFFINITY_BONUS_PCT / 100.0
        return 0.0

    def is_legendary(self) -> bool:
        return self.tier == ARCHITECT_FORGED_TIER

    def __repr__(self) -> str:
        return f"Item({self.item_id}: {self.name!r}, T{self.tier}, VRF+{self.vrf_bonus})"


@dataclass
class PlayerInventory:
    player_id: str
    items: list[Item] = field(default_factory=list)
    credits: int = STARTING_CREDITS
    void_shards: int = 0
    void_mastery: int = 0
    max_items: int = 500

    def add_item(self, item: Item) -> bool:
        """Add an item. Returns False if inventory is full."""
        if len(self.items) >= self.max_items:
            return False
        self.items.append(item)
        return True

    def remove_item(self, item_id: str) -> Optional[Item]:
        """Remove and return an item by ID, or None if not found."""
        for i, item in enumerate(self.items):
            if item.item_id == item_id:
                return self.items.pop(i)
        return None

    def has_item(self, item_id: str) -> bool:
        return any(item.item_id == item_id for item in self.items)

    def get_item(self, item_id: str) -> Optional[Item]:
        return next((item for item in self.items if item.item_id == item_id), None)

    def total_vrf_bonus(self) -> float:
        """Sum of all equipped gear's VRF bonuses (assumes all items are equipped for simplicity)."""
        return sum(item.vrf_bonus for item in self.items)

    def has_mowats_folly(self) -> bool:
        return self.has_item(MOWATS_FOLLY_ITEM_ID)

    def void_mastery_edr_reduction(self) -> float:
        """EDR reduction from Void Mastery milestone at 50,000 points."""
        if self.void_mastery >= VOID_MASTERY_EDR_REDUCTION_MILESTONE:
            return VOID_MASTERY_EDR_REDUCTION_VALUE
        return 0.0

    def spend_credits(self, amount: int) -> bool:
        """Attempt to spend credits. Returns False if insufficient."""
        if self.credits < amount:
            return False
        self.credits -= amount
        return True

    def earn_credits(self, amount: int) -> None:
        self.credits += amount

    def spend_void_shards(self, amount: int) -> bool:
        if self.void_shards < amount:
            return False
        self.void_shards -= amount
        return True


# =========================================
# Rift Exchange
# =========================================

@dataclass
class ExchangeListing:
    listing_id: str
    seller_id: str
    item_id: str
    item_snapshot: Item
    price_credits: int
    listed_at: datetime
    expires_at: datetime
    active: bool = True

    @staticmethod
    def create(seller_id: str, item: Item, price_credits: int) -> "ExchangeListing":
        now = datetime.utcnow()
        return ExchangeListing(
            listing_id=f"LST-{uuid.uuid4().hex[:8].upper()}",
            seller_id=seller_id,
            item_id=item.item_id,
            item_snapshot=item,
            price_credits=price_credits,
            listed_at=now,
            expires_at=now + timedelta(days=LISTING_EXPIRY_DAYS),
        )

    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at


@dataclass
class TransactionResult:
    transaction_id: str
    buyer_id: str
    seller_id: str
    item_id: str
    gross_price: int
    fee_pct: float
    fee_credits: int
    net_to_seller: int
    success: bool
    error: Optional[str] = None

    @property
    def effective_rate_per_credit(self) -> float:
        return self.fee_pct / 100.0


class RiftExchange:
    """
    Player-to-player marketplace. Transaction fee: 4.7%.
    Void Shards are not tradeable. Listing fee: 1% (min 5 Credits).
    Maximum 50 active listings per player.
    """

    def __init__(self) -> None:
        self.listings: dict[str, ExchangeListing] = {}

    def create_listing(
        self,
        seller_inventory: PlayerInventory,
        item_id: str,
        price_credits: int
    ) -> tuple[Optional[ExchangeListing], Optional[str]]:
        """
        Create a new listing. Returns (listing, None) on success or (None, error) on failure.
        Listing fee: max(1% of price, 5 credits).
        """
        item = seller_inventory.get_item(item_id)
        if item is None:
            return None, "item_not_in_inventory"

        if item.untradeable:
            return None, "item_untradeable"

        active_count = sum(
            1 for l in self.listings.values()
            if l.seller_id == seller_inventory.player_id and l.active
        )
        if active_count >= MAX_ACTIVE_LISTINGS_PER_PLAYER:
            return None, "max_listings_reached"

        listing_fee = max(
            math.ceil(price_credits * RIFT_EXCHANGE_LISTING_FEE_PCT / 100),
            RIFT_EXCHANGE_LISTING_MIN_FEE,
        )
        if not seller_inventory.spend_credits(listing_fee):
            return None, "insufficient_credits_for_fee"

        removed = seller_inventory.remove_item(item_id)
        if removed is None:
            seller_inventory.earn_credits(listing_fee)
            return None, "item_removal_failed"

        listing = ExchangeListing.create(seller_inventory.player_id, removed, price_credits)
        self.listings[listing.listing_id] = listing

        return listing, None

    def purchase_listing(
        self,
        buyer_inventory: PlayerInventory,
        listing_id: str,
        seller_inventory: PlayerInventory,
    ) -> TransactionResult:
        """
        Complete a purchase. Applies 4.7% transaction fee to seller's proceeds.
        """
        listing = self.listings.get(listing_id)

        if listing is None or not listing.active:
            return TransactionResult(
                transaction_id="",
                buyer_id=buyer_inventory.player_id,
                seller_id="",
                item_id="",
                gross_price=0,
                fee_pct=RIFT_EXCHANGE_TRANSACTION_FEE_PCT,
                fee_credits=0,
                net_to_seller=0,
                success=False,
                error="listing_not_found_or_inactive",
            )

        if listing.is_expired():
            listing.active = False
            return TransactionResult(
                transaction_id="",
                buyer_id=buyer_inventory.player_id,
                seller_id=listing.seller_id,
                item_id=listing.item_id,
                gross_price=listing.price_credits,
                fee_pct=RIFT_EXCHANGE_TRANSACTION_FEE_PCT,
                fee_credits=0,
                net_to_seller=0,
                success=False,
                error="listing_expired",
            )

        if buyer_inventory.player_id == listing.seller_id:
            return TransactionResult(
                transaction_id="",
                buyer_id=buyer_inventory.player_id,
                seller_id=listing.seller_id,
                item_id=listing.item_id,
                gross_price=listing.price_credits,
                fee_pct=RIFT_EXCHANGE_TRANSACTION_FEE_PCT,
                fee_credits=0,
                net_to_seller=0,
                success=False,
                error="cannot_buy_own_listing",
            )

        if not buyer_inventory.spend_credits(listing.price_credits):
            return TransactionResult(
                transaction_id="",
                buyer_id=buyer_inventory.player_id,
                seller_id=listing.seller_id,
                item_id=listing.item_id,
                gross_price=listing.price_credits,
                fee_pct=RIFT_EXCHANGE_TRANSACTION_FEE_PCT,
                fee_credits=0,
                net_to_seller=0,
                success=False,
                error="insufficient_credits",
            )

        fee = math.ceil(listing.price_credits * RIFT_EXCHANGE_TRANSACTION_FEE_PCT / 100)
        net_to_seller = listing.price_credits - fee
        seller_inventory.earn_credits(net_to_seller)

        buyer_inventory.add_item(listing.item_snapshot)
        listing.active = False

        tx_id = f"TX-{uuid.uuid4().hex[:8].upper()}"
        return TransactionResult(
            transaction_id=tx_id,
            buyer_id=buyer_inventory.player_id,
            seller_id=listing.seller_id,
            item_id=listing.item_id,
            gross_price=listing.price_credits,
            fee_pct=RIFT_EXCHANGE_TRANSACTION_FEE_PCT,
            fee_credits=fee,
            net_to_seller=net_to_seller,
            success=True,
        )

    def cancel_listing(
        self,
        seller_inventory: PlayerInventory,
        listing_id: str,
    ) -> tuple[bool, Optional[str]]:
        """Cancel a listing and return item to seller."""
        listing = self.listings.get(listing_id)
        if listing is None:
            return False, "listing_not_found"
        if listing.seller_id != seller_inventory.player_id:
            return False, "not_your_listing"
        if not listing.active:
            return False, "listing_already_inactive"

        listing.active = False
        seller_inventory.add_item(listing.item_snapshot)
        return True, None

    def get_active_listings(
        self,
        query: Optional[str] = None,
        tier: Optional[int] = None,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
    ) -> list[ExchangeListing]:
        """Search active, non-expired listings."""
        results = [
            l for l in self.listings.values()
            if l.active and not l.is_expired()
        ]

        if query:
            q = query.lower()
            results = [l for l in results if q in l.item_snapshot.name.lower()]

        if tier is not None:
            results = [l for l in results if l.item_snapshot.tier == tier]

        if min_price is not None:
            results = [l for l in results if l.price_credits >= min_price]

        if max_price is not None:
            results = [l for l in results if l.price_credits <= max_price]

        return sorted(results, key=lambda l: l.price_credits)


# =========================================
# Void Shard Purchase
# =========================================

def purchase_void_shards(
    player: PlayerInventory,
    amount_shards: int,
    usd_charged: float,
) -> dict:
    """
    Process a Void Shard purchase. Rate is fixed at 0.0042 USD per shard.
    This function is called after payment processor confirmation.
    """
    expected_usd = amount_shards * VOID_SHARD_USD_RATE
    if not math.isclose(usd_charged, expected_usd, rel_tol=0.01):
        return {
            "success": False,
            "error": "price_mismatch",
            "expected_usd": expected_usd,
            "provided_usd": usd_charged,
        }

    player.void_shards += amount_shards

    return {
        "success": True,
        "player_id": player.player_id,
        "shards_purchased": amount_shards,
        "usd_charged": usd_charged,
        "effective_rate": VOID_SHARD_USD_RATE,
        "new_shard_balance": player.void_shards,
    }


# =========================================
# Loot Generation
# =========================================

TIER_DROP_RATES = {1: 0.60, 2: 0.25, 3: 0.10, 4: 0.04, 5: 0.01}

def determine_loot_tier(rng_value: float, loot_multiplier: float = 1.0) -> int:
    """
    Determine loot tier from a random value [0, 1).
    Loot multiplier shifts probability toward higher tiers.
    Void Surge events use multiplier 3.7.
    """
    adjusted_rates = {}
    for tier, rate in TIER_DROP_RATES.items():
        modifier = loot_multiplier if tier >= 4 else 1.0
        adjusted_rates[tier] = rate * modifier

    total = sum(adjusted_rates.values())
    normalized = {t: r / total for t, r in adjusted_rates.items()}

    cumulative = 0.0
    for tier in sorted(normalized.keys(), reverse=True):
        cumulative += normalized[tier]
        if rng_value <= cumulative:
            return tier

    return 1


def calculate_mowats_folly_drop_chance(
    architect_id: str,
    player_has_conclave_buff: bool
) -> float:
    """
    Mowat's Folly drops at 0.47% from qualifying Architects.
    Conclave Rank 5+ bonus: +0.1% additional chance.
    Only drops from: elder_warform_theta_9 and cascade_sovereign.
    """
    qualifying_architects = {"elder_warform_theta_9", "cascade_sovereign"}
    if architect_id not in qualifying_architects:
        return 0.0

    base_chance = 0.47 / 100.0
    if player_has_conclave_buff:
        base_chance += 0.001  # +0.1%

    return base_chance
