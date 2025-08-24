from backend.main import app as vercel_app

# Vercel expects a top-level variable 'app' that is an ASGI application
app = vercel_app


