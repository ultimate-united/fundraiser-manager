from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class OrganizerOut(BaseModel):
    id: str
    slug: str
    name: str
    mission: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    is_verified: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
