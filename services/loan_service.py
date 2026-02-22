from schemas import LoanCreate, LoanUpdate, LoanResponse
from datetime import date
from uuid import UUID

fake_loan_db = []

def get_all_loans() -> list[dict]:
    return fake_loan_db

def get_loan_by_id(id:UUID):
    for loan in fake_loan_db:
        if loan["id"] == id:
            return loan
    raise Exception("loan not found")