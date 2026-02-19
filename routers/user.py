from fastapi import APIRouter, HTTPException
from services import get_user_by_id, get_all_users, update_user_profile
from schemas import UserCreate, UserResponse, UserUpdateProfile
from uuid import UUID
from datetime import datetime, timezone

router = APIRouter(prefix="/user",
                        tags=["user"],
                            responses={404:
                                        {"description":"users not found"}})

@router.get("/", response_model= list[UserResponse])
async def get_users():
    users = get_all_users()

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
        user = get_user_by_id(id)
        return UserResponse.model_validate(user)
    except:
        raise Exception("user not found")

@router.post("/", response_model=UserResponse)
async def create_user(data:UserCreate) -> UserResponse:
        user = create_user(data)
        return UserResponse.model_validate(user)

@router.patch("/{id}",response_model= UserResponse)
async def update_user_profile(id:UUID, data:UserUpdateProfile):
    updated_user =  update_user_profile(id, data)
    return UserResponse.model_validate(updated_user)
