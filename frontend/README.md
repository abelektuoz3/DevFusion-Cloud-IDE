<p align="center">
  <img src="../DevFusion-Cloud-IDE-logo.png" alt="DevFusion Cloud IDE" width="140" />
</p>

<h1 align="center">DevFusion — Frontend</h1>

<p align="center">
  <strong>React + Vite SPA powering the DevFusion Cloud IDE experience.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Monaco_Editor-4.6-0078D4?style=for-the-badge&logo=visual-studio-code&logoColor=white" />
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routing](#pages--routing)
- [Components](#components)
- [State Management & Contexts](#state-management--contexts)
- [How It Works](#how-it-works)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

The DevFusion frontend is a **React 18 Single Page Application** built with **Vite**. It provides a fully-featured browser-based IDE experience, including:

- A landing page with animated sections
- Secure auth pages (register, login, OTP verification)
- A personal project dashboard
- A Monaco-powered code editor with a live output console
- Full dark/light theme support

---

## Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `react` | 18.2 | Core UI framework |
| `vite` | 5.0 | Build tool & HMR dev server |
| `react-router-dom` | 6.20 | Client-side routing |
| `tailwindcss` | 3.3 | Utility-first CSS framework |
| `@monaco-editor/react` | 4.6 | VS Code Monaco editor component |
| `axios` | 1.6 | HTTP client for API calls |
| `framer-motion` | 10.16 | Animations & transitions |
| `react-hot-toast` | 2.4 | Toast notification system |
| `react-icons` | 4.11 | Icon library (Feather Icons) |

---

## Project Structure

```
frontend/
├── public/                   # Static public assets
├── src/
│   ├── assets/               # Images, fonts, static resources
│   ├── components/
│   │   ├── layout/           # Page-level layout components
│   │   │   ├── Navbar.jsx    # Landing page navigation bar
│   │   │   ├── Hero.jsx      # Landing page hero section
│   │   │   ├── Features.jsx  # Feature highlights section
│   │   │   ├── HowItWorks.jsx# Step-by-step guide section
│   │   │   └── Footer.jsx    # Page footer
│   │   └── ui/               # Reusable UI primitives
│   │       ├── Button.jsx    # Styled button component
│   │       ├── Input.jsx     # Styled input component
│   │       ├── Loader.jsx    # Loading spinner
│   │       └── DarkModeToggle.jsx  # Theme switch toggle
│   ├── context/
│   │   ├── AuthContext.jsx   # Auth state + API client
│   │   └── ThemeContext.jsx  # Dark/light mode state
│   ├── hooks/                # Custom React hooks (reserved)
│   ├── layouts/              # Shared route layouts
│   ├── pages/
│   │   ├── Home.jsx          # Landing / marketing page
│   │   ├── Login.jsx         # Login form
│   │   ├── Register.jsx      # Registration form
│   │   ├── VerifyOTP.jsx     # OTP email verification page
│   │   ├── Dashboard.jsx     # Project management dashboard
│   │   └── Editor.jsx        # Monaco code editor + output console
│   ├── routes/               # Route guard definitions
│   ├── services/             # API service abstractions
│   ├── utils/                # Helper functions
│   ├── App.jsx               # Root component with route config
│   ├── main.jsx              # React DOM entry point
│   ├── App.css               # Global app styles
│   └── index.css             # Tailwind base styles
├── index.html                # HTML shell
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
└── vercel.json               # Vercel deployment config (SPA rewrite)
```

---

## Pages & Routing

All routing is handled by **React Router v6** in [`App.jsx`](./src/App.jsx).

```
/               → Home.jsx         (Public)  Landing page
/register       → Register.jsx     (Public)  Create account
/login          → Login.jsx        (Public)  Sign in
/verify-otp     → VerifyOTP.jsx    (Public)  Email OTP verification
/dashboard      → Dashboard.jsx    (🔒 Protected + Verified)
/editor/:id?    → Editor.jsx       (🔒 Protected + Verified)
```

### Protected Route Logic

The `<ProtectedRoute>` wrapper in `App.jsx` enforces two conditions before rendering a page:

1. **User must be authenticated** — a valid JWT must exist in auth context. If not, redirects to `/login`.
2. **User must be email-verified** (`user.isVerified === true`). If not, redirects to `/verify-otp`.

```jsx
// From App.jsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isVerified) return <Navigate to="/verify-otp" replace />;
  return children;
};
```

---

## Components

### 🗂️ Layout Components (`src/components/layout/`)

| Component | Description |
|---|---|
| `Navbar.jsx` | Responsive top navigation bar with auth links and mobile menu |
| `Hero.jsx` | Animated landing page hero with call-to-action buttons |
| `Features.jsx` | Grid of feature cards describing DevFusion's capabilities |
| `HowItWorks.jsx` | Step-by-step walkthrough of the IDE workflow |
| `Footer.jsx` | Page footer with links and copyright information |

### 🧩 UI Components (`src/components/ui/`)

| Component | Description |
|---|---|
| `DarkModeToggle.jsx` | Sun/Moon icon button that toggles dark mode via `ThemeContext` |
| `Button.jsx` | Reusable styled button with variants |
| `Input.jsx` | Styled form input with label support |
| `Loader.jsx` | Animated spinner for loading states |

---

## State Management & Contexts

### `AuthContext` (`src/context/AuthContext.jsx`)

The central authentication context. Wraps the entire app via `<AuthProvider>`.

**Provides:**

| Value | Type | Description |
|---|---|---|
| `user` | `Object \| null` | Current authenticated user (`id`, `username`, `email`, `isVerified`) |
| `loading` | `boolean` | Auth state hydration in progress |
| `api` | `AxiosInstance` | Pre-configured Axios instance with `Authorization: Bearer <token>` |
| `login(data)` | `Function` | Stores user + token, sets auth header |
| `logout()` | `Function` | Clears user + token from state and storage |

The `api` instance is the primary way all components make HTTP requests. It automatically attaches the JWT to every request:

```js
// How API calls are made from any component
const { api } = useAuth();
const response = await api.get('/projects');
const response = await api.post('/run', { language, code });
```

---

### `ThemeContext` (`src/context/ThemeContext.jsx`)

Manages the application's dark/light mode preference.

**Provides:**

| Value | Type | Description |
|---|---|---|
| `isDark` | `boolean` | Current theme state |
| `toggleTheme()` | `Function` | Flips the theme between light and dark |

The theme is applied by toggling the `dark` class on the `<html>` element, which activates Tailwind's `dark:` variant utilities throughout all components.

---

## How It Works

### 1. Authentication Flow

```
Register Form → POST /api/auth/register
     ↓
OTP sent to email (via Brevo)
     ↓
VerifyOTP Page → POST /api/auth/verify-otp
     ↓
JWT Token issued → stored in AuthContext
     ↓
Redirect to Dashboard
```

- Passwords are validated (min 6 chars) before submission
- Incorrect OTP increments a server-side attempts counter (max 5 attempts)
- "Resend OTP" is rate-limited to once per minute

---

### 2. Dashboard — Project Management

The **Dashboard** page (`src/pages/Dashboard.jsx`) displays the user's project library as a card grid.

**Features:**
- Fetches projects from `GET /api/projects` on mount
- Each card shows: project title, language icon/badge, code preview snippet, last updated timestamp
- **New Project** button → calls `POST /api/projects` with defaults, then navigates to the editor
- **Edit** icon → navigates to `/editor/:id`
- **Delete** icon → calls `DELETE /api/projects/:id` with a confirm dialog

---

### 3. Code Editor

The **Editor** page (`src/pages/Editor.jsx`) is the core IDE experience.

```
┌─────────────────────────────────────────────────────────┐
│  Toolbar: [← Back] [🟨 Title Input] [Language ▾] [Dark] [🗑] [Save] [▶ Run]  │
├──────────────────────────────────────────────┬──────────┤
│                                              │          │
│           Monaco Code Editor                │  Output  │
│         (VS Code engine)                    │ Console  │
│                                             │          │
└──────────────────────────────────────────────┴──────────┘
```

**Editor Configuration:**
- Theme: `vs-dark` (dark mode) / `vs-light` (light mode)
- Font: `JetBrains Mono`
- Features: line numbers, bracket pair colorization, auto-format on paste/type, IntelliSense suggestions

**Run Flow:**
1. Click **Run** → `POST /api/run` with `{ language, code }`
2. Backend forwards to Piston execution engine
3. Response `{ output, error, exitCode, success }` displayed in the output console
4. Status icons (✅ / ❌ / ⏳) reflect the last execution result

**Save Flow:**
- If project has an `id` (existing) → `PUT /api/projects/:id`
- If new (no id) → `POST /api/projects`, then navigates to `/editor/:newId`

---

## Running Locally

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables

Create a `.env` file in the `frontend/` root:

```env
VITE_API_URL=http://localhost:5000/api
```

> In production, set `VITE_API_URL` to your deployed backend URL (e.g. `https://dev-fusion-cloud-ide.onrender.com/api`).

---

## Deployment

The frontend is deployed to **Vercel**.

A [`vercel.json`](./vercel.json) file handles SPA routing (rewrites all paths to `index.html` for client-side navigation to work correctly):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Deploy steps:**
1. Push code to GitHub
2. Import repository in [vercel.com](https://vercel.com)
3. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy → Vercel auto-detects Vite and sets build command to `npm run build`

---

<p align="center">
  Part of <strong>DevFusion Cloud IDE</strong> · <a href="../README.md">← Back to Root README</a>
</p>
