from fastapi import FastAPI
from fastapi.responses import JSONResponse
from routers import user, author, loan, book
from exceptions import BadRequestException, NotFoundException, ConflictException


app = FastAPI()

@app.exception_handler(NotFoundException)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail":str(exc)}
    )

@app.exception_handler(BadRequestException)
async def bad_request_handler(request, exc):
    return JSONResponse(
        content={"detail":str(exc)},
        status_code=exc.status_code
    )

@app.exception_handler(ConflictException)
async def conflict_handler(request, exc):
    return JSONResponse(
        content={"detail":str(exc)},
        status_code=exc.status_code
    )

app.include_router(user.router)
app.include_router(author.router)
app.include_router(book.router)
app.include_router(loan.router)