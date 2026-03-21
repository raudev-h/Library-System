# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Library System REST API** built with **FastAPI**. It manages book lending operations, including user management, books, authors, and loans with business logic constraints (max loans per user, availability tracking, soft deletes).

The app uses in-memory data structures for storage (no database) and focuses on API design patterns and business logic validation.

## High-Level Architecture

```
FastAPI Application (main.py)
    ├── Routers (routers/)
    │   ├── user.py         → User CRUD endpoints
    │   ├── book.py         → Book CRUD endpoints
    │   ├── author.py       → Author CRUD endpoints
    │   └── loan.py         → Loan management endpoints
    │
    ├── Services (services/)
    │   ├── user_service.py
    │   ├── book_service.py
    │   ├── author_services.py
    │   ├── book_author_service.py (intermediate relationship table)
    │   └── loan_service.py
    │
    ├── Schemas (schemas/)
    │   ├── user.py         → Pydantic models for request/response validation
    │   ├── book.py
    │   ├── author.py
    │   ├── loan.py
    │   └── validators.py   → Custom field validators
    │
    ├── Exceptions (exceptions/)
    │   └── exceptions.py    → Custom exception classes with HTTP status codes
    │
    └── Tests (test/)
        └── test_*.py       → Integration tests using FastAPI TestClient
```

### Key Architectural Patterns

1. **Service Layer Pattern**: Routers delegate all business logic to services. Services contain the actual in-memory database logic and validation rules.

2. **Custom Exceptions**: Three exception types with HTTP status codes:
   - `NotFoundException` (404)
   - `BadRequestException` (400)
   - `ConflictException` (409)

   Global exception handlers in `main.py` convert these to JSON responses.

3. **Schema Validation**: Pydantic models in `schemas/` define request/response contracts and include custom validators via the `validators.py` module.

4. **In-Memory Storage**: Each service maintains a module-level list (fake_*_db) that acts as the database. These are cleared between tests via pytest fixtures.

5. **Book-Author Relationship**: `book_author_service.py` implements an intermediate table pattern for the many-to-many relationship between books and authors.

### Business Logic Constraints

- **Loans**: Maximum 3 active loans per user, 15-day duration
- **Availability**: Books track available copies; loans decrement/increment on creation/return
- **Soft Deletes**: Users and books can't be deleted if they have active loans; marked with `is_active` flag
- **Duplicate Prevention**: Users can't loan the same book twice simultaneously

## Common Development Commands

### Running the Application

```bash
# Start the FastAPI development server (auto-reload on file changes)
uvicorn main:app --reload

# Server will be available at http://127.0.0.1:8000
# Interactive API docs at http://127.0.0.1:8000/docs
```

### Running Tests

```bash
# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run a single test file
pytest test/test_loan.py

# Run a specific test
pytest test/test_loan.py::test_create_loan

# Run tests matching a pattern
pytest -k "loan"

# Run with coverage
pytest --cov=services --cov=routers
```

### Code Style & Linting

The codebase follows these conventions:
- No linter/formatter currently configured; follow existing code style
- Service functions are module-level (not class-based)
- Routers use async functions
- Schema validation happens at the router layer

## Testing Strategy

Tests use **pytest** with these patterns:
- `conftest.py` sets up path for imports
- `pytest.ini` configures test discovery from the `test/` directory
- **Fixtures** (in test files) create test data via HTTP requests to the TestClient
- **Autouse fixture** (`clear_db`) resets all in-memory databases between tests
- Tests assert HTTP status codes; responses are validated against schemas

Example test pattern:
```python
def test_create_loan(user_data, book_data):
    response = client.post("/loan", json={"user_id": user_data["id"], "book_id": book_data["id"]})
    assert response.status_code == 200
```

## Key Files & Responsibilities

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app instantiation, exception handlers, router registration |
| `routers/*.py` | HTTP endpoints; delegate to services, convert responses to schemas |
| `services/*.py` | Business logic, in-memory data operations, validation rules |
| `schemas/*.py` | Pydantic models for request/response validation |
| `exceptions/exceptions.py` | Custom exception definitions with HTTP status codes |
| `test/test_*.py` | Integration tests; clear databases between tests |

## Adding a New Endpoint

1. **Define schema** in `schemas/` (Pydantic model for input/output)
2. **Implement service logic** in `services/` (business rules, data operations)
3. **Create router endpoint** in `routers/` (call service, validate response, return schema)
4. **Register router** in `main.py` (if creating a new entity)
5. **Add tests** in `test/test_*.py` (test via HTTP using TestClient)

## Recent Refactoring Note

The most recent commit (`30c0bd6`) extracted the book-author relationship into an intermediate table pattern via `book_author_service.py`. This separates the many-to-many relationship logic from the core book service logic.
