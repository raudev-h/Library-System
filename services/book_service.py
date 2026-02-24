from schemas import BookCreate, BookResponse, BookUpdate
from uuid import uuid4, UUID
from datetime import datetime, timezone
from services import author_services
from services import loan_service
from exceptions import BadRequestException, NotFoundException, ConflictException

fake_books_db = []

def get_all_books() -> list[dict]:
    return fake_books_db

def get_book_by_id(id:UUID) -> dict:
    for book in fake_books_db:
        if book["id"] == id:
            return book
    raise NotFoundException("book not found")

def _get_book_index(id:UUID) -> int:
    for index, book in enumerate(fake_books_db):
        if book["id"] == id:
            return index
    raise NotFoundException("book not found")

def create_book(data:BookCreate) -> dict:

    for book in fake_books_db:
        if book["isbn"] == data.isbn:
            raise ConflictException(f"Book {data.title} already exist")
    
    now = datetime.now(timezone.utc)

    internal_book = {
        "id":uuid4(),
        "title": data.title,
        "isbn": data.isbn,
        "author":author_services.find_authors(data.author),
        "total_copies": data.total_copies,
        "available_copies":data.total_copies,
        "created_at":now,
        "updated_at":now,
        "is_active":True
    }
    fake_books_db.append(internal_book)
    return internal_book

def update_book(id:UUID, data:BookUpdate) -> dict:

    index = _get_book_index(id)
    book = fake_books_db[index]

    updated_data = data.model_dump(exclude_unset=True)

    if not updated_data:
        return book
    
    updated = False

    if "total_copies" in updated_data:
        new_available_copies = updated_data["total_copies"] - book["total_copies"]
        if new_available_copies < 0:
            raise BadRequestException("the total number of copies is incorrect")
        book["available_copies"] += new_available_copies

    for info, current_data in updated_data.items():
        if book[info] != current_data:
            book[info] = current_data
            updated = True 
    if updated:
        book["updated_at"] = datetime.now(timezone.utc)
    
    return book

def delete_book(book_id:UUID):
    
    index = _get_book_index(book_id)
    
    book = fake_books_db[index]

    if not book["is_active"]:
        raise ConflictException("this book was already deleted")
    
    if loan_service.has_active_loans(book_id):
        raise BadRequestException("this book has active loans, cannot be deleted")
    
    book["is_active"] = False

    return book