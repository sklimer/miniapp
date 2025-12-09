from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1.routers import users, menu, orders, payments, delivery, notifications, analytics
from .config import settings
from .database import database
import uvicorn

app = FastAPI(
    title="Restaurant Telegram Mini App API",
    description="Backend API for Telegram mini app with payment integration for restaurants",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Include API routers
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(menu.router, prefix="/api/v1", tags=["menu"])
app.include_router(orders.router, prefix="/api/v1", tags=["orders"])
app.include_router(payments.router, prefix="/api/v1", tags=["payments"])
app.include_router(delivery.router, prefix="/api/v1", tags=["delivery"])
app.include_router(notifications.router, prefix="/api/v1", tags=["notifications"])
app.include_router(analytics.router, prefix="/api/v1", tags=["analytics"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)