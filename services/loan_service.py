from schemas import LoanCreate, LoanUpdate, LoanResponse
from datetime import date, datetime, timezone, timedelta
from uuid import UUID, uuid4
from user_service import get_user_by_id
from book_service import get_book_by_id

MAX_ACTIVE_LOANS = 3
LOAN_DURATION_DAYS = 15

fake_loan_db = []

def get_all_loans() -> list[dict]:
    return fake_loan_db

def get_loan_by_id(id:UUID):
    for loan in fake_loan_db:
        if loan["id"] == id:
            return loan
    raise Exception("loan not found")

def create_loan(user_id:UUID, book_id:UUID) -> dict:
    user = get_user_by_id(user_id)
    book = get_book_by_id(book_id)

    if book["available_copies"] <= 0:
        raise Exception(f"Book: {book["title"]} has no copies available")
    
    if not can_loan(user_id):
        raise Exception(f"{user["name"]} has max loans active ({MAX_ACTIVE_LOANS})")
    
    today = date.today()

    loan = {
        "id":uuid4(),
        "user_id":user_id,
        "book_id":book_id,
        "loan_date":today,
        "due_date":today + timedelta(days=LOAN_DURATION_DAYS),
        "return_date":None,
        "is_returned":False
    }

    book["available_copies"] -= 1

    fake_loan_db.append(loan)
    return loan


def can_loan(user_id:UUID) -> bool:
    cont = 0
    for loan in fake_loan_db:
        if loan["user_id"] == user_id:
            if not loan["is_returned"]:
                cont += 1
    
    return cont < 3