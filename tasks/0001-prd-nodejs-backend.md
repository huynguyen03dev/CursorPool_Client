# Product Requirements Document: Node.js Backend for CursorPool

## Introduction/Overview

Build a simple Node.js backend server that implements all API endpoints defined in `swagger.json`. The backend will serve the CursorPool client application by handling user authentication, managing a pool of Cursor accounts, and providing system functionality like announcements and bug reports.

**Problem:** The CursorPool client application requires a backend server to function, but only the client code is provided in the repository.

**Goal:** Create a working, straightforward backend that follows the exact API specification in `swagger.json` without unnecessary complexity.

## Goals

1. Implement all 14 API endpoints specified in `swagger.json` with exact request/response formats
2. Provide working user authentication and account management
3. Manage a pool of Cursor accounts that can be distributed to authenticated users
4. Enable basic system features (announcements, bug reporting, version info)
5. Use SQLite for simple, file-based data storage requiring zero configuration
6. Keep the codebase simple and maintainable for easy modification

## User Stories

1. **As a new user**, I want to register with my email and verification code so that I can access the CursorPool service.

2. **As a registered user**, I want to log in with my credentials so that I can obtain Cursor account credentials from the pool.

3. **As a logged-in user**, I want to activate my account with an activation code so that I can extend my service access period.

4. **As a logged-in user**, I want to retrieve Cursor account credentials from the pool so that I can use them in my Cursor IDE.

5. **As a system administrator**, I want to add Cursor accounts to the pool and create activation codes so that users can access the service.

6. **As any visitor**, I want to see system announcements without logging in so that I can stay informed about service updates.

7. **As a user**, I want to reset my password using email verification so that I can regain access if I forget it.

## Functional Requirements

### Authentication Endpoints

**FR-1**: POST `/checkUser` - Check if a user exists by email
- Accept `email` in request body (application/x-www-form-urlencoded)
- Return status 200 with user existence information

**FR-2**: POST `/register/sendEmailCode` - Send verification code via email
- Accept `email` and `type` (register or reset) in request body
- Generate a 6-digit verification code valid for 10 minutes
- Store code in database with expiration timestamp
- For development: Log code to console (production: send via email service)
- Return status 200 on success

**FR-3**: POST `/emailRegister` - Register new user
- Accept `email`, `code`, `password`, `spread` (optional) in multipart/form-data
- Verify email code is valid and not expired
- Hash password using bcrypt (10 rounds)
- Create user record with level 0 (free tier) by default
- Generate JWT token with user ID
- Return token and expiration timestamp

**FR-4**: POST `/login` - User login
- Accept `account` (email), `password`, `spread` (optional) in request body
- Verify password against hashed password in database
- Generate JWT token containing user ID
- Return token and full user info (UserInfo schema)

**FR-5**: POST `/emailResetPassword` - Reset password with verification code
- Accept `email`, `code`, `password` in request body
- Verify email code is valid and not expired
- Hash new password and update user record
- Invalidate used verification code
- Return status 200 on success

### User Management Endpoints

**FR-6**: GET `/user` - Get current user information
- Require valid JWT token in Authorization header (Bearer token)
- Extract user ID from token
- Return user's quota information (totalCount, usedCount, expireTime, level, etc.)
- Include models array with GPT usage stats (can be empty array initially)

**FR-7**: POST `/user/activate` - Activate account with activation code
- Require valid JWT token
- Accept `code` in request body
- Verify activation code exists and is valid (not expired, has remaining uses)
- Update user's expiration time based on code duration (days)
- Update user's level based on code level
- Increment code's used_count
- Deactivate code if max_uses reached
- Return status 200 on success

**FR-8**: POST `/user/updatePassword` - Change user password
- Require valid JWT token
- Accept `old_password`, `new_password`, `confirm_password` in request body
- Verify old_password matches current password
- Verify new_password equals confirm_password
- Hash and update password
- Return status 200 on success

### Account Pool Endpoints

**FR-9**: GET `/accountpool/get` - Get Cursor account from pool
- Require valid JWT token
- Accept optional query parameters: `account` (specific account email), `usage_count`
- Check if user is active (not expired, has remaining quota)
- If no specific account requested: Select least-used available account from pool
- Increment account usage_count and update distributed_time
- Decrement user's remaining quota (totalCount - usedCount)
- Return account info (email, password, token) and activation code info
- Return error if no accounts available or user quota exceeded

