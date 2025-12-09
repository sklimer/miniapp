# Restaurant Telegram Mini App Backend

This is the backend for a Telegram mini app with payment integration for restaurants. The application allows restaurants to receive orders via Telegram, manage their menu, handle payments, and maintain customer relationships.

## Features

- **Menu Management**: View and manage restaurant menu items
- **Order Processing**: Handle delivery and pickup orders with online payment or cash
- **Customer Database**: Track customers and their order history
- **Notifications**: Send automated and manual notifications to customers
- **Loyalty Program**: Bonus system with referral rewards
- **Delivery Calculation**: Calculate delivery costs based on distance
- **Analytics**: View business metrics and order statistics

## Tech Stack

- **Backend**: Python (FastAPI)
- **Database**: PostgreSQL
- **Frontend**: React + Vite + TypeScript (separate repository)
- **Payments**: YooKassa
- **Telegram Integration**: Telegram Bot API

## Project Structure

```
backend/
├── main.py                 # Main application entry point
├── config.py              # Configuration settings
├── database.py            # Database connection setup
├── models/                # SQLAlchemy ORM models
│   ├── __init__.py
│   ├── user.py
│   ├── menu.py
│   ├── order.py
│   ├── payment.py
│   ├── delivery.py
│   ├── bonus.py
│   ├── notification.py
│   └── business.py
├── schemas/               # Pydantic schemas for request/response validation
│   ├── __init__.py
│   ├── user.py
│   ├── menu.py
│   ├── order.py
│   ├── payment.py
│   ├── delivery.py
│   ├── bonus.py
│   ├── notification.py
│   └── business.py
├── api/                   # API routes
│   ├── __init__.py
│   ├── v1/                # API version 1
│   │   ├── __init__.py
│   │   └── routers/       # Individual route handlers
│   │       ├── __init__.py
│   │       ├── users.py
│   │       ├── menu.py
│   │       ├── orders.py
│   │       ├── payments.py
│   │       ├── delivery.py
│   │       ├── notifications.py
│   │       └── analytics.py
└── utils/                 # Utility functions
    └── __init__.py
```

## Setup Instructions

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables in a `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost/restaurant_db
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
YOOKASSA_SHOP_ID=your_yookassa_shop_id
YOOKASSA_API_KEY=your_yookassa_api_key
SECRET_KEY=your_secret_key
```

3. Run the application:
```bash
uvicorn backend.main:app --reload
```

## API Endpoints

The API is organized into several modules:

- `/api/v1/users/` - User management
- `/api/v1/menu/` - Menu and product management
- `/api/v1/orders/` - Order processing
- `/api/v1/payments/` - Payment handling
- `/api/v1/delivery/` - Delivery calculation and zones
- `/api/v1/notifications/` - Notification sending
- `/api/v1/analytics/` - Business analytics

## Database Schema

The database schema includes tables for users, menu items, orders, payments, delivery zones, and more. See the individual model files for detailed schema definitions.

## Environment Variables

- `DATABASE_URL`: PostgreSQL database connection string
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `YOOKASSA_SHOP_ID`: YooKassa shop identifier
- `YOOKASSA_API_KEY`: YooKassa API key
- `SECRET_KEY`: Secret key for JWT tokens
- `DELIVERY_BASE_COST`: Base delivery cost
- `DELIVERY_COST_PER_KM`: Cost per kilometer for delivery
- `FREE_DELIVERY_THRESHOLD`: Order amount for free delivery
- `MIN_ORDER_AMOUNT`: Minimum order amount
- `RESTAURANT_ADDRESS_LAT`: Latitude of restaurant
- `RESTAURANT_ADDRESS_LON`: Longitude of restaurant