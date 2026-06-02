from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

BadgeCriteria = str      # 'events_attended' | 'donations_made' | 'consecutive_months' | 'hours_volunteered'
RewardCategory = str     # 'discount' | 'experience' | 'recognition' | 'merch'
RedemptionStatus = str   # 'pending' | 'fulfilled' | 'cancelled'
MemberTier = str         # 'bronze' | 'silver' | 'gold' | 'platinum'


class BadgeOut(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    criteria_type: BadgeCriteria
    criteria_threshold: int = 0
    earned: bool = False
    earned_at: Optional[datetime] = None


class RewardOut(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    points_required: int
    category: RewardCategory
    icon: Optional[str] = None
    active: bool = True


class RedemptionOut(BaseModel):
    id: str
    user_id: str
    reward_id: str
    points_spent: int
    status: RedemptionStatus
    redeemed_at: Optional[datetime] = None


class TierBenefitOut(BaseModel):
    benefit: str
    sort_order: int = 0


class TierOut(BaseModel):
    code: MemberTier
    label: str
    min_points: int
    sort_order: int = 0
    benefits: List[TierBenefitOut] = []
