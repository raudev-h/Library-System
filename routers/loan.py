from fastapi import APIRouter
from schemas import LoanCreate, LoanResponse, LoanUpdate
from services import loan_service
from uuid import UUID

router = APIRouter(prefix="/loan",
                    tags=["loans"],
                        responses={404:{"description": "loans not found"}})

@router.get("/", response_model=list[LoanResponse])
async def get_loans() -> list[LoanResponse]:
    return [
        LoanResponse.model_validate(loan)
        for loan in loan_service.get_all_loans()
    ]

@router.get("/{id}", response_model=LoanResponse)
async def get_loan(id:UUID) -> LoanResponse:
    return LoanResponse.model_validate(loan_service.get_loan_by_id(id))
