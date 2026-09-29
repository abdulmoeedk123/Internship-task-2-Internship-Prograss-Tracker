# Intern Progress Tracking System

A full-stack app for tracking intern onboarding, task assignment, and progress.

- **Frontend:** React (Vite) — separate dashboards for Admins and Interns
- **Backend:** Node.js / Express — REST API with JWT authentication
- **Database:** MongoDB (via Mongoose)

## Project structure

```
intern-tracker/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js    # JWT auth + role guard
│   ├── models/
│   │   ├── User.js           # Admins & interns (role field)
│   │   └── Task.js           # Tasks with status, progress, submission, feedback
│   ├── routes/
│   │   ├── auth.js           # login, /me, admin onboarding of interns
│   │   ├── interns.js        # CRUD for intern profiles
│   │   └── tasks.js          # CRUD for tasks / progress updates
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/Login.jsx
    │   ├── pages/AdminDashboard.jsx
    │   ├── pages/InternDashboard.jsx
    │   ├── components/ProtectedRoute.jsx
    │   ├── components/ProgressBar.jsx
    │   ├── context/AuthContext.jsx
    │   ├── api.js
    │   └── main.jsx / App.jsx / styles.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Design

The frontend uses Tailwind CSS with a custom green (`brand`) color palette, Poppins for headings and Inter for body text, a sticky top navbar with a user menu, and modal-based forms for onboarding interns and creating tasks (styled after professional internship platforms like internee.pk). Tailwind is installed as a normal dependency — running `npm install` in `frontend/` pulls in `tailwindcss`, `postcss`, `autoprefixer`, and `lucide-react` (icons) automatically; no extra setup needed.

## How it works

- **Roles:** every user is either `admin` or `intern` (same `User` model, `role` field).
- **Admin onboarding:** only an existing admin can create new intern accounts (`POST /api/auth/onboard`). A default admin account is auto-created on first server start from the `ADMIN_SEED_*` values in `.env`.
- **Tasks:** admins create and assign tasks to interns, give feedback, and mark tasks complete. Interns see only their own tasks, update progress with a slider, and submit work (text notes + a link).
- **Auth:** JWT issued on login, stored in `localStorage` on the frontend, and sent as a `Bearer` token on every API request.

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env     # then edit MONGO_URI / JWT_SECRET / admin seed values
npm install
npm run dev               # starts on http://localhost:5000
```

Requires a running MongoDB instance (local `mongod`, Docker, or a MongoDB Atlas connection string in `MONGO_URI`).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no CORS configuration is needed in development.

### 3. Log in

Use the seeded admin credentials from your `.env` (`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`) to log in as an admin, then use the "Onboard New Intern" form to create intern accounts. Give each intern their login email + temporary password so they can sign in at `/login` and land on their own dashboard.

## API summary

| Method | Endpoint                    | Access        | Purpose                              |
|--------|------------------------------|---------------|---------------------------------------|
| POST   | /api/auth/login              | Public        | Log in, returns JWT                   |
| GET    | /api/auth/me                 | Authenticated | Get current user                      |
| POST   | /api/auth/onboard            | Admin         | Create a new intern account           |
| GET    | /api/interns                 | Admin         | List all interns                      |
| GET    | /api/interns/:id             | Admin / Self  | View intern profile                   |
| PUT    | /api/interns/:id             | Admin         | Update intern profile                 |
| DELETE | /api/interns/:id             | Admin         | Remove intern (and their tasks)       |
| GET    | /api/interns/:id/progress    | Admin / Self  | Aggregate progress stats              |
| GET    | /api/tasks                   | Admin / Intern| List tasks (admin: all/filtered, intern: own) |
| GET    | /api/tasks/:id                | Admin / Owner | View a single task                    |
| POST   | /api/tasks                   | Admin         | Create/assign a task                  |
| PUT    | /api/tasks/:id                | Admin / Owner | Update task (details, feedback, progress, submission) |
| DELETE | /api/tasks/:id                | Admin         | Delete a task                         |

## Notes & next steps

This is a working scaffold meant to be extended. Reasonable next additions:
- Password reset / change-password flow for interns
- Email notifications on task assignment, deadline reminders, and feedback
- File uploads for submissions instead of link-only
- Pagination and search on the interns/tasks tables
- Refresh tokens / token expiry handling on the frontend
- Automated tests (Jest + Supertest for the API, React Testing Library for the UI)
- Deployment configs (Docker Compose for API + MongoDB, static hosting for the frontend)
