from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models import User, get_db
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "viewer"  # default to viewer; set "commander" manually or via admin


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if req.role not in ("viewer", "commander"):
        raise HTTPException(status_code=400, detail="Role must be viewer or commander")
    user = User(username=req.username, hashed_password=hash_password(req.password), role=req.role)
    db.add(user)
    db.commit()
    return {"message": "User created", "role": req.role}


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role, "username": user.username}


@router.get("/me")
def me(db: Session = Depends(get_db), current_user: User = Depends(__import__("auth").get_current_user)):
    return {"username": current_user.username, "role": current_user.role}
