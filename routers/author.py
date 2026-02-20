from fastapi import APIRouter
from services import author_services
from schemas import AuthorCreate, AuthorUpdate, AuthorResponse
from uuid import UUID

router = APIRouter(
    prefix="/author",
    tags=["author"],
    responses={404: {"description": "authors not found"}},
)


@router.get("/", response_model=list[AuthorResponse])
async def get_authors():

    authors = author_services.get_all_authors()

    return [
        AuthorResponse(
            id=author["id"],
            first_name=author["first_name"],
            last_name=author["last_name"],
            birth_date=author["birth_date"],
            nationality=author["nationality"],
            biography=author["biography"],
            created_at=author["created_at"],
            updated_at=author["updated_at"],
        )
        for author in authors
    ]


@router.get("/{id}", response_model=AuthorResponse)
async def get_author(id: UUID):
    try:
        author = author_services.get_author_by_id(id)
        return AuthorResponse.model_validate(author)
    except Exception:
        raise Exception("not found")

@router.post("/", response_model=AuthorResponse)
async def create_author(data: AuthorCreate) -> AuthorResponse:
    author = author_services.create_author(data)
    return AuthorResponse.model_validate(author)