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

@router.patch("/{id}", response_model=AuthorResponse)
async def update_author(id:UUID, data:AuthorUpdate) -> AuthorResponse:
    updated_author = author_services.update_author(id,data)
    return AuthorResponse.model_validate(updated_author)

{
  "id": "6eebdf95-d8c5-4fb4-8e79-1339ec6095c6",
  "first_name": "pablo",
  "last_name": "coelho",
  "birth_date": "2000-05-02",
  "nationality": "brasileño",
  "biography": "Escritor",
  "created_at": "2026-02-20T20:33:55.538448Z",
  "updated_at": "2026-02-20T20:33:55.538448Z"
}