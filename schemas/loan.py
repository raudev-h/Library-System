from pydantic import BaseModel
from uuid import UUID
from datetime import date

class LoanCreate(BaseModel):
    user_id:UUID
    book_id:UUID

class LoanUpdate(BaseModel):
    due_date:date

class LoanResponse(BaseModel):
    id:UUID
    user_id:UUID
    book_id:UUID
    loan_date:date
    due_date:date
    return_date:date | None = None
    is_returned:bool