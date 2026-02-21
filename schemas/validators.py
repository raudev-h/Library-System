from datetime import date

def validate_password_length(value:str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return value

def validate_passwords_match(password:str, confirm_password:str):
        if password != confirm_password:
            raise ValueError("Passwords do not match")

def validate_date(incoming_date:date):
    if incoming_date > date.today():
        raise ValueError("La fecha es futura")
    return incoming_date

def validate_copies(copies:int):
        if copies < 0:
            raise ValueError("the number of copies must be positive")