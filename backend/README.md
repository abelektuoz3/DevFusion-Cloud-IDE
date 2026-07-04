<p align="center">
  <img src="../DevFusion-Cloud-IDE-logo.png" alt="DevFusion Cloud IDE" width="140" />
</p>

<h1 align="center">DevFusion — Backend API</h1>

<p align="center">
  <strong>Node.js + Express REST API powering authentication, project management, and code execution.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Authentication-FB015B?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Piston-Code_Execution-FF6B6B?style=for-the-badge" />
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Auth Endpoints](#auth-endpoints)
  - [Project Endpoints](#project-endpoints)
  - [Code Execution Endpoint](#code-execution-endpoint)
- [Data Models](#data-models)
- [Middleware](#middleware)
- [Services](#services)
- [Security](#security)
- [Deployment](#deployment)

---

## Overview

The DevFusion backend is a **RESTful API** built with **Node.js** and **Express**. It handles:

- **User authentication** — registration, email OTP verification, JWT-based login/logout
- **Project management** — full CRUD for user code projects stored in MongoDB
- **Code execution** — proxies code to the **Piston** open-source execution engine and returns the result

The API is deployed on **Render** and serves a CORS-restricted list of allowed origins.

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `express` | 4.18 | HTTP server framework |
| `mongoose` | 7.5 | MongoDB ODM |
| `jsonwebtoken` | 9.0 | JWT generation & verification |
| `bcrypt` | 5.1 | Password hashing |
| `express-validator` | 7.0 | Request body validation |
| `helmet` | 7.0 | HTTP security headers |
| `cors` | 2.8 | Cross-Origin Resource Sharing |
| `axios` | 1.18 | HTTP client for Piston & Brevo |
| `speakeasy` | 2.0 | TOTP-based OTP generation |
| `dotenv` | 16.3 | Environment variable loading |
| `nodemon` | 3.0 | Dev server auto-restart |

---

## Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection setup
├── controllers/
│   ├── authController.js     # Auth business logic (register, login, OTP)
│   └── projectController.js  # Project CRUD business logic
├── middleware/
│   └── auth.js               # JWT Bearer token verification middleware
├── models/
│   ├── User.js               # User Mongoose schema
│   └── Project.js            # Project Mongoose schema
├── routes/
│   ├── auth.js               # /api/auth/* route definitions
│   ├── projects.js           # /api/projects/* route definitions
│   └── run.js                # /api/run route + Piston proxy
├── services/
│   └── emailService.js       # Brevo API — OTP & welcome emails
├── utils/                    # Shared utility helpers
├── .env                      # Environment variables (not committed)
├── server.js                 # App entry point
├── package.json
└── render.yaml               # Render deployment configuration
```

---

## Running Locally

```bash
# Install dependencies
cd backend
npm install

# Start development server (with auto-reload)
npm run dev
# → http://localhost:5000

# Start production server
npm start
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/devfusion

# Auth
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# CORS
CLIENT_URL=http://localhost:5173

# Emails (Brevo)
BREVO_API_KEY=xkeysib-...
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=DevFusion Cloud IDE
FRONTEND_URL=http://localhost:5173

# Code Execution
PISTON_URL=http://localhost:2000
```

---

## API Reference

### Base URL

| Environment | URL |
|---|---|
| Local | `http://localhost:5000/api` |
| Production | `https://dev-fusion-cloud-ide.onrender.com/api` |

### Authentication

All **protected** routes require the following HTTP header:

```http
Authorization: Bearer <jwt_token>
```

---

### Health Check

#### `GET /api/health`

Check that the API server is running.

- **Access:** Public
- **Auth:** None required

**Response `200 OK`:**
```json
{
  "status": "OK",
  "message": "DevFusion API is running",
  "timestamp": "2026-07-04T08:00:00.000Z"
}
```

---

### Auth Endpoints

#### `POST /api/auth/register`

Register a new user account. Sends a **6-digit OTP** to the provided email for verification.

- **Access:** Public
- **Auth:** None

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "mysecurepassword"
}
```

**Validation Rules:**
- `username`: 3–30 characters
- `email`: must be a valid email address
- `password`: minimum 6 characters

**Response `201 Created`:**
```json
{
  "message": "User created. Please verify your email with the OTP sent.",
  "token": "<jwt_token>",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0",
    "username": "johndoe",
    "email": "john@example.com",
    "isVerified": false,
    "createdAt": "2026-07-04T08:00:00.000Z"
  },
  "requiresVerification": true
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Validation failed or email/username already taken |
| `500` | Server error |

---

#### `POST /api/auth/verify-otp`

Verify the 6-digit OTP sent to the user's email after registration.

- **Access:** Public
- **Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "482913"
}
```

**Response `200 OK`:**
```json
{
  "message": "Email verified successfully!",
  "token": "<jwt_token>",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0",
    "username": "johndoe",
    "email": "john@example.com",
    "isVerified": true,
    "createdAt": "2026-07-04T08:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | OTP is invalid, expired, or user is already verified |
| `404` | User not found |
| `429` | More than 5 failed OTP attempts — request a new OTP |

---

#### `POST /api/auth/resend-otp`

Request a new OTP to be sent to the user's email.

- **Access:** Public
- **Auth:** None
- **Rate Limit:** 1 resend per 60 seconds

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response `200 OK`:**
```json
{
  "message": "New OTP sent to your email"
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | User already verified |
| `404` | User not found |
| `429` | Resend requested within 60 seconds of last one |

---

#### `POST /api/auth/login`

Authenticate a verified user and receive a JWT token.

- **Access:** Public
- **Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "mysecurepassword"
}
```

**Response `200 OK`:**
```json
{
  "message": "Login successful",
  "token": "<jwt_token>",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0",
    "username": "johndoe",
    "email": "john@example.com",
    "isVerified": true,
    "createdAt": "2026-07-04T08:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `401` | Invalid credentials |
| `403` | Email not verified — `requiresVerification: true` included |

---

#### `GET /api/auth/me`

Get the currently authenticated user's profile.

- **Access:** 🔒 Private
- **Auth:** JWT Bearer token required

**Response `200 OK`:**
```json
{
  "user": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0",
    "username": "johndoe",
    "email": "john@example.com",
    "isVerified": true,
    "createdAt": "2026-07-04T08:00:00.000Z",
    "updatedAt": "2026-07-04T08:00:00.000Z"
  }
}
```

---

#### `POST /api/auth/logout`

Logout the current user (stateless — client is responsible for discarding the token).

- **Access:** 🔒 Private
- **Auth:** JWT Bearer token required

**Response `200 OK`:**
```json
{
  "message": "Logout successful"
}
```

---

### Project Endpoints

> All project routes require authentication (`Authorization: Bearer <token>`).

---

#### `POST /api/projects`

Create a new code project.

- **Access:** 🔒 Private

**Request Body:**
```json
{
  "title": "My First Script",
  "language": "python",
  "code": "print('Hello, World!')",
  "description": "A simple hello world",
  "isPublic": false
}
```

**Supported Languages:** `javascript` | `python` | `java` | `cpp` | `csharp`

**Response `201 Created`:**
```json
{
  "_id": "64b2c3d4e5f6a7b8c9d0e1f2",
  "title": "My First Script",
  "owner": "64a1b2c3d4e5f6g7h8i9j0",
  "language": "python",
  "code": "print('Hello, World!')",
  "description": "A simple hello world",
  "isPublic": false,
  "createdAt": "2026-07-04T08:00:00.000Z",
  "updatedAt": "2026-07-04T08:00:00.000Z"
}
```

---

#### `GET /api/projects`

Get all projects belonging to the authenticated user, sorted by newest first. Code content is **excluded** from this list response for performance.

- **Access:** 🔒 Private

**Response `200 OK`:**
```json
[
  {
    "_id": "64b2c3d4e5f6a7b8c9d0e1f2",
    "title": "My First Script",
    "language": "python",
    "description": "A simple hello world",
    "isPublic": false,
    "createdAt": "2026-07-04T08:00:00.000Z",
    "updatedAt": "2026-07-04T08:00:00.000Z"
  }
]
```

> ℹ️ The `code` field is intentionally omitted from this list endpoint (`.select('-code')`). Use the single project endpoint to retrieve code.

---

#### `GET /api/projects/:id`

Get a single project by ID, including its full code content.

- **Access:** 🔒 Private (must be the project owner)

**Response `200 OK`:**
```json
{
  "_id": "64b2c3d4e5f6a7b8c9d0e1f2",
  "title": "My First Script",
  "owner": "64a1b2c3d4e5f6g7h8i9j0",
  "language": "python",
  "code": "print('Hello, World!')",
  "description": "A simple hello world",
  "isPublic": false,
  "createdAt": "2026-07-04T08:00:00.000Z",
  "updatedAt": "2026-07-04T08:00:00.000Z"
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `404` | Project not found or not owned by requesting user |

---

#### `PUT /api/projects/:id`

Update an existing project (title, language, code, description, visibility).

- **Access:** 🔒 Private (must be the project owner)

**Request Body** *(all fields optional)*:
```json
{
  "title": "Renamed Script",
  "language": "javascript",
  "code": "console.log('Updated!');",
  "description": "Now in JavaScript",
  "isPublic": true
}
```

**Response `200 OK`:** Returns the full updated project document.

**Error Responses:**

| Status | Condition |
|---|---|
| `404` | Project not found or not owned by requesting user |

---

#### `DELETE /api/projects/:id`

Permanently delete a project.

- **Access:** 🔒 Private (must be the project owner)

**Response `200 OK`:**
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `404` | Project not found or not owned by requesting user |

---

### Code Execution Endpoint

#### `POST /api/run`

Execute code in a supported programming language using the **Piston** sandboxed runtime engine.

- **Access:** 🔒 Private
- **Auth:** JWT Bearer token required
- **Timeout:** 30 seconds

**Request Body:**
```json
{
  "language": "python",
  "code": "print('Hello from Python!')",
  "stdin": ""
}
```

**Supported Language Mapping:**

| `language` field | Piston Runtime |
|---|---|
| `javascript` | `node` |
| `python` | `python` |
| `java` | `java` |
| `cpp` | `gcc` |
| `csharp` | `dotnet` |

**Response `200 OK` (success):**
```json
{
  "output": "Hello from Python!",
  "error": null,
  "exitCode": 0,
  "executionTime": 0.123,
  "language": "python",
  "success": true
}
```

**Response `200 OK` (runtime error):**
```json
{
  "output": "Traceback (most recent call last):\n  File...",
  "error": "NameError: name 'x' is not defined",
  "exitCode": 1,
  "executionTime": 0.089,
  "language": "python",
  "success": false
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Unsupported language or empty code |
| `503` | Piston execution engine is unavailable |
| `504` | Execution timed out (> 30 seconds) |

---

## Data Models

### User Model (`models/User.js`)

```
User {
  username     : String   (required, unique, 3–30 chars)
  email        : String   (required, unique, lowercase)
  password     : String   (required, bcrypt-hashed)
  isVerified   : Boolean  (default: false)
  otp: {
    code       : String   (6-digit OTP, null after verification)
    expiresAt  : Date     (10 minutes after generation)
  }
  otpAttempts  : Number   (max 5 before lockout)
  lastOtpRequest: Date    (rate-limit resend to once/min)
  createdAt    : Date     (auto)
  updatedAt    : Date     (auto)
}
```

**Security behaviors:**
- `password` is auto-hashed via bcrypt (salt rounds: 10) using a `pre-save` hook
- `toJSON()` strips `password`, `otp`, `otpAttempts`, and `lastOtpRequest` from all API responses

---

### Project Model (`models/Project.js`)

```
Project {
  title        : String   (required, max 100 chars)
  owner        : ObjectId (ref: User, required)
  language     : String   (enum: javascript|python|java|cpp|csharp)
  code         : String   (default: '// Write your code here')
  description  : String   (max 500 chars)
  isPublic     : Boolean  (default: false)
  createdAt    : Date     (auto)
  updatedAt    : Date     (auto)
}
```

**Database indexes:** `{ owner: 1, createdAt: -1 }` — optimizes per-user project listing queries.

---

## Middleware

### `middleware/auth.js` — JWT Verification

Applied to all protected routes. Reads the `Authorization: Bearer <token>` header, verifies it against `JWT_SECRET`, looks up the user in MongoDB, and attaches the user to `req.user`.

```
Request → Extract Bearer token
       → jwt.verify(token, JWT_SECRET)
       → User.findById(decoded.userId).select('-password')
       → req.user = user
       → next()
```

If the token is missing, expired, or invalid, responds with `401 Unauthorized`.

---

## Services

### `services/emailService.js` — Brevo Email API

Handles all transactional email sending using the [Brevo (formerly Sendinblue)](https://www.brevo.com) REST API.

| Function | Trigger | Email Subject |
|---|---|---|
| `generateOTP()` | Registration / Resend OTP | — (returns 6-digit code) |
| `sendOTPEmail(email, otp, username)` | After registration or resend | "Verify Your DevFusion Account" |
| `sendVerificationSuccessEmail(email, username)` | After OTP verified | "🎉 Welcome to DevFusion Cloud IDE!" |

Both emails are styled HTML templates with the DevFusion brand, the OTP displayed in a large dashed box, and a clickable "Verify Email" / "Start Coding" button.

---

## Security

| Layer | Implementation |
|---|---|
| **HTTP Headers** | `helmet` sets `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, etc. |
| **CORS** | Strict allowlist of origins; only `localhost`, Vercel, and Render URLs permitted |
| **Password Hashing** | bcrypt with 10 salt rounds — never stored in plaintext |
| **JWT** | 7-day expiry; `Bearer` scheme; verified on every protected request |
| **OTP Security** | 10-minute expiry · 5 attempt lockout · 60-second resend rate limit |
| **Input Validation** | `express-validator` validates and sanitizes all auth inputs |
| **Ownership Checks** | All project operations filter by `owner: req.user._id` — users can only access their own projects |
| **Request Size** | `express.json({ limit: '10mb' })` caps request body size |

---

## Deployment

The backend is deployed on **Render** using [`render.yaml`](./render.yaml):

```yaml
services:
  - type: web
    name: devfusion-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false       # Set manually in Render dashboard
      - key: JWT_SECRET
        sync: false       # Set manually in Render dashboard
      - key: CLIENT_URL
        sync: false       # Set to your Vercel frontend URL
      - key: PISTON_URL
        value: http://localhost:2000
```

**Deploy steps:**
1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com) and connect your repo
3. Set all `sync: false` environment variables manually in the Render dashboard
4. Render will auto-deploy on every push to the main branch

---

<p align="center">
  Part of <strong>DevFusion Cloud IDE</strong> · <a href="../README.md">← Back to Root README</a>
</p>
