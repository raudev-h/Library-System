def validate_password_length(value:str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return value

def validate_passwords_match(password:str, confirm_password:str):
        if password != confirm_password:
            raise ValueError("Passwords do not match")