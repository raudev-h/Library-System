from fastapi import APIRouter
from services import author_services
from schemas import AuthorCreate, AuthorUpdate, AuthorResponse

router = APIRouter(
        prefix="/author",
            tags=["author"],
                responses= {404: {"description":"authors not found"}})

@router.post("/", response_model=AuthorResponse)
async def create_author(data:AuthorCreate) -> AuthorResponse:
    author = author_services.create_author(data)
    return AuthorResponse.model_validate(author)