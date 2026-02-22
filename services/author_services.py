from schemas import AuthorResponse, AuthorCreate, AuthorUpdate, AuthorSummary
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

def  get_author_by_id(id:UUID):
    for author in fake_author_db:
        if author["id"] == id:
            return author
    raise Exception({"description":"author not found"})

def _get_author_index(id:UUID):
    for index, author in enumerate(fake_author_db):
        if author["id"] == id:
            return index
    raise Exception({"description":"author not found"})

def update_author(id:UUID, data:AuthorUpdate) -> dict:

    index = _get_author_index(id)
    current_author = fake_author_db[index]

    updated_data = data.model_dump(exclude_unset=True)

    if not updated_data:
        return current_author
    
    updated = False

    for info, current_data in updated_data.items():
        if current_author[info] != current_data:
            current_author[info] = current_data
            updated = True
    
    if updated:
        current_author["updated_at"] = datetime.now(timezone.utc)
    return current_author

def find_authors(data:list[UUID]) -> list[dict]:
    authors = []
    for id in data:
            author = get_author_by_id(id)
            internal_author = {
                "id":author["id"],
                "first_name":author["first_name"],
                "last_name":author["last_name"]
            }
            authors.append(internal_author)

    return authors