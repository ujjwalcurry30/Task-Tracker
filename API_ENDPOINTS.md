# API Endpoints Summary

## Total Number of APIs: **7**

---

## 1. Root Endpoint (1)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Health check - Returns API status | No |

**Response:**
```json
{
  "message": "Task Tracker API is running"
}
```

---

## 2. Authentication Endpoints (2)

### Base Path: `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create a new user account | No |
| POST | `/api/auth/login` | Login with email and password | No |

#### POST `/api/auth/signup`
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 3. Task Management Endpoints (4)

### Base Path: `/api/tasks`
**All task endpoints require authentication** (JWT token in `Authorization: Bearer <token>` header)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all user's tasks (with filters) | Yes |
| POST | `/api/tasks` | Create a new task | Yes |
| PUT | `/api/tasks/:id` | Update an existing task | Yes |
| DELETE | `/api/tasks/:id` | Delete a task | Yes |

#### GET `/api/tasks`
**Query Parameters:**
- `status` (optional): Filter by status (`todo`, `in-progress`, `done`)
- `search` (optional): Search in title/description (case-insensitive)

**Example:**
```
GET /api/tasks?status=todo&search=meeting
```

**Response:**
```json
[
  {
    "_id": "task_id",
    "title": "Task title",
    "description": "Task description",
    "dueDate": "2024-12-31T00:00:00.000Z",
    "priority": "high",
    "status": "todo",
    "user": "user_id",
    "createdAt": "2024-12-01T00:00:00.000Z",
    "updatedAt": "2024-12-01T00:00:00.000Z"
  }
]
```

**Note:** By default, excludes tasks with status "done" unless explicitly filtered.

#### POST `/api/tasks`
**Request Body:**
```json
{
  "title": "Task title",           // Required
  "description": "Description",    // Optional
  "dueDate": "2024-12-31",        // Optional (ISO date string)
  "priority": "high",              // Optional: "low" | "medium" | "high" (default: "medium")
  "status": "todo"                 // Optional: "todo" | "in-progress" | "done" (default: "todo")
}
```

**Response:**
```json
{
  "_id": "task_id",
  "title": "Task title",
  "description": "Description",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "priority": "high",
  "status": "todo",
  "user": "user_id",
  "createdAt": "2024-12-01T00:00:00.000Z",
  "updatedAt": "2024-12-01T00:00:00.000Z"
}
```

#### PUT `/api/tasks/:id`
**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2024-12-31",
  "priority": "medium",
  "status": "in-progress"
}
```

**Response:**
```json
{
  "_id": "task_id",
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "priority": "medium",
  "status": "in-progress",
  "user": "user_id",
  "createdAt": "2024-12-01T00:00:00.000Z",
  "updatedAt": "2024-12-01T00:00:00.000Z"
}
```

#### DELETE `/api/tasks/:id`
**Response:**
```json
{
  "message": "Task deleted."
}
```

---

## Summary by Category

| Category | Count | Endpoints |
|----------|-------|-----------|
| **Root** | 1 | GET `/` |
| **Authentication** | 2 | POST `/api/auth/signup`, POST `/api/auth/login` |
| **Tasks** | 4 | GET `/api/tasks`, POST `/api/tasks`, PUT `/api/tasks/:id`, DELETE `/api/tasks/:id` |
| **TOTAL** | **7** | |

---

## HTTP Methods Used

- **GET**: 2 endpoints (root health check, list tasks)
- **POST**: 3 endpoints (signup, login, create task)
- **PUT**: 1 endpoint (update task)
- **DELETE**: 1 endpoint (delete task)

---

## Authentication

- **No Auth Required:** Root endpoint, Sign up, Login
- **Auth Required:** All task endpoints (JWT token in `Authorization: Bearer <token>` header)

