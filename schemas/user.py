from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from uuid import uuid4, UUID
from datetime import datetime
from typing import Annotated
from .validators import validate_password_length, validate_passwords_match

class UserCreate(BaseModel):
    name:str = Field(min_length=3)
    email:EmailStr
    password: str
    confirm_password:str

    @field_validator("password")
    @classmethod
    def password_lengt(cls,value):
        return validate_password_length(value)
    
    @model_validator(mode="after")
    def passwords_match(self):
        validate_passwords_match(self.password, self.confirm_password)
        return self
    
    @field_validator("email")
    @classmethod
    def normalize_email(cls, value:str):
        return value.lower()
    
class UserUpdateProfile(BaseModel):
# El Annotated es una forma de hacer opcional el campo,
#  pero podemos agregarle además esa validación adicional
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