# Task List: Node.js Backend for CursorPool

> Generated from: `0001-prd-nodejs-backend.md`

## Current State Assessment

**Existing Infrastructure:**

- Client is a Tauri desktop application with Vue3 frontend
- Client expects backend at configurable base URL with `/api` prefix
- Tauri commands in `src-tauri/src/api/endpoints.rs` define expected API contracts
- All API specifications defined in `swagger.json` at project root
- No backend server code exists yet - starting from scratch in `server/` directory

**Integration Requirements:**

- Backend must respond to requests from `localhost` (Tauri client)
- API base path: `/api` (e.g., `http://localhost:3000/api`)
- Must support CORS for local development
- Response format must match swagger.json specification exactly

## Relevant Files

**Created:**

- `server/package.json` - Node.js project configuration with dependencies (express, sqlite3, bcrypt, jsonwebtoken, express-rate-limit, cors, dotenv, multer)
- `server/.env.example` - Environment variable template with PORT, JWT config, database path, and admin API key
- `server/.env` - Local environment configuration (copied from .env.example)
- `server/src/utils/response.js` - Standard API response formatter with success/error helpers
- `server/src/middleware/errorHandler.js` - Centralized error handling middleware with logging
- `server/src/app.js` - Express application setup with CORS, body parsing, and /api base routing
- `server/database/schema.sql` - Complete database schema with all tables (users, email_verification_codes, accounts_pool, activation_codes, articles, bug_reports, public_info)
- `server/src/config/database.js` - SQLite database connection with promise-based query methods and schema initialization
- `server/database/seed.sql` - Sample data with test user, 3 accounts, 5 activation codes, 3 articles, and public info
- `server/src/services/tokenService.js` - JWT token generation and verification with error handling
- `server/src/services/emailService.js` - Email verification code generation, storage, and validation with 10min expiry
- `server/src/middleware/auth.js` - JWT authentication middleware with Bearer token extraction
- `server/src/middleware/validator.js` - Request validation middleware for email, password, and username
- `server/src/controllers/authController.js` - Authentication controller with checkUser, sendEmailCode, register, login, and resetPassword functions
- `server/src/routes/auth.js` - Authentication routes wired to /api/auth endpoints
- `server/src/config/database.js` - Updated with proper schema initialization (handles existing indexes gracefully)
- `server/src/utils/response.js` - Updated with sendSuccess and sendError helper functions
- `server/src/controllers/userController.js` - User controller with getUserInfo, updatePassword, and activate functions
- `server/src/routes/user.js` - User management routes wired to /api/user endpoints with auth middleware
- `server/src/controllers/accountPoolController.js` - Account pool controller with getAccount function and quota/usage logic
- `server/src/routes/accountPool.js` - Account pool routes wired to /api/accountpool endpoints with auth middleware
- `server/src/app.js` - Updated with user and accountpool routes

**To Be Created:**

- `server/src/middleware/rateLimiter.js` - Rate limiting middleware for API protection
- `server/src/routes/system.js` - System endpoints (public info, articles, version)
- `server/src/routes/admin.js` - Admin endpoints for managing accounts and codes
- `server/src/controllers/systemController.js` - System endpoints business logic
- `server/src/controllers/adminController.js` - Admin endpoints business logic
- `server/src/utils/validation.js` - Input validation helpers
- `server/README.md` - Backend setup and usage documentation

### Notes

- Server directory structure created with all necessary folders
- Following Express.js with sqlite3 (async API, no build tools required)
- 241 npm packages installed successfully
- No tests initially (PRD scope), can be added later
- Focus on matching swagger.json API contract exactly

---

## Tasks

- [x] **1.0 Project Initialization & Core Setup**
  - [x] 1.1 Create `server/` directory structure (src, config, routes, controllers, services, utils, middleware, database)
  - [x] 1.2 Initialize Node.js project with `package.json` and install dependencies (express, sqlite3, bcrypt, jsonwebtoken, express-rate-limit, cors, dotenv, multer)
  - [x] 1.3 Create `.env.example` with all required environment variables (PORT, JWT_SECRET, JWT_EXPIRES_IN, DATABASE_PATH, NODE_ENV)
  - [x] 1.4 Create `src/utils/response.js` for standard API response formatting (status, msg, data, code)
  - [x] 1.5 Create `src/middleware/errorHandler.js` for centralized error handling
  - [x] 1.6 Create `src/app.js` with Express setup, CORS configuration, body parsing, and `/api` base path routing
  - [x] 1.7 Add start script and verify server runs on port 3000

