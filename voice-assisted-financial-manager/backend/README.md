# FinSay Backend API

A FastAPI-based backend service for the FinSay application, providing secure email authentication and user management.

## 🚀 Features

- **Email Verification**: Secure 6-digit verification codes
- **JWT Authentication**: Token-based authentication with expiration
- **Password Hashing**: Bcrypt password encryption
- **CORS Support**: Cross-origin resource sharing for frontend
- **Input Validation**: Pydantic models for data validation
- **Error Handling**: Comprehensive error responses
- **Health Checks**: API health monitoring

## 🛠️ Tech Stack

- **FastAPI**: Modern, fast web framework
- **Python 3.8+**: Programming language
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

## 🔧 Installation

1. **Clone the repository and navigate to backend**

   ```bash
   cd backend
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   SECRET_KEY=your-super-secret-key-here
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

## 🚀 Running the Server

### Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

Once the server is running, you can access:

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

## 🔌 API Endpoints

### Authentication Endpoints

#### POST `/auth/register`

Register a new user and send verification email.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "email": "user@example.com"
}
```

#### POST `/auth/verify-email`

Verify email with 6-digit code.

**Request Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "user": {
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_verified": true
  }
}
```

#### POST `/auth/resend-verification`

Resend verification code to email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Verification code resent to your email"
}
```

#### POST `/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

#### GET `/auth/me`

Get current user information (requires authentication).

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_verified": true
}
```

#### POST `/auth/logout`

Logout user (client-side token removal).

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Utility Endpoints

#### GET `/`

Root endpoint - API status.

**Response:**

```json
{
  "message": "FinSay API is running"
}
```

#### GET `/health`

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-07T10:30:00.000000"
}
```

## 🔒 Security Features

### Password Security

- **Bcrypt Hashing**: Passwords are hashed using bcrypt with salt
- **Minimum Length**: 8 characters required
- **Secure Storage**: Hashed passwords only stored

### JWT Authentication

- **Token Expiration**: 30-minute access token lifetime
- **Secure Algorithm**: HS256 signing algorithm
- **Bearer Token**: Authorization header required

### Email Verification

- **6-Digit Codes**: Secure random verification codes
- **10-Minute Expiry**: Codes expire after 10 minutes
- **One-Time Use**: Codes are invalidated after use

### CORS Protection

- **Origin Restriction**: Only allows specified origins
- **Credential Support**: Supports authenticated requests
- **Method Control**: Restricted HTTP methods

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in your `.env` file

### Environment Variables

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🧪 Testing

### Manual Testing

You can test the API using the interactive documentation at `http://localhost:8000/docs`

### Example cURL Commands

**Register a new user:**

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Verify email:**

```bash
curl -X POST "http://localhost:8000/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

**Login:**

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🚨 Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Invalid credentials or missing token
- **404 Not Found**: User or resource not found
- **500 Internal Server Error**: Server-side errors

### Error Response Format

```json
{
  "detail": "Error message description"
}
```

## 🔧 Development

### Project Structure

```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── README.md           # This file
└── .env               # Environment variables (create this)
```

### Adding New Endpoints

1. Define Pydantic models for request/response
2. Create endpoint function with appropriate decorators
3. Add error handling and validation
4. Update this README with endpoint documentation

### Database Integration

Currently using in-memory storage for demo purposes. For production:

1. Install database dependencies:

   ```bash
   pip install sqlalchemy psycopg2-binary alembic
   ```

2. Set up database models and migrations
3. Replace in-memory storage with database operations
4. Add connection pooling and optimization

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

```env
SECRET_KEY=your-production-secret-key
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-production-email@gmail.com
SMTP_PASSWORD=your-production-app-password
DATABASE_URL=postgresql://user:password@localhost/finsay
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the FinSay application and follows the same license terms.

## 🆘 Support

For issues and questions:

1. Check the API documentation at `/docs`
2. Review error messages in the console
3. Check environment variable configuration
4. Verify email settings for verification codes
