from fastapi import APIRouter, HTTPException
from services import user_service
from schemas import user

router = APIRouter(prefix="user",
                        tags=["user"],
                            responses={404:
                                        {"description":"users not found"}})

@router.get("/", response_model= list[user.UserResponse])
async def get_users():
    users = user_service.get_all_users()

    return [
        user.UserResponse(
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
    
