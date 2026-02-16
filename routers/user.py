from fastapi import APIRouter, HTTPException
from services import user_service
from schemas import UserCreate, UserResponse, UserUpdateProfile
from uuid import UUID

router = APIRouter(prefix="/user",
                        tags=["user"],
                            responses={404:
                                        {"description":"users not found"}})

@router.get("/", response_model= list[UserResponse])
async def get_users():
    users = user_service.get_all_users()

    return [
        UserResponse(
            id= u["id"],
            name= u["name"],
            email= u["email"],
            is_active=u["is_active"],
            is_verified= u["is_verified"],
            created_at= u["created_at"],
            updated_at= u["updated_at"]
        )
        for u in users
    ]
    
@router.get("/{id}", response_model=UserResponse)
async def get_user(id:UUID):
    try:
        user = user_service.get_user_by_id(id)
        return UserResponse.model_validate(user)
    except:
        raise Exception("user not found")