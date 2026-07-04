<p align="center">
  <img src="./DevFusion-Cloud-IDE-logo.png" alt="DevFusion Cloud IDE Logo" width="180" />
</p>

<h1 align="center">DevFusion Cloud IDE</h1>

<p align="center">
  <strong>A full-stack cloud-based code editor — write, save, and run code directly in your browser.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Monaco-Editor-0078D4?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="Monaco Editor" />
  <img src="https://img.shields.io/badge/Piston-Execution_Engine-FF6B6B?style=for-the-badge" alt="Piston" />
</p>

<p align="center">
  <a href="https://devfusion-frontend.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
  <a href="https://dev-fusion-cloud-ide.onrender.com" target="_blank">
    <img src="https://img.shields.io/badge/🔗_API-Render-46E3B7?style=for-the-badge&logo=render" alt="API" />
  </a>
</p>

---

## 🌟 Overview

**DevFusion Cloud IDE** is a browser-based, full-stack integrated development environment that lets developers write, manage, and execute code in multiple programming languages — all from a single web interface. No local setup required.

It features a VS Code-style Monaco Editor, secure JWT-based authentication with email OTP verification, personal project management with cloud persistence via MongoDB, and real-time code execution powered by the open-source **Piston** runtime engine.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🖊️ **Monaco Editor** | VS Code's editor engine with syntax highlighting, auto-complete, and bracket colorization |
| ☁️ **Cloud Projects** | Save, load, update, and delete your coding projects stored securely in MongoDB |
| ▶️ **Live Code Execution** | Run code in 5 languages directly in the browser via Piston |
| 🔐 **Secure Auth** | JWT-based login with 6-digit OTP email verification via Brevo |
| 🌙 **Dark / Light Mode** | Full theme toggle with persistent preference |
| 📱 **Responsive Design** | Mobile-first layout built with Tailwind CSS |
| 🛡️ **Protected Routes** | Authenticated + verified users only access the editor and dashboard |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Role |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Monaco Editor | Code editing engine |
| React Router v6 | Client-side routing |
| Framer Motion | Animations |
| Axios | HTTP client |
| React Hot Toast | Notifications |

### Backend
| Technology | Role |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens | Authentication |
| bcrypt | Password hashing |
| express-validator | Input validation |
| Helmet | Security headers |
| Brevo API | Transactional email (OTP) |
| Piston | Sandboxed code execution |

---

## 🗂️ Project Structure

```
DevFusion-Cloud-IDE/
├── 📁 frontend/          # React + Vite application (deployed on Vercel)
│   ├── src/
│   │   ├── components/   # Layout & UI components
│   │   ├── context/      # Auth & Theme React contexts
│   │   ├── pages/        # Route-level page components
│   │   ├── services/     # API service layer
│   │   └── utils/        # Helper utilities
│   └── README.md         # Frontend documentation
│
├── 📁 backend/           # Node.js Express API (deployed on Render)
│   ├── controllers/      # Business logic handlers
│   ├── middleware/        # JWT auth middleware
│   ├── models/           # Mongoose data models
│   ├── routes/           # Express route definitions
│   ├── services/         # Email service (Brevo)
│   ├── utils/            # Shared utilities
│   ├── server.js         # App entry point
│   └── README.md         # Backend documentation
│
└── README.md             # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- A **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A **Brevo** account for email OTP (free tier works)
- A running **Piston** instance (or use a public one)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/DevFusion-Cloud-IDE.git
cd DevFusion-Cloud-IDE
```

---

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/devfusion
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
PISTON_URL=http://localhost:2000
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=DevFusion Cloud IDE
NODE_ENV=development
```

Start the development server:

```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### 3. Setup the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
# App runs on http://localhost:5173
```

---

## 🌐 Supported Languages

| Language | Runtime | Status |
|---|---|---|
| JavaScript | Node.js (Piston) | ✅ Supported |
| Python | Python (Piston) | ✅ Supported |
| Java | Java (Piston) | ✅ Supported |
| C++ | GCC (Piston) | ✅ Supported |
| C# | .NET (Piston) | ✅ Supported |

---

## 🔐 Authentication Flow

```
Register → OTP Email Sent → Verify OTP → Account Activated → Login → JWT Token
```

1. User registers with username, email, and password
2. A **6-digit OTP** is emailed via Brevo (valid for 10 minutes)
3. User enters OTP on the verification page
4. Account is activated and a JWT is issued
5. All subsequent requests are authenticated with `Authorization: Bearer <token>`

---

## 🚢 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | `https://devfusion-frontend.vercel.app` |
| Backend API | [Render](https://render.com) | `https://dev-fusion-cloud-ide.onrender.com` |
| Database | MongoDB Atlas | Cloud-hosted |

The backend includes a `render.yaml` for one-click deployment to Render.

---

## 📖 Documentation

- 📄 [Frontend README](./frontend/README.md) — Component architecture, routing, and state management
- 📄 [Backend README](./backend/README.md) — API endpoints, data models, and middleware

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  Built with ❤️ by <strong>Abel</strong> · DevFusion Cloud IDE © 2026
</p>