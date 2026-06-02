from typing import Optional

from pydantic import BaseModel


class Message(BaseModel):
    message: str


class ApiError(BaseModel):
    error: str
    detail: Optional[str] = None
