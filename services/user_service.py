from schemas import user
from uuid import uuid4
from datetime import datetime, timezone

fake_user_db = []

def create_user(data:user.UserCreate) -> user.UserResponse:

    for user in fake_user_db:
        if data.email == user.email:
            raise ValueError(f"{data.email} already exist")
    
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

    return user.UserResponse( 
            id= internal_user["id"],
            name= internal_user["name"],
            email= internal_user["email"],
            is_active= internal_user["is_active"],
            is_verified= internal_user["is_verified"],
            created_at= internal_user["created_at"],
            updated_at= internal_user["updated_at"]
        )    

def get_all_users()-> list[dict]:
    return fake_user_db