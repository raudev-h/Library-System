from schemas import LoanCreate, LoanUpdate, LoanResponse
from datetime import date, datetime, timezone, timedelta
from uuid import UUID, uuid4
from user_service import get_user_by_id
from book_service import get_book_by_id
from exceptions import BadRequestException, NotFoundException, ConflictException

MAX_ACTIVE_LOANS = 3
LOAN_DURATION_DAYS = 15

fake_loan_db = []

def get_all_loans() -> list[dict]:
    return fake_loan_db

def get_loan_by_id(id:UUID):
    for loan in fake_loan_db:
        if loan["id"] == id:
            return loan
    raise NotFoundException("loan not found")

def create_loan(data:LoanCreate) -> dict:
    user = get_user_by_id(data.user_id)
    book = get_book_by_id(data.book_id)

    if book["available_copies"] <= 0:
        raise ConflictException(f"Book: {book["title"]} has no copies available")
    
    if not can_loan(data.user_id):
        raise ConflictException(f"{user["name"]} has max loans active ({MAX_ACTIVE_LOANS})")
    
    today = date.today()

    loan = {
        "id":uuid4(),
        "user_id":data.user_id,
        "book_id":data.book_id,
        "loan_date":today,
        "due_date":today + timedelta(days=LOAN_DURATION_DAYS),
        "return_date":None,
        "is_returned":False
    }

    book["available_copies"] -= 1

    fake_loan_db.append(loan)
    return loan

def return_loan(id:UUID) -> dict:
    loan = get_loan_by_id(id)

    if loan["is_returned"]:
        raise ConflictException(f"this loan was returned at {loan["return_date"]}")

    book_id = loan["book_id"]
    
    loan["return_date"] = date.today()
    loan["is_returned"] = True

    book = get_book_by_id(book_id)
    book["available_copies"] += 1

    return loan

def update_loan(id:UUID, data:LoanUpdate) -> dict:

    internal_loan = get_loan_by_id(id)

    if  internal_loan["is_returned"]:
        raise ConflictException("this loan was already returned")
        
    if not data.due_date > internal_loan["due_date"]:
        raise BadRequestException(
            f"the new date({data.due_date}) is not after due_date{internal_loan["due_date"]}"
            )
    
    internal_loan["due_date"] = data.due_date

    return internal_loan

def search_loans(is_returned:bool | None = None, skip:int = 0, limit:int = 10) -> list[dict]:
    
    if is_returned is None:
        return get_all_loans()[skip:skip + limit]
    
    loans = [
        loan for loan in fake_loan_db if loan["is_returned"] == is_returned
    ]
    return loans[skip:skip + limit]

def can_loan(user_id:UUID) -> bool:
    cont = 0
    for loan in fake_loan_db:
        if loan["user_id"] == user_id:
            if not loan["is_returned"]:
                cont += 1
    
    return cont < 3

def has_active_loans(book_id:UUID) -> bool:
    
    for loan in fake_loan_db:
        if loan["book_id"] == book_id and not loan["is_returned"]:
                return True

    return False

def has_user_active_loans(user_id:UUID) -> bool:

    for loan in fake_loan_db:
        if loan["user_id"] == user_id and not loan["is_returned"]:
            return True
    return False