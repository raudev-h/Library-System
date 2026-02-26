from uuid import UUID
from services import author_services

fake_book_author_db = []

def add_associations(book_id:UUID, auhtor_ids:list[UUID]):
    for author_id in auhtor_ids:
        fake_book_author_db.append({
            "book_id":book_id,
            "author_id":author_id
        })

def get_authors_by_book(book_id:UUID):
    author_ids = []

    for book_author in fake_book_author_db:
        if book_author["book_id"] == book_id:
            author_ids.append(book_author["author_id"])
    return author_services.find_authors(author_ids)