from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel

EventStatus = str  # 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
SectionKind = str  # 'rich_text' | 'schedule' | 'sponsors' | 'contribution' | 'faq' | 'organizer' | 'custom'


class EventSectionOut(BaseModel):
    id: str
    kind: SectionKind
    title: str
    position: int
    content: Any  # JSONB — shape depends on `kind` (see schema design)


class EventBase(BaseModel):
    id: str
    organizer_id: str
    parent_event_id: Optional[str] = None
    slug: str
    title: str
    subtitle: Optional[str] = None
    mission: Optional[str] = None
    summary: Optional[str] = None
    banner_image: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    location: Optional[str] = None
    fundraising_goal: Optional[int] = None  # minor units (cents)
    participant_goal: Optional[int] = None
    volunteer_spots: Optional[int] = None
    points_reward: int = 0
    status: EventStatus
    featured: bool = False
    # Editable "Your impact" tiers: list of {amount, title, description}.
    impact: List[Any] = []
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    og_image: Optional[str] = None


class EventListItem(EventBase):
    # Computed in v_event_public
    amount_raised: int = 0
    participant_count: int = 0
    spots_left: Optional[int] = None


class EventDetailOut(EventListItem):
    sections: List[EventSectionOut] = []


class EventCreate(BaseModel):
    """Admin create payload. organizer_id defaults to the sole organizer if omitted."""
    slug: str
    title: str
    organizer_id: Optional[str] = None
    subtitle: Optional[str] = None
    mission: Optional[str] = None
    summary: Optional[str] = None
    banner_image: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    location: Optional[str] = None
    fundraising_goal: Optional[int] = None  # minor units (cents)
    participant_goal: Optional[int] = None
    volunteer_spots: Optional[int] = None
    points_reward: int = 0
    status: EventStatus = "draft"
    featured: bool = False
    impact: List[Any] = []


class EventUpdate(BaseModel):
    """Admin partial-update payload (only provided fields change)."""
    slug: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    mission: Optional[str] = None
    summary: Optional[str] = None
    banner_image: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    location: Optional[str] = None
    fundraising_goal: Optional[int] = None
    participant_goal: Optional[int] = None
    volunteer_spots: Optional[int] = None
    points_reward: Optional[int] = None
    status: Optional[EventStatus] = None
    featured: Optional[bool] = None
    impact: Optional[List[Any]] = None
