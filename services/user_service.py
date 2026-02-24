from schemas import UserResponse, UserCreate, UserUpdateProfile
from uuid import uuid4, UUID
from datetime import datetime, timezone
from services import loan_service
from exceptions import BadRequestException, NotFoundException, ConflictException

fake_user_db = []

def create_user(data:UserCreate) -> dict:

    for user in fake_user_db:
        if data.email == user.email:
            raise ConflictException(f"{data.email} already exist")
    
    now = datetime.now(timezone.utc)

    internal_user = {
        "id": uuid4(),
        "name": data.name,
        "password":data.password,
        "email": data.email,
        "is_active": True,
        "is_verified": False,
        "created_at": now,
        "updated_at": now
    }

    fake_user_db.append(internal_user)

    return internal_user  

def get_all_users()-> list[dict]:
    return fake_user_db

def get_user_by_id(id:UUID) -> dict:
    for user in fake_user_db:
        if user["id"] == id:
            return user
    raise NotFoundException("user not found")

def _get_user_index(id:UUID) -> int:
    for index, user in enumerate(fake_user_db):
        if user["id"] == id:
            return index
    raise NotFoundException("user not found")

def update_user_profile(id:UUID, data:UserUpdateProfile):

    index = _get_user_index(id)
    current_user = fake_user_db[index]

    updated_data = data.model_dump(exclude_unset=True)

    if not updated_data:
        return current_user
    
    if "name" in updated_data:
        if current_user["name"] != updated_data["name"]:
            current_user["updated_at"] = datetime.now(timezone.utc)
            current_user["name"] = updated_data["name"]
    
    return current_user

def delete_user(id:UUID):

    index = _get_user_index(id)
    current_user = fake_user_db[index]

    if not current_user["is_active"]:
        raise ConflictException("user already deleted")
    
    if loan_service.has_user_active_loans(id):
        raise ConflictException("this user has active loans, cannot be deleted")
    
    current_user["is_active"] = False