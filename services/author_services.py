from schemas import AuthorResponse, AuthorCreate, AuthorUpdate
from uuid import uuid4, UUID
from datetime import datetime, timezone

fake_author_db = []

def create_author(data:AuthorCreate) -> AuthorResponse:

    now = datetime.now(timezone.utc)

    internal_author = {
        "id": uuid4(),
        "first_name":data.first_name,
        "last_name":data.last_name,
        "birth_date":data.birth_date,
        "nationality":data.nationality,
        "biography":data.biography,
        "created_at":now,
        "updated_at":now
    }

    fake_author_db.append(internal_author)

    return AuthorResponse(
        id= internal_author["id"],
        first_name= internal_author["first_name"],
        last_name=internal_author["last_name"],
        birth_date= internal_author["birth_date"],
        nationality= internal_author["nationality"],
        biography= internal_author["biography"],
        created_at= internal_author["created_at"],
        updated_at= internal_author["updated_at"]
    )

def get_all_authors() -> list[dict]:
    return fake_author_db