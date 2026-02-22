from schemas import BookCreate, BookResponse, BookUpdate
from uuid import uuid4, UUID
from datetime import datetime, timezone

fake_books_db = []

def get_all_books() -> list[dict]:
    return fake_books_db

def get_book_by_id(id:UUID) -> dict:
    for book in fake_books_db:
        if book["id"] == id:
            return book
    raise Exception("book not found")