### System Endpoints

**FR-10**: GET `/public/info` - Get system announcement/public info
- No authentication required
- Return current public announcement/notification
- Include type, closeable flag, props (title, description), and actions array
- Can return empty/default message if no active announcement

**FR-11**: POST `/report` - Submit bug report
- No authentication required (optional: can require auth)
- Accept JSON body with BugReportRequest schema
- Required fields: app_version, os_version, device_model, cursor_version, bug_description, occurrence_time, severity
- Optional fields: api_key, screenshot_urls
- Store bug report in database
- Return status 200 on success

**FR-12**: GET `/article/list/{page}` - Get paginated article list
- Accept `page` as path parameter (integer, default 1)
- Return array of articles with id, title, content
- Implement pagination (10 articles per page)
- Return empty array if no articles exist

**FR-13**: GET `/version` - Get API version
- No authentication required
- Return simple JSON object with version string
- Used by client to test latency and connectivity
- Example: `{ "version": "1.0.0" }`

### Admin Endpoints (Bonus)

**FR-14**: POST `/admin/accounts/create` - Add account to pool (bonus feature)
- Create simple admin endpoint to add Cursor accounts
- Accept: account (email), password, token
- Store in accounts_pool table with status=1 (active)

**FR-15**: POST `/admin/codes/create` - Create activation code (bonus feature)
- Create simple admin endpoint to generate activation codes
- Accept: name, level, duration (days), max_uses
- Generate unique code string
- Store in activation_codes table

### Database Requirements

**FR-16**: Implement SQLite database with following tables:
- `users`: id, email, username, password_hash, level, total_count, used_count, expire_time, created_at, updated_at
- `email_verification_codes`: id, email, code, type (register/reset), expires_at, used, created_at
- `accounts_pool`: id, account, password, token, usage_count, status, distributed_time, created_at, updated_at
- `activation_codes`: id, code, type, name, level, duration, max_uses, used_count, status, notes, activated_at, expired_at, created_at
- `articles`: id, title, content, created_at, updated_at
- `bug_reports`: id, (all fields from BugReportRequest), created_at
- `public_info`: id, type, closeable, props (JSON), actions (JSON), active, created_at, updated_at

### Security Requirements

**FR-17**: JWT Authentication
- Use jsonwebtoken library
- Token expiration: 7 days
- Secret key stored in environment variable
- Include user ID in token payload

**FR-18**: Password Security
- Use bcrypt for password hashing
- Salt rounds: 10
- Minimum password length: 6 characters

**FR-19**: Input Validation
- Validate email format
- Validate required fields for all endpoints
- Sanitize inputs to prevent SQL injection (use parameterized queries)

**FR-20**: Rate Limiting
- Apply basic rate limiting to prevent abuse
- 100 requests per 15 minutes per IP for general endpoints
- 5 requests per 15 minutes per IP for sendEmailCode endpoint

### API Response Format

**FR-21**: All API responses must follow this standard format:
```json
{
  "status": 200,
  "msg": "Success message or error message",
  "data": { },
  "code": "SUCCESS"
}
```

## Non-Goals (Out of Scope)

1. **No production email service integration** - Will log verification codes to console for development (can be added later)
2. **No payment integration** - Activation codes are created manually by admin
3. **No advanced analytics** - Basic usage tracking only
4. **No WebSocket/real-time features** - REST API only
5. **No multi-server deployment** - Single server instance (SQLite limitation)
6. **No advanced caching** - Simple in-memory if needed
7. **No Cursor API integration** - Backend only stores/distributes account credentials; client handles Cursor API calls
8. **No user email verification requirement** - Users can register and use immediately (verification codes are for password reset)
9. **No OAuth/social login** - Email/password authentication only
10. **No file uploads** - Bug reports store screenshot URLs only (not actual files)

## Design Considerations

