from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="FinSay API",
    description="Voice-Assisted Financial Manager Backend API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Email settings
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./finsay.db")

# For production, use PostgreSQL:
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/finsay")

# Simple in-memory storage for demo (replace with proper database in production)
# TODO: Implement proper database models with SQLAlchemy or similar
users_db = {}
verification_codes = {}

# Database initialization function (placeholder)
def init_database():
    """Initialize database tables if they don't exist"""
    # This is a placeholder for proper database initialization
    # In production, you would use SQLAlchemy models or similar
    pass

# Initialize database on startup
init_database()

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerificationCode(BaseModel):
    email: EmailStr
    code: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    email: str
    first_name: str
    last_name: str
    is_verified: bool

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_verification_code():
    return str(secrets.randbelow(900000) + 100000)

def send_verification_email(email: str, code: str):
    """Send verification email (placeholder implementation)"""
    try:
        # In a real implementation, you would use SMTP to send emails
        # For demo purposes, we'll just print the code
        print(f"Verification code for {email}: {code}")
        
        # Example SMTP implementation (commented out for demo):
        """
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = email
        msg['Subject'] = "FinSay - Email Verification"
        
        body = f"""
        <html>
            <body>
                <h2>Welcome to FinSay!</h2>
                <p>Your verification code is: <strong>{code}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_USERNAME, email, text)
        server.quit()
        """
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = users_db.get(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# API endpoints
@app.get("/")
async def root():
    return {"message": "FinSay API is running"}

@app.post("/auth/register", response_model=dict)
async def register(user: UserCreate):
    """Register a new user and send verification email"""
    if user.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Store user (not verified yet)
    users_db[user.email] = {
        "email": user.email,
        "hashed_password": hashed_password,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_verified": False,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Generate and store verification code
    verification_code = generate_verification_code()
    verification_codes[user.email] = {
        "code": verification_code,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=10)
    }
    
    # Send verification email
    if send_verification_email(user.email, verification_code):
        return {
            "success": True,
            "message": "Verification code sent to your email",
            "email": user.email
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )

@app.post("/auth/verify-email", response_model=dict)
async def verify_email(verification: VerificationCode):
    """Verify email with verification code"""
    user = users_db.get(verification.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user["is_verified"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    stored_verification = verification_codes.get(verification.email)
    if not stored_verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code not found or expired"
        )
    
    if datetime.utcnow() > stored_verification["expires_at"]:
        del verification_codes[verification.email]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code expired"
        )
    
    if stored_verification["code"] != verification.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Mark user as verified
    user["is_verified"] = True
    user["verified_at"] = datetime.utcnow().isoformat()
    
    # Remove verification code
    del verification_codes[verification.email]
    
    return {
        "success": True,
        "message": "Email verified successfully",
        "user": {
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "is_verified": user["is_verified"]
        }
    }

@app.post("/auth/resend-verification", response_model=dict)
async def resend_verification(email: EmailStr):
    """Resend verification code"""
    user = users_db.get(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user["is_verified"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Generate new verification code
    verification_code = generate_verification_code()
    verification_codes[email] = {
        "code": verification_code,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(minutes=10)
    }
    
    # Send verification email
    if send_verification_email(email, verification_code):
        return {
            "success": True,
            "message": "Verification code resent to your email"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Login user"""
    user = users_db.get(user_credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user["is_verified"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email before logging in"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "email": current_user["email"],
        "first_name": current_user["first_name"],
        "last_name": current_user["last_name"],
        "is_verified": current_user["is_verified"]
    }

@app.post("/auth/logout")
async def logout():
    """Logout user (client-side token removal)"""
    return {"success": True, "message": "Logged out successfully"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

