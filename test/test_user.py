from fastapi.testclient import TestClient
from main import app
from services.user_service import fake_user_db
import pytest

USER_DATA = {
    "name": "Raul",
    "email": "raulalbertohechavarria@gmail.com",
    "password": "12345678",
    "confirm_password": "12345678"
}

client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_db():
    fake_user_db.clear()
    yield

def test_create_user():
    response = client.post("/user", json=USER_DATA)
    assert response.status_code == 200
    assert response.json()["name"] == "Raul"

def test_create_user_duplicate_email():
    client.post("/user", json=USER_DATA)
    response = client.post("/user", json={
        "name":"Aniel",
        "email":"raulalbertohechavarria@gmail.com",
        "password":"password 123",
        "confirm_password":"password 123"
    })
    assert response.status_code == 409

def test_get_user_by_id():
    response = client.post("/user", json=USER_DATA)
    user_id = response.json()["id"]
    
    response = client.get(f"/user/{user_id}")
    assert response.json()["id"] == user_id

def test_delete_user_already_deleted():
    response = client.post("/user", json=USER_DATA)
    user_id = response.json()["id"]
    response = client.delete(f"/user/{user_id}")
    response = client.delete(f"/user/{user_id}")
    assert response.status_code == 409
    