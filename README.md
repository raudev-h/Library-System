# Library System

Sistema de gestión de biblioteca full-stack: una API REST construida con **FastAPI** y una interfaz web construida con **React + Vite**. Permite administrar usuarios, libros, autores y préstamos con validaciones de negocio (cupo máximo de préstamos por usuario, control de disponibilidad, soft deletes, etc.).

> Proyecto educativo. La capa de persistencia es **en memoria** (no usa base de datos), por lo que los datos se reinician cada vez que se reinicia el servidor.

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución](#instalación-y-ejecución)
  - [Backend (FastAPI)](#backend-fastapi)
  - [Frontend (React + Vite)](#frontend-react--vite)
- [Endpoints principales](#endpoints-principales)
- [Reglas de negocio](#reglas-de-negocio)
- [Testing](#testing)
- [Notas](#notas)

---

## Tecnologías

**Backend**
- Python 3.10+
- [FastAPI](https://fastapi.tiangolo.com/) — framework web
- [Uvicorn](https://www.uvicorn.org/) — servidor ASGI
- [Pydantic v2](https://docs.pydantic.dev/) — validación de schemas
- [pytest](https://docs.pytest.org/) + [httpx](https://www.python-httpx.org/) — testing

**Frontend**
- [React 19](https://react.dev/)
- [Vite 8](https://vite.dev/)
- [React Router 7](https://reactrouter.com/)
- [Axios](https://axios-http.com/) — cliente HTTP
- ESLint

---

## Estructura del proyecto

```
Library System/
├── main.py                  # Punto de entrada de FastAPI (app, CORS, handlers, routers)
├── conftest.py              # Configuración de path para pytest
├── pytest.ini               # Configuración de pytest
├── routers/                 # Endpoints HTTP (user, book, author, loan)
├── services/                # Lógica de negocio y "DB" en memoria
├── schemas/                 # Modelos Pydantic (request/response) + validators
├── exceptions/              # Excepciones personalizadas (404, 400, 409)
├── test/                    # Tests de integración con FastAPI TestClient
└── frontend/                # SPA en React + Vite
    ├── src/
    │   ├── api/             # Cliente Axios y módulos por recurso
    │   ├── components/      # Componentes comunes, formularios y layout
    │   ├── context/         # Contexts (e.g. Toast)
    │   ├── hooks/           # Custom hooks
    │   └── pages/           # Dashboard, Books, Loans, Members, Authors
    ├── package.json
    └── vite.config.js
```

---

## Requisitos previos

- **Python** 3.10 o superior
- **Node.js** 18 o superior (recomendado 20+) y **npm**
- **Git**

---

## Instalación y ejecución

Clona el repositorio:

```bash
git clone <URL-del-repo>
cd "Library System"
```

### Backend (FastAPI)

Desde la raíz del proyecto:

```bash
# 1. Crear y activar entorno virtual
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# Windows (cmd)
.venv\Scripts\activate.bat
# macOS / Linux
source .venv/bin/activate

# 2. Instalar dependencias
pip install fastapi uvicorn[standard] pydantic pytest httpx

# 3. Levantar el servidor con auto-reload
uvicorn main:app --reload
```

Por defecto la API queda disponible en:

- API: `http://127.0.0.1:8000`
- Docs interactivas (Swagger UI): `http://127.0.0.1:8000/docs`
- Docs alternativas (ReDoc): `http://127.0.0.1:8000/redoc`

> El backend tiene CORS abierto para `http://localhost:5173`, que es el puerto por defecto de Vite.

### Frontend (React + Vite)

En **otra terminal**, desde la carpeta `frontend/`:

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173`.

Otros scripts disponibles:

```bash
npm run build     # Build de producción en dist/
npm run preview   # Servir el build localmente
npm run lint      # Ejecutar ESLint
```

> El cliente Axios apunta a `http://127.0.0.1:8000` (ver `frontend/src/api/client.js`). Si cambias el host/puerto del backend, actualiza ese archivo.

---

## Endpoints principales

Todos los endpoints están documentados de forma interactiva en `/docs`. Resumen:

| Recurso | Método | Ruta                   | Descripción                          |
|---------|--------|------------------------|--------------------------------------|
| User    | GET    | `/user/`               | Listar usuarios                      |
| User    | GET    | `/user/{id}`           | Obtener usuario                      |
| User    | POST   | `/user/`               | Crear usuario                        |
| User    | PATCH  | `/user/{id}`           | Actualizar usuario                   |
| User    | DELETE | `/user/{id}`           | Soft delete (si no tiene préstamos)  |
| Book    | GET    | `/book/`               | Listar libros                        |
| Book    | GET    | `/book/{id}`           | Obtener libro                        |
| Book    | POST   | `/book/`               | Crear libro                          |
| Book    | PATCH  | `/book/{id}`           | Actualizar libro                     |
| Book    | DELETE | `/book/{id}`           | Soft delete                          |
| Author  | GET    | `/author/`             | Listar autores                       |
| Author  | GET    | `/author/{id}`         | Obtener autor                        |
| Author  | POST   | `/author/`             | Crear autor                          |
| Author  | PATCH  | `/author/{id}`         | Actualizar autor                     |
| Loan    | GET    | `/loan/`               | Listar préstamos                     |
| Loan    | GET    | `/loan/{id}`           | Obtener préstamo                     |
| Loan    | POST   | `/loan/`               | Crear préstamo                       |
| Loan    | POST   | `/loan/{id}/return`    | Marcar préstamo como devuelto        |
| Loan    | PATCH  | `/loan/{id}`           | Actualizar préstamo                  |

---

## Reglas de negocio

- **Préstamos**: máximo 3 activos por usuario, duración de 15 días.
- **Disponibilidad**: cada libro tiene `available_copies`; se decrementa al prestar y se incrementa al devolver.
- **Soft delete**: usuarios y libros con préstamos activos no pueden eliminarse; se marcan con `is_active=False`.
- **Sin duplicados**: un usuario no puede tener dos préstamos activos del mismo libro.
- **Errores tipados**: `NotFoundException` (404), `BadRequestException` (400), `ConflictException` (409) — convertidos a respuestas JSON por handlers globales en `main.py`.

---

## Testing

Desde la raíz, con el entorno virtual activado:

```bash
# Todos los tests
pytest

# Con verbose
pytest -v

# Un archivo
pytest test/test_loan.py

# Un test específico
pytest test/test_loan.py::test_create_loan

# Por patrón
pytest -k "loan"
```

Los tests usan `FastAPI TestClient` y un fixture `autouse` que limpia las "bases de datos" en memoria entre cada test.

---

## Notas

- Al ser almacenamiento en memoria, **los datos se pierden al reiniciar** el servidor.
- Si el puerto `8000` o `5173` están ocupados, puedes cambiarlos:
  - Backend: `uvicorn main:app --reload --port 8001`
  - Frontend: `npm run dev -- --port 5174` (recuerda actualizar el origen en CORS dentro de `main.py` y el `baseURL` en `frontend/src/api/client.js`).
