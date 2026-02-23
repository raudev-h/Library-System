from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import datetime, date
from typing import Annotated
from .validators import validate_copies
from .author import AuthorSummary

class BookCreate(BaseModel):
    title:str
    total_copies:int
    isbn:str
    author:list[UUID]

    @field_validator("isbn")
    @classmethod
    def no_blank_strings(cls,value:str):
        if not value.strip(): # si es una cadena vacía "" devuelve false 
            raise ValueError("Field cannot be empty or blank")
        return value
    
    @field_validator("total_copies")
    @classmethod
    def validate_copies_fields(cls, value:int):
        return validate_copies(value)
    
class BookUpdate(BaseModel):
    title:str | None = None
    total_copies:int | None = None 

    @field_validator("total_copies")
    @classmethod
    def validate_copies_fields(cls, value:int):
        return validate_copies(value)
    
class BookResponse(BaseModel):
    id:UUID
    title:str
    author:list[AuthorSummary]
    isbn:str
    available_copies:int
    total_copies:int
    created_at: datetime
    updated_at: datetime
    is_active:bool