- [x] **2.0 Database Schema & Models**
  - [x] 2.1 Create `database/schema.sql` with users table (id, email, username, password_hash, level, total_count, used_count, expire_time, created_at, updated_at)
  - [x] 2.2 Add email_verification_codes table (id, email, code, type, expires_at, used, created_at)
  - [x] 2.3 Add accounts_pool table (id, account, password, token, usage_count, status, distributed_time, created_at, updated_at)
  - [x] 2.4 Add activation_codes table (id, code, type, name, level, duration, max_uses, used_count, status, notes, activated_at, expired_at, created_at)
  - [x] 2.5 Add articles, bug_reports, and public_info tables
  - [x] 2.6 Create `src/config/database.js` for SQLite connection and schema initialization
  - [x] 2.7 Create `database/seed.sql` with sample data (2-3 accounts, 5 activation codes, 1 test user, sample articles)
  - [x] 2.8 Add database initialization logic to auto-create tables on first run

- [x] **3.0 Authentication System Implementation**
  - [x] 3.1 Create `src/services/tokenService.js` with JWT sign/verify functions
  - [x] 3.2 Create `src/services/emailService.js` for verification code generation and logging
  - [x] 3.3 Create `src/middleware/auth.js` for JWT token verification and user extraction
  - [x] 3.4 Create `src/middleware/validator.js` for email format and input validation
  - [x] 3.5 Create `src/controllers/authController.js` with checkUser function
  - [x] 3.6 Implement sendEmailCode function (generate 6-digit code, store with 10min expiry, log to console)
  - [x] 3.7 Implement register function (verify code, hash password with bcrypt, create user, return JWT)
  - [x] 3.8 Implement login function (verify credentials, generate JWT, return token + user info)
  - [x] 3.9 Implement resetPassword function (verify code, update password hash)
  - [x] 3.10 Create `src/routes/auth.js` and wire all authentication endpoints with proper body parsing
  - [x] 3.11 Test all auth endpoints match swagger.json response format

- [x] **4.0 User Management & Account Pool**
  - [x] 4.1 Create `src/controllers/userController.js` with getUserInfo function (extract user from JWT, return quota info)
  - [x] 4.2 Implement updatePassword function (verify old password, validate new password, update hash)
  - [x] 4.3 Implement activate function (verify activation code, update user expiry and level, increment code usage)
  - [x] 4.4 Create `src/routes/user.js` and wire user endpoints with auth middleware
  - [x] 4.5 Create `src/controllers/accountPoolController.js` with getAccount function
  - [x] 4.6 Implement account pool selection logic (check user quota, select least-used account, increment usage)
  - [x] 4.7 Create `src/routes/accountPool.js` and wire endpoint with auth middleware
  - [x] 4.8 Test account distribution works correctly and user quota decrements

- [ ] **5.0 System Endpoints & Admin Features**
  - [ ] 5.1 Create `src/controllers/systemController.js` with getPublicInfo function (return active announcement or default)
  - [ ] 5.2 Implement getArticleList function with pagination (10 per page)
  - [ ] 5.3 Implement reportBug function (validate and store bug report)
  - [ ] 5.4 Implement getVersion function (return simple version object)
  - [ ] 5.5 Create `src/routes/system.js` and wire all system endpoints (no auth required)
  - [ ] 5.6 Create `src/controllers/adminController.js` with createAccount function
  - [ ] 5.7 Implement createActivationCode function (generate unique code, store with parameters)
  - [ ] 5.8 Create `src/routes/admin.js` with simple API key authentication
  - [ ] 5.9 Add rate limiting middleware to auth routes (5/15min for sendEmailCode, 100/15min for others)

- [ ] **6.0 Testing & Documentation**
  - [ ] 6.1 Test complete user registration flow (send code → register → login)
  - [ ] 6.2 Test account pool retrieval with different scenarios (quota exceeded, no accounts, normal flow)
  - [ ] 6.3 Test activation code application and expiry updates
  - [ ] 6.4 Test password change and reset flows
  - [ ] 6.5 Verify all endpoints return correct swagger.json response format
  - [ ] 6.6 Test CORS with Tauri client connection
  - [ ] 6.7 Create `server/README.md` with setup instructions, environment variables, and API endpoint list
  - [ ] 6.8 Add usage examples and seed data documentation
  - [ ] 6.9 Verify rate limiting works correctly
  - [ ] 6.10 Final integration test with CursorPool client application

---

**Status:** Sub-tasks generated. Ready to begin implementation.

**Current Task:** Starting with 1.1
