from fastapi import APIRouter
from schemas import LoanCreate, LoanResponse, LoanUpdate
from services import loan_service
from uuid import UUID

router = APIRouter(prefix="/loan",
                    tags=["loans"],
                        responses={404:{"description": "loans not found"}})

@router.get("/", response_model=list[LoanResponse])
async def get_loans(is_returned: bool | None = None, skip:int = 0, limit:int = 10) -> list[LoanResponse]:
    return [
        LoanResponse.model_validate(loan)
        for loan in loan_service.search_loans(is_returned, skip, limit)
    ]

@router.get("/{id}", response_model=LoanResponse)
async def get_loan(id:UUID) -> LoanResponse:
    return LoanResponse.model_validate(loan_service.get_loan_by_id(id))

@router.post("/", response_model=LoanResponse)
async def create_loan(data:LoanCreate):
    loan = loan_service.create_loan(data)
    return LoanResponse.model_validate(loan)

@router.post("/{id}/return", response_model=LoanResponse)
async def return_loan(id:UUID):
    loan = loan_service.return_loan(id)
    return LoanResponse.model_validate(loan)

@router.patch("/{id}", response_model=LoanResponse)
async def update_loan(id:UUID, data:LoanUpdate):
    loan = loan_service.update_loan(id, data)
    return LoanResponse.model_validate(loan)
