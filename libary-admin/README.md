# Library Admin

The React/Vite admin interface for the library app. The frontend calls the Express API through `/api`; Vite proxies those requests to `http://localhost:5000` during development.

## Start the application

1. Start MongoDB.
2. In `Backend`, copy `.env.example` to `.env`. Set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and your initial `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Start the API from `Backend`:

   ```sh
   npm install
   npm run dev
   ```

4. In `libary-admin`, start the frontend:

   ```sh
   npm install
   npm run dev
   ```

5. Open the Vite URL (usually [http://localhost:5173](http://localhost:5173)) and sign in with the admin credentials configured in `Backend/.env`.

The backend creates the first admin account on initial startup. Use the admin interface to create librarian accounts. Student sign-up is available, but student sign-in and the student portal are not part of this admin interface. Password reset is also not configured.

## Features

- Password-hashed admin and librarian sign-in with role-protected API routes
- Dashboard metrics and category summaries
- Book inventory create, search, update, and delete
- Book checkout, return, and overdue tracking
- Student registration and admin-managed librarian/student accounts

Run `npm run lint` and `npm run build` in `libary-admin`, and `npm test` in `Backend`.
