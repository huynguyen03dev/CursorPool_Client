# CursorPool Backend Server

Backend server for CursorPool - A multi-account management solution for Cursor IDE.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Security**: express-rate-limit, CORS
- **Other**: dotenv, multer

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
DATABASE_PATH=./database/cursorpool.db
ADMIN_API_KEY=your-admin-api-key-change-this
```

### 3. Initialize Database

The database will be automatically created and initialized on first run. To manually initialize or reset:

```bash
# Database schema will be auto-created from database/schema.sql
# Optional: Load seed data
sqlite3 database/cursorpool.db < database/seed.sql
```

### 4. Start Server

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

Server will start at `http://localhost:3000` with API base path `/api`.

## Environment Variables

| Variable         | Required | Default                  | Description                          |
| ---------------- | -------- | ------------------------ | ------------------------------------ |
| `PORT`           | No       | 3000                     | Server port                          |
| `NODE_ENV`       | No       | development              | Environment (development/production) |
| `JWT_SECRET`     | Yes      | -                        | Secret key for JWT token signing     |
| `JWT_EXPIRES_IN` | No       | 7d                       | JWT token expiration time            |
| `DATABASE_PATH`  | No       | ./database/cursorpool.db | SQLite database file path            |
| `ADMIN_API_KEY`  | Yes      | -                        | API key for admin endpoints          |

## Project Structure

```
server/
├── database/
│   ├── schema.sql           # Database schema definition
│   ├── seed.sql            # Sample seed data
│   └── cursorpool.db       # SQLite database (auto-created)
├── src/
│   ├── config/
│   │   └── database.js     # Database connection and initialization
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── userController.js        # User management
│   │   ├── accountPoolController.js # Account pool distribution
│   │   ├── systemController.js      # System endpoints
│   │   └── adminController.js       # Admin operations
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication middleware
│   │   ├── validator.js    # Input validation
│   │   ├── rateLimiter.js  # Rate limiting
│   │   └── errorHandler.js # Error handling
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── user.js         # User routes
│   │   ├── accountPool.js  # Account pool routes
│   │   ├── system.js       # System routes
│   │   └── admin.js        # Admin routes
│   ├── services/
│   │   ├── tokenService.js # JWT token operations
│   │   └── emailService.js # Email verification codes
│   ├── utils/
│   │   └── response.js     # Standard API response formatter
│   └── app.js              # Express app setup and entry point
├── .env.example            # Environment template
├── .env                    # Local environment config (gitignored)
├── package.json
└── README.md
```

## API Endpoints

All endpoints use base path `/api` (e.g., `http://localhost:3000/api/checkUser`).

### Authentication Endpoints

| Method | Endpoint                  | Description                   | Auth Required |
| ------ | ------------------------- | ----------------------------- | ------------- |
| POST   | `/checkUser`              | Check if user exists by email | No            |
| POST   | `/register/sendEmailCode` | Send email verification code  | No            |
| POST   | `/emailRegister`          | Register new user             | No            |
| POST   | `/login`                  | User login                    | No            |
| POST   | `/emailResetPassword`     | Reset password with code      | No            |

**Rate Limits:**

- `/register/sendEmailCode`: 5 requests per 15 minutes per IP
- Other auth endpoints: 100 requests per 15 minutes per IP

### User Management Endpoints

| Method | Endpoint               | Description                | Auth Required      |
| ------ | ---------------------- | -------------------------- | ------------------ |
| GET    | `/user`                | Get current user info      | Yes (Bearer token) |
| POST   | `/user/activate`       | Activate account with code | Yes (Bearer token) |
| POST   | `/user/updatePassword` | Update password            | Yes (Bearer token) |

### Account Pool Endpoints

| Method | Endpoint           | Description                  | Auth Required      |
| ------ | ------------------ | ---------------------------- | ------------------ |
| GET    | `/accountpool/get` | Get Cursor account from pool | Yes (Bearer token) |

### System Endpoints

| Method | Endpoint              | Description                  | Auth Required |
| ------ | --------------------- | ---------------------------- | ------------- |
| GET    | `/public/info`        | Get system announcement      | No            |
| GET    | `/article/list/:page` | Get article list (paginated) | No            |
| GET    | `/version`            | Get API version              | No            |
| POST   | `/report`             | Submit bug report            | No            |

### Admin Endpoints

| Method | Endpoint                 | Description               | Auth Required |
| ------ | ------------------------ | ------------------------- | ------------- |
| POST   | `/admin/account`         | Create new Cursor account | Yes (API key) |
| POST   | `/admin/activation-code` | Create activation code    | Yes (API key) |

**Admin Authentication:** Include header `X-API-Key: your-admin-api-key`

## API Response Format

All endpoints follow this standard response format:

### Success Response

```json
{
  "status": "success",
  "msg": "Operation successful",
  "data": { ... },
  "code": 200
}
```

### Error Response

```json
{
  "status": "error",
  "msg": "Error description",
  "data": null,
  "code": 400
}
```

## Usage Examples

### 1. User Registration Flow

```bash
# Step 1: Check if user exists
curl -X POST http://localhost:3000/api/checkUser \
  -d "email=user@example.com"

# Step 2: Send verification code
curl -X POST http://localhost:3000/api/register/sendEmailCode \
  -d "email=user@example.com&type=register"

# Step 3: Register with code (check console for code)
curl -X POST http://localhost:3000/api/emailRegister \
  -F "email=user@example.com" \
  -F "code=123456" \
  -F "password=mypassword123" \
  -F "spread=0"
```

