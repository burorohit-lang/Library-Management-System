# Library API

Express and MongoDB API for the `libary-admin` frontend.

## Setup

1. Start a local MongoDB server.
2. Copy `.env.example` to `.env`.
3. Set a private `JWT_SECRET` containing at least 32 characters, and choose a strong `ADMIN_PASSWORD`.
4. Install and start the API:

   ```sh
   npm install
   npm run dev
   ```

The server listens on port `5000` by default, creates the initial admin account if one does not exist, and allows the Vite frontend at `http://localhost:5173`. Check `/api/health` for server/database status.

## Routes

- `POST /api/auth/login` — admin or librarian sign-in
- `POST /api/auth/register-student` — public student registration
- `GET /api/dashboard/stats` — dashboard metrics and recent issues
- `GET /api/categories` — categories derived from the book collection
- `GET|POST /api/books`, `PATCH|DELETE /api/books/:id` — book inventory
- `GET|POST /api/issues`, `PATCH /api/issues/:id/return` — checkout and returns
- `GET|POST /api/users` — admin-only account management

All book, issue, dashboard, category, and user-management routes require a valid admin or librarian token. Account creation is admin-only.
