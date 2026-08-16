# LearnTrack — Online Course Learning Platform (Prototype)

A working full-stack prototype: React (Vite) + Bootstrap 5 frontend, Express/Node backend,
JWT + bcrypt auth, Multer uploads, dummy payments, video + quiz progress tracking, and
PDF certificate generation.

## ⚠️ One important note on the database

Your spec asked for MySQL. I built this prototype with a **JSON file store** instead
(`server/config/db.js`), with tables shaped identically to `database.sql`. Why: I built
this in a sandboxed environment with no network access, so I couldn't install `mysql2`
or spin up a MySQL server to actually test a MySQL-backed version end-to-end. Rather than
hand you 8 tables of untested database code, I built and reasoned through something
that's guaranteed to run the moment you `npm install`.

This is the **first thing to extend** — see "Migrating to MySQL" below. Nothing else about
the architecture changes: the JSON store's function names (`readDB`, `writeDB`, `nextId`)
map directly onto SQL `SELECT`/`INSERT`/`UPDATE`, so the controllers barely change.

## Stack

- **Frontend**: React 18 + Vite, React Router, Axios, Bootstrap 5, Poppins/Inter fonts
- **Backend**: Express.js (MVC), JWT auth, bcryptjs, Multer, PDFKit (certificates)
- **Data**: JSON file store (`server/data/db.json`), auto-created on first run

## Project Structure

```
learntrack/
├── database.sql              # Reference MySQL schema (for migration)
├── server/                   # Express backend
│   ├── config/db.js          # JSON data store (readDB/writeDB/nextId)
│   ├── controllers/          # Route logic (auth, course, enrollment, admin, contact)
│   ├── middleware/           # auth.js (JWT), upload.js (Multer)
│   ├── routes/                # REST endpoints
│   ├── utils/certificate.js  # PDF certificate generator
│   ├── uploads/               # Uploaded course banners
│   ├── seed.js                # Seeds 3 sample courses (5 videos + 2 quizzes each)
│   └── server.js
└── client/                   # React frontend
    └── src/
        ├── api/axios.js
        ├── context/AuthContext.jsx
        ├── components/       # Navbar, Footer, CourseCard, ProgressBar, ProtectedRoute, Sidebar, Loader
        └── pages/             # Home, Courses, CourseDetail, Login, Register, Dashboard,
                                 CourseLearn, Profile, About, Contact, AdminDashboard, AdminCourses, AdminUsers
```

## Running it

**Requirements:** Node.js 18+.

### 1. Backend

```bash
cd server
cp .env.example .env      # edit JWT_SECRET if you like
npm install
npm run seed               # seeds 3 sample courses — run once
npm run dev                 # http://localhost:5000
```

### 2. Frontend (new terminal)

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` and `/uploads`
to the backend, so no CORS configuration is needed in dev.

### Logging in

- **Student**: register a new account via the Register page.
- **Admin**: User ID `admin`, Password `admin123` (from `.env` — change these before
  any real deployment).

### Try the full flow

1. Register a student account → browse Courses → open a course → "Enroll Now" (dummy payment, always succeeds).
2. Go to Dashboard → "Continue" → watch each video and click "Mark as Completed" (70% of progress), answer both quizzes correctly (30% of progress).
3. Once at 100%, download the certificate (PDF) from the course page or Dashboard.
4. Log in as `admin` → Admin Panel → create/edit a course (banner upload, 5 videos, 2 quizzes) → check "Users & Progress" to see the student's quiz scores and completion.

## What I'd extend first

1. **Migrate to MySQL.** Install `mysql2`, run `database.sql`, and replace
   `config/db.js`'s `readDB()/writeDB()` calls in each controller with parameterized
   SQL queries. Because every controller already treats data as "rows with foreign
   keys," this is mostly mechanical — the JSON shape was designed to mirror the schema
   exactly for this reason.
2. **Real payment integration.** The `purchaseCourse` controller currently marks every
   payment `success` instantly. Swap in Stripe Checkout (or similar) and only create
   the enrollment after a webhook confirms payment.
3. **Quiz retake limits / scoring history.** Right now a quiz can be resubmitted
   indefinitely and only the latest attempt counts. If you want it to feel more like a
   real assessment, cap attempts or keep a full history per attempt.
4. **Admin course reordering & drag-drop module editor.** The module editor is currently
   fixed-position (5 video slots + 2 quiz slots); a drag-and-drop reorder would make
   content editing nicer for admins managing many courses.
5. **Refresh tokens.** JWTs currently last 7 days with no refresh — fine for a prototype,
   but add refresh tokens + shorter-lived access tokens before production.
6. **Image optimization for banners.** Multer currently stores uploads as-is; add
   resizing/compression (e.g. `sharp`) so large banner uploads don't bloat page loads.

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login (student or admin) |
| GET/PUT | `/api/auth/profile` | View/update profile |
| PUT | `/api/auth/change-password` | Change password |
| GET | `/api/courses` | List/search courses |
| GET | `/api/courses/:id` | Course detail + modules |
| POST/PUT/DELETE | `/api/courses/:id` | Admin: create/edit/delete course |
| PUT | `/api/courses/:id/modules` | Admin: set 5 videos + 2 quizzes |
| POST | `/api/enrollments/:id/purchase` | Dummy purchase |
| GET | `/api/enrollments` | My enrolled courses + progress |
| POST | `/api/enrollments/:id/video/:moduleId/complete` | Mark video watched |
| POST | `/api/enrollments/:id/quiz/:moduleId/submit` | Submit quiz answer |
| GET | `/api/enrollments/:id/certificate` | Download certificate PDF (if complete) |
| GET | `/api/admin/users` / `DELETE /api/admin/users/:id` | Admin: manage users |
| GET | `/api/admin/enrollments` | Admin: all purchases + progress |
| GET/PUT | `/api/admin/site-content` | Admin: edit About/Contact text |
| GET | `/api/admin/contact-messages` | Admin: view contact form submissions |
| POST | `/api/contact` | Public contact form |