### Project Structure
```
server/
├── src/
│   ├── config/
│   │   └── database.js       # SQLite connection
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── validator.js       # Input validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Account.js
│   │   ├── ActivationCode.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── accountPool.js
│   │   ├── system.js
│   │   └── admin.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── ...
│   ├── services/
│   │   ├── emailService.js
│   │   └── tokenService.js
│   └── app.js                 # Express app setup
├── database/
│   ├── schema.sql             # Database schema
│   └── cursorpool.db          # SQLite database file (generated)
├── .env                       # Environment variables
├── package.json
└── README.md
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: Token expiration (default: 7d)
- `DATABASE_PATH`: SQLite database file path
- `NODE_ENV`: development/production

## Technical Considerations

1. **Framework**: Express.js - Simple, well-documented, large ecosystem
2. **Database**: better-sqlite3 - Synchronous API, faster than sqlite3, simpler code
3. **ORM**: None initially - Use direct SQL queries for simplicity (can add Prisma later)
4. **Body Parsing**: Express built-in + multer for multipart/form-data
5. **CORS**: Enable CORS for Tauri client (localhost origins)
6. **Error Handling**: Centralized error handling middleware
7. **Logging**: Simple console logging (or winston for structured logs)

## Success Metrics

1. **Functional Completeness**: All 13 required endpoints return correct responses per swagger.json (100% API coverage)
2. **Client Integration**: CursorPool client can successfully connect, authenticate, and retrieve accounts
3. **Response Time**: API responses < 200ms for 95% of requests
4. **Setup Time**: Developer can set up and run backend in < 5 minutes
5. **Code Quality**: Clear structure, commented code, follows Node.js best practices

## Open Questions

1. **Initial Data**: Should we provide seed data (sample accounts, activation codes) in the database?
   - Suggested: Yes, include 2-3 sample Cursor accounts and 5 activation codes

2. **Default User Quotas**: What should be the default totalCount for new free users?
   - Suggested: 100 uses, 30-day expiration

3. **Account Pool Selection Logic**: Confirm account selection strategy?
   - Suggested: Least-used first (distribute load evenly)

4. **Admin Authentication**: Should admin endpoints require special admin authentication?
   - Suggested: Simple API key in header for now (can enhance later)

5. **Activation Code Types**: What code types should be supported?
   - Suggested: 1=basic (30 days), 2=premium (90 days), 3=vip (365 days)

6. **Error Messages**: Should error messages be in English or Chinese?
   - Suggested: English for now (can add i18n later)

## Implementation Phases

### Phase 1: Core Setup (Priority: Critical)
- Project initialization (package.json, dependencies)
- SQLite database schema creation
- Express server setup with basic middleware
- Environment configuration

### Phase 2: Authentication (Priority: Critical)
- User registration flow (FR-2, FR-3)
- User login (FR-4)
- Password reset (FR-5)
- JWT token generation/verification
- checkUser endpoint (FR-1)

### Phase 3: User Management (Priority: High)
- Get user info (FR-6)
- Change password (FR-8)
- Activate account (FR-7)

### Phase 4: Account Pool (Priority: Critical)
- Get account from pool (FR-9)
- Account selection logic
- Usage tracking

### Phase 5: System Endpoints (Priority: Medium)
- Public info (FR-10)
- Article list (FR-12)
- Version endpoint (FR-13)
- Bug reports (FR-11)

### Phase 6: Admin Features (Priority: Low)
- Create activation codes (FR-15)
- Add accounts to pool (FR-14)

### Phase 7: Testing & Documentation (Priority: High)
- API testing with Postman/Thunder Client
- README with setup instructions
- Basic error handling improvements

## Acceptance Criteria

✅ All endpoints from swagger.json are implemented and return correct response format

✅ Users can register, login, and obtain JWT tokens

✅ Authenticated users can retrieve Cursor account credentials from pool

✅ Account pool selection distributes accounts fairly (least-used first)

✅ Password hashing works correctly (bcrypt)

✅ JWT authentication protects secured endpoints

✅ Email verification codes are generated and validated correctly

✅ Activation codes extend user access when applied

✅ SQLite database persists data correctly

✅ CursorPool client can successfully integrate with backend

✅ README includes clear setup and run instructions

✅ Server runs on configurable port (default 3000)

✅ CORS allows Tauri client connections

✅ Basic rate limiting prevents abuse

✅ Error responses follow standard format with helpful messages

