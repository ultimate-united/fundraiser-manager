from typing import Optional

from pydantic import BaseModel

ProfileType = str  # 'individual' | 'family' | 'corporate' | 'in_need'
MemberTier = str   # 'bronze' | 'silver' | 'gold' | 'platinum'
UserRole = str     # 'member' | 'organizer' | 'admin'


class ProfileOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    profile_type: ProfileType
    role: UserRole


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    profile_type: Optional[ProfileType] = None


class DashboardOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    profile_type: ProfileType
    role: UserRole
    email: Optional[str] = None
    total_points: int = 0
    total_donated: int = 0       # minor units (cents)
    events_attended: int = 0
    hours_volunteered: float = 0
    tier: MemberTier = "bronze"


class NotificationPrefsOut(BaseModel):
    email_notifications: bool = True
    event_reminders: bool = True
    donation_receipts: bool = True
    newsletter: bool = False


class NotificationPrefsUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    event_reminders: Optional[bool] = None
    donation_receipts: Optional[bool] = None
    newsletter: Optional[bool] = None
