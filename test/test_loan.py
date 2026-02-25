from fastapi.testclient import TestClient
from main import app
from services.loan_service import fake_loan_db
from services.user_service import fake_user_db
from services.author_services import fake_author_db
from services.book_service import fake_books_db
import pytest
from datetime import date, timedelta

USER_DATA = {
    "name": "Raul",
    "email": "raulalbertohechavarria@gmail.com",
    "password": "12345678",
    "confirm_password": "12345678",
}

OTHER_USER_DATA = {
    "name": "Aniel",
    "email": "aniel@gmail.com",
    "password": "12345678",
    "confirm_password": "12345678",
}

AUTHOR_DATA = {
    "first_name": "Gabriel",
    "last_name": "Garcia Marquez",
    "birth_date": "1927-03-06",
    "nationality": "Colombiano",
    "biography": "Nobel de literatura, autor de Cien años de soledad",
}

FUTURE_DATE = date.today() + timedelta(days=20)

PAST_DATE = date.today() - timedelta(days=20)

client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_db():
    fake_loan_db.clear()
    fake_author_db.clear()
    fake_user_db.clear()
    fake_books_db.clear()
    yield


@pytest.fixture()
def user_data():
    response = client.post("/user", json=USER_DATA)
    return response.json()


@pytest.fixture()
def other_user_data():
    response = client.post("/user", json=OTHER_USER_DATA)
    return response.json()


@pytest.fixture()
def author_data():
    response = client.post("/author", json=AUTHOR_DATA)
    return response.json()


@pytest.fixture()
def book_data(author_data):
    response = client.post(
        "/book",
        json={
            "title": "Cien años de soledad",
            "total_copies": 1,
            "isbn": "978-0-06-088328-7",
            "author": [author_data["id"]],
        },
    )
    return response.json()


@pytest.fixture()
def second_book_data(author_data):
    response = client.post(
        "/book",
        json={
            "title": "El Aleph",
            "total_copies": 3,
            "isbn": "978-84-206-3379-1",
            "author": [author_data["id"]],
        },
    )
    return response.json()


@pytest.fixture()
def third_book_data(author_data):
    response = client.post(
        "/book",
        json={
            "title": "La casa de los espiritus",
            "total_copies": 4,
            "isbn": "978-0-553-38380-4",
            "author": [author_data["id"]],
        },
    )
    return response.json()


@pytest.fixture()
def fourth_book_data(author_data):
    response = client.post(
        "/book",
        json={
            "title": "Ficciones",
            "total_copies": 2,
            "isbn": "978-84-376-0494-7",
            "author": [author_data["id"]],
        },
    )
    return response.json()


def test_create_loan(user_data, book_data):
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]}
    )
    assert response.status_code == 200


def test_create_duplicate_loan(user_data, book_data):
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]}
    )
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]}
    )
    assert response.status_code == 409


def test_create_loan_with_no_available_copies(other_user_data, user_data, book_data):
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]}
    )
    response = client.post(
        "/loan", json={"user_id": other_user_data["id"], "book_id": book_data["id"]}
    )
    assert response.status_code == 409


def test_create_loan_user_exceeds_max_active_loans(
    user_data, book_data, second_book_data, third_book_data, fourth_book_data
):
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]}
    )
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": second_book_data["id"]}
    )
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": third_book_data["id"]}
    )
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": fourth_book_data["id"]}
    )
    assert response.status_code == 409


def test_return_loan(user_data, book_data):
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]}
    )
    loan_id = response.json()["id"]
    
    response = client.post(f"/loan/{loan_id}/return")

    assert response.status_code == 200

def test_return_loan_already_returned(user_data, book_data):
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]}
    )
    loan_id = response.json()["id"]
    
    response = client.post(f"/loan/{loan_id}/return")
    response = client.post(f"/loan/{loan_id}/return")

    assert response.status_code == 409

def test_update_loan(user_data, book_data):
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]}
    )
    loan_id = response.json()["id"]

    response = client.patch(f"/loan/{loan_id}",json={"due_date":str(FUTURE_DATE)})
    
    assert response.status_code == 200

def test_update_loan_with_past_date(user_data, book_data):
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]}
    )
    loan_id = response.json()["id"]

    response = client.patch(f"/loan/{loan_id}",json={"due_date":str(PAST_DATE)})
    
    assert response.status_code == 400

def test_update_loan_already_returned(user_data, book_data):
    response = client.post(
        "/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]}
    )
    loan_id = response.json()["id"]
    
    response = client.post(f"/loan/{loan_id}/return")

    response = client.patch(f"/loan/{loan_id}",json={"due_date":str(FUTURE_DATE)})
    
    assert response.status_code == 409