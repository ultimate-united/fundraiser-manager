from datetime import datetime
from typing import Optional

from pydantic import BaseModel

RegistrationRole = str    # 'attendee' | 'volunteer'
RegistrationStatus = str  # 'registered' | 'attended' | 'cancelled' | 'no_show'


class RegisterIn(BaseModel):
    role: RegistrationRole = "attendee"


class RegistrationOut(BaseModel):
    id: str
    user_id: str
    event_id: str
    role: RegistrationRole
    status: RegistrationStatus
    hours_logged: float = 0
    points_earned: int = 0
    registered_at: Optional[datetime] = None
