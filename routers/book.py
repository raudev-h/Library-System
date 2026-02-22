from fastapi import APIRouter, HTTPException
from services import book_service
from schemas import BookCreate, BookResponse, BookUpdate
from uuid import UUID

router = APIRouter(prefix="/book",
                    tags=["books"],
                        responses={404,{"description": "books not found"}})

@router.get("/", response_model=list[BookResponse])
async def get_books():

    books = book_service.get_all_books()

    return [
        BookResponse.model_validate(book)
        for book in books
    ]

@router.get("/{id}", response_model=BookResponse)
async def get_book_by_id(id:UUID):
    book = book_service.get_book_by_id(id)
    return BookResponse.model_validate(book)