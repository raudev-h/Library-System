from fastapi import APIRouter, HTTPException
from services import book_service
from services import book_author_service
from schemas import BookCreate, BookResponse, BookUpdate, AuthorSummary
from uuid import UUID

router = APIRouter(prefix="/book",
                    tags=["books"],
                        responses={404:{"description": "books not found"}})

@router.get("/", response_model=list[BookResponse])
async def get_books():
    books = book_service.get_all_books()

    return [
        to_book_response(book)
        for book in books
    ]

@router.get("/{id}", response_model=BookResponse)
async def get_book_by_id(id:UUID):
    book = book_service.get_book_by_id(id)
    return to_book_response(book)

@router.post("/", response_model=BookResponse)
async def create_book(data:BookCreate) -> BookResponse:
    book = book_service.create_book(data)
    return to_book_response(book)

@router.patch("/{id}", response_model=BookResponse)
async def update_book(id:UUID, data:BookUpdate):
    updated_book = book_service.update_book(id, data)
    return to_book_response(updated_book)

@router.delete("/{id}", status_code=204)
async def delete_book(id:UUID):
    book_service.delete_book(id)

def to_book_response(book:dict):
    book["author"] = [ 
        AuthorSummary.model_validate(author) 
            for author in book_author_service.get_authors_by_book(book["id"])]
    return BookResponse.model_validate(book)