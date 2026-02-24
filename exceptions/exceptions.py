
class ConflictException(Exception):
    def __init__(self, message:str) -> None:
        super().__init__(message)
        self.status_code = 409

class NotFoundException(Exception):
    def __init__(self, message:str) -> None:
        super().__init__(message)
        self.status_code = 404

class BadRequestException(Exception):
    def __init__(self, message:str) -> None:
        super().__init__(message)
        self.status_code = 400