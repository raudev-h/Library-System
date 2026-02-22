from schemas import BookCreate, BookResponse, BookUpdate
from uuid import uuid4, UUID
from datetime import datetime, timezone
from services import author_services

fake_books_db = []

def get_all_books() -> list[dict]:
    return fake_books_db

def get_book_by_id(id:UUID) -> dict:
    for book in fake_books_db:
        if book["id"] == id:
            return book
    raise Exception("book not found")

def create_book(data:BookCreate) -> dict:

    for book in fake_books_db:
        if book["isbn"] == data.isbn:
            raise Exception(f"Book {data.title} already exist")
    
    now = datetime.now(timezone.utc)

    internal_book = {
        "id":uuid4(),
        "title": data.title,
        "isbn": data.isbn,
        "author":author_services.find_authors(data.author),
        "total_copies": data.total_copies,
        "available_copies":data.total_copies,
        "created_at":now,
        "updated_at":now
    }
    fake_books_db.append(internal_book)
    return internal_book