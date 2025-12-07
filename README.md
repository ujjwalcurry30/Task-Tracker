## Task Tracker – React, Node.js, MongoDB

This is a simple Task Tracker application with:

- **User authentication** (email + password: signup, login, logout) using JWT
- **Task management** (CRUD) with fields for title, description, due date, priority, and status
- **Filters & search** by task status and title/description
- **Responsive UI** built with React + Vite
- **Persistent storage** using MongoDB (no in-memory storage)

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v14 or higher) installed
- **MongoDB** running locally on `mongodb://localhost:27017/`
- **npm** or **yarn** package manager

### Step-by-Step Setup

#### Step 1: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS (if installed via Homebrew):
brew services start mongodb-community

# Or run MongoDB directly:
mongod

# On Linux:
sudo systemctl start mongod

# On Windows:
# Start MongoDB service from Services panel
```

Verify MongoDB is running:
```bash
# Should show MongoDB is listening on port 27017
lsof -i :27017
```

#### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

#### Step 3: Install Frontend Dependencies

```bash
# From project root (go back if you're in backend folder)
cd ..
npm install
```

#### Step 4: Start Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 3000
```

✅ Backend is now running at `http://localhost:3000`

#### Step 5: Start Frontend Server

Open a **new terminal** (keep backend running) and run:

```bash
# From project root
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

✅ Frontend is now running at `http://localhost:5173`

#### Step 6: Open the Application

Open your browser and go to:
```
http://localhost:5173
```

You should see the Task Tracker login/signup page!

---

### Optional: Environment Variables

#### Backend Environment Variables

Create a `.env` file in the `backend` folder (optional):

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/task-tracker
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your_strong_secret_here
```

**Defaults (if not set):**
- `PORT` → `3000`
- `MONGO_URI` → `mongodb://localhost:27017/task-tracker`
- `CLIENT_ORIGIN` → `http://localhost:5173`
- `JWT_SECRET` → `dev_jwt_secret_change_me`

#### Frontend Environment Variables

Create a `.env` file in the project root (optional):

```bash
VITE_API_BASE_URL=http://localhost:3000
```

**Default (if not set):**
- `VITE_API_BASE_URL` → `http://localhost:3000`

---

### 1. Backend (Node.js + Express + MongoDB)

- Location: `backend`
- Main file: `server.js`
- Port: `3000` (default)

#### 1.2. API overview

- **Auth routes** (`/api/auth`):
  - `POST /signup` – body: `{ name, email, password }` → returns `{ token, user }`
  - `POST /login` – body: `{ email, password }` → returns `{ token, user }`

- **Task routes** (`/api/tasks`) – all require `Authorization: Bearer <token>`:
  - `GET /` – list current user’s tasks, supports:
    - `?status=todo|in-progress|done`
    - `?search=<string>` (matches title/description, case-insensitive)
  - `POST /` – create task; body:
    - `title` (required)
    - `description` (optional)
    - `dueDate` (optional, ISO date string)
    - `priority` (`low|medium|high`, default `medium`)
    - `status` (`todo|in-progress|done`, default `todo`)
  - `PUT /:id` – update an existing task belonging to the current user
  - `DELETE /:id` – delete an existing task belonging to the current user

### 2. Frontend (React + Vite)

- Location: project root `src` folder
- Entry: `src/main.jsx`, main app component: `src/App.jsx`

#### 2.1. Frontend setup

1. **Install dependencies** (from the project root):

```bash
npm install
```

2. **Optional: configure API base URL** with Vite env:

Create a `.env` file in the project root (same level as `package.json`):

```bash
VITE_API_BASE_URL=http://localhost:3000
```

If not set, the frontend defaults to `http://localhost:3000`.

3. **Start the React dev server**:

```bash
npm run dev
```

Vite will start on `http://localhost:5173` by default.

#### 2.2. Frontend behavior

- **Authentication**
  - Users can **sign up** (name, email, password) or **log in** (email, password).
  - On success, the app stores `token` and `user` in `localStorage` (`taskTrackerToken`, `taskTrackerUser`).
  - On refresh, the app restores the session from `localStorage`.
  - **Logout** clears stored auth data.
  - Basic validation ensures required fields are filled; server error messages are shown in the UI.

- **Task management**
  - Authenticated users see a **task dashboard** with:
    - A **task list** showing title, description, status, priority, and optional due date.
    - A **status filter** and **search box** (title/description).
    - Buttons to **create**, **edit**, and **delete** tasks.
  - Creating or editing opens a small form overlay with validation for the required title.
  - Errors from the API are shown using inline messages or alerts.

- **Responsive design**
  - Layout adapts to narrow screens:
    - Stacked header actions
    - Full-width filters and forms
  - Works well on mobile and desktop.

---

## 📋 Complete Setup Checklist

- [ ] MongoDB is running on `localhost:27017`
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend server running (`cd backend && npm run dev`) → Port 3000
- [ ] Frontend server running (`npm run dev`) → Port 5173
- [ ] Browser opened to `http://localhost:5173`

---

## 🛠️ Troubleshooting

### "Cannot connect to server" error
- Make sure backend is running on port 3000
- Check if port 3000 is available: `lsof -i :3000`

### "MongoDB connection error"
- Verify MongoDB is running: `lsof -i :27017`
- Check MongoDB connection string in `backend/config/db.js`

### Port already in use
- Backend: Change `PORT` in `backend/.env` or `backend/server.js`
- Frontend: Vite will automatically use next available port

### Dependencies not found
- Run `npm install` in both `backend/` and project root
- Delete `node_modules` and `package-lock.json`, then reinstall

---

## 📝 Notes

- **Completed tasks** (status "Done") are automatically hidden from the list
- To view completed tasks, use the Status filter and select "Done"
- User sessions persist across page refreshes (stored in `localStorage`)
- All task operations require authentication (JWT token)

You now have a simple, full-stack Task Tracker app with private tasks per authenticated user!
