from pydantic import BaseModel, EmailStr, Field, field_validator
from uuid import UUID
from datetime import datetime, date
from typing import Annotated
from .validators import validate_date


class AuthorCreate(BaseModel):
    first_name:str = Field(min_length=3)
    last_name:str = Field(min_length=2)
    birth_date:date
    nationality:str = Field(min_length=4)
    biography:str = Field(min_length=5)

    @field_validator("birth_date")
    @classmethod
    def correct_date(cls,value:datetime):
        return validate_date(value)

class AuthorUpdate(BaseModel): 
    first_name:Annotated[str | None, Field(min_length=3)] = None
    last_name:Annotated[str | None, Field(min_length=2)] = None
    birth_date:date | None = None
    nationality:Annotated[str | None, Field(min_length=4)] = None
    biography:Annotated[str | None, Field(min_length=5)] = None

    @field_validator("birth_date")
    @classmethod
    def correct_date(cls,value:datetime):
        return validate_date(value)

class AuthorResponse(BaseModel):
    id:UUID
    first_name:str
    last_name:str
    birth_date:date
    nationality:str
    biography:str
    created_at:datetime
    updated_at: datetime