### 2. User Login

```bash
curl -X POST http://localhost:3000/api/login \
  -d "account=user@example.com&password=mypassword123"
```

Response includes JWT token:

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": { ... }
  }
}
```

### 3. Get Account from Pool

```bash
curl -X GET http://localhost:3000/api/accountpool/get \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Admin: Create Activation Code

```bash
curl -X POST http://localhost:3000/api/admin/activation-code \
  -H "X-API-Key: your-admin-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "premium",
    "name": "New User Trial Code",
    "level": 2,
    "duration": 30,
    "max_uses": 100
  }'
```

## Database Schema

### Users Table

- `id`: Primary key
- `email`: Unique email address
- `username`: Username (auto-generated from email)
- `password_hash`: bcrypt hashed password
- `level`: User level (0=free, 1=basic, 2=premium)
- `total_count`: Total account usage quota
- `used_count`: Used account count
- `expire_time`: Account expiry timestamp
- `created_at`, `updated_at`: Timestamps

### Accounts Pool Table

- `id`: Primary key
- `account`: Cursor account email
- `password`: Cursor account password
- `token`: Cursor auth token
- `usage_count`: Times account has been used
- `status`: Account status (1=active, 0=inactive)
- `distributed_time`: Last distribution time
- `created_at`, `updated_at`: Timestamps

### Activation Codes Table

- `id`: Primary key
- `code`: Unique activation code
- `type`: Code type (trial/premium/etc)
- `name`: Display name
- `level`: User level granted by code
- `duration`: Days of access granted
- `max_uses`: Maximum usage limit
- `used_count`: Times code has been used
- `status`: Code status (1=active, 0=expired)
- `activated_at`, `expired_at`: Timestamps

See `database/schema.sql` for complete schema.

## Seed Data

Load sample data for testing:

```bash
sqlite3 database/cursorpool.db < database/seed.sql
```

### Sample Data Includes:

#### Test User

- **Email**: `test@example.com`
- **Password**: `test123` (hashed with bcrypt)
- **Level**: 1 (Basic)
- **Quota**: 100 total, 0 used
- **Expiry**: 30 days from creation

#### Cursor Accounts (3 accounts in pool)

1. `cursor_account1@example.com` / `password123` / `sample_token_1`
2. `cursor_account2@example.com` / `password456` / `sample_token_2`
3. `cursor_account3@example.com` / `password789` / `sample_token_3`

All accounts have `usage_count: 0` and `status: 1` (active).

#### Activation Codes (5 codes)

| Code | Type | Name | Level | Duration | Quota | Max Uses | Used | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `WELCOME2024` | trial | New User Trial Code | 1 | 7 days | 100 | 100 | 0 | 7-day trial, 100 credits |
| `PREMIUM30` | premium | Premium Monthly Membership | 2 | 30 days | 500 | 500 | 0 | 30-day premium membership, 500 credits |
| `UNLIMITED90` | vip | VIP Quarterly Card | 3 | 90 days | 2000 | 2000 | 5 | 90-day VIP membership, 2000 credits |
| `STUDENT2024` | student | Student Discount Code | 1 | 180 days | 1000 | 1000 | 12 | Student exclusive, 6 months 1000 credits |
| `TESTCODE` | test | Test Activation Code | 0 | 1 day | 10 | 10 | 0 | Single-use test activation code |

**Usage Example:**

```bash
# Login as test user
curl -X POST http://localhost:3000/api/login \
  -d "account=test@example.com&password=test123"

# Use activation code to upgrade
curl -X POST http://localhost:3000/api/user/activate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "code=WELCOME2024"
```

#### Articles (3 announcements)

1. **Welcome to CursorPool** - Welcome message with feature overview
2. **User Guide** - Quick start guide
3. **Frequently Asked Questions** - FAQ with common questions

#### Public Info

- `announcement`: "System running normally, welcome to use CursorPool!"
- `version`: "1.0.0"
- `maintenance`: "false"

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Rate Limiting**: Protects against brute force
4. **CORS**: Configured for local Tauri client
5. **Input Validation**: Email and password validation
6. **Error Handling**: Centralized error middleware

## Development

### Database Management

```bash
# Access SQLite console
sqlite3 database/cursorpool.db

# View all tables
.tables

# Query users
SELECT * FROM users;

# Reset database (delete and restart server)
rm database/cursorpool.db
npm start
```

### Logging

Email verification codes are logged to console (development mode):

```
[Email Service] Sending verification code: 123456 to user@example.com
```

## Integration with CursorPool Client

The Tauri client expects:

1. Base URL configurable (default: `http://localhost:3000`)
2. All endpoints prefixed with `/api`
3. CORS enabled for `localhost` origins
4. Response format matching `swagger.json` specification

Client-side API configuration is in `src/api/index.ts`.

## Troubleshooting

### Database Issues

**Error: "SQLITE_ERROR: no such table: users"**

- Solution: Delete `database/cursorpool.db` and restart server

### Authentication Issues

**Error: "Invalid token"**

- Check JWT_SECRET matches between requests
- Verify token hasn't expired (check JWT_EXPIRES_IN)
- Ensure Authorization header format: `Bearer <token>`

### CORS Errors

**Error: "CORS policy blocked"**

- Verify client origin matches CORS config in `src/app.js`
- Check client is using correct base URL

### Rate Limit Errors

**Error: "Too many requests"**

- Wait 15 minutes or restart server
- Adjust limits in `src/middleware/rateLimiter.js`

## API Documentation

Full API specification available in `swagger.json` at project root.

## License

MIT
