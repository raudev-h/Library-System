from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from uuid import uuid4, UUID
from datetime import datetime
from typing import Annotated
import validators

class UserCreate(BaseModel):
    name:str = Field(min_length=3)
    email:EmailStr
    password: str
    confirm_password:str

    @field_validator("password")
    @classmethod
    def password_lengt(cls,value):
        return validators.validate_password_lengt(value)
    
    @model_validator(mode="after")
    def passwords_match(self):
        validators.validate_passwords_match(self.password, self.confirm_password)
        return self
    
    @field_validator("email")
    @classmethod
    def normalize_email(cls, value:str):
        return value.lower()
    
class UserUpdateProfile(BaseModel):
    name: Annotated[str | None, Field(min_length=3)] = None

class UserChangePassword(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class UserStatusUpdate(BaseModel):
    is_verified:bool | None = None
    is_active:bool | None = None

class UserResponse(BaseModel):
    id:UUID
    name:str
    email:EmailStr
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime