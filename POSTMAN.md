# Project Management Backend — API Documentation

Base URL variable: `{{projectMUrl}}`
Auth: Bearer token (JWT) required on protected routes, obtained via `/auth/login`
Total endpoints: **32**

---

## Auth (10 endpoints)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Log in and receive access/refresh tokens |
| POST | `/api/v1/auth/logout` | Log out (requires Bearer token) |
| POST | `/api/v1/auth/refresh-token` | Get a new access token using a refresh token |
| POST | `/api/v1/auth/reset-password/:resetToken` | Reset password using a reset token |
| POST | `/api/v1/auth/forgot-password` | Request a password reset |
| POST | `/api/v1/auth/change-password` | Change password while logged in |
| POST | `/api/v1/auth/resend-email-verification` | Resend the email verification link |
| GET | `/api/v1/auth/verify-email/:verificationToken` | Verify email using a token |
| GET | `/api/v1/auth/current-user` | Get the currently logged-in user's profile |

**Sample — Register**
```
POST {{projectMUrl}}/api/v1/auth/register
Content-Type: application/json

{
    "username": "your_username",
    "email": "your_email@example.com",
    "password": "YourPassword123"
}
```

**Sample — Login**
```
POST {{projectMUrl}}/api/v1/auth/login
Content-Type: application/json

{
    "email": "your_email@example.com",
    "password": "YourPassword123"
}
```

**Sample — Change Password**
```
POST {{projectMUrl}}/api/v1/auth/change-password
Content-Type: application/json

{
    "oldPassword": "OldPassword123",
    "newPassword": "NewPassword123"
}
```

---

## Healthcheck (1 endpoint)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/healthcheck/` | Check if the API server is up and running |

---

## Notes (5 endpoints)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/notes/:projectId` | Create a note under a project |
| GET | `/api/v1/notes/:projectId` | List all notes for a project |
| GET | `/api/v1/notes/:projectId/n/:taskId` | Get a single note by ID |
| PUT | `/api/v1/notes/:projectId/n/:taskId` | Update a note by ID |
| DELETE | `/api/v1/notes/:projectId/n/:taskId` | Delete a note by ID |

**Sample — Create Note**
```
POST {{projectMUrl}}/api/v1/notes/:projectId
Content-Type: application/json

{
    "content": "Note content goes here"
}
```

---

## Project (9 endpoints)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/projects/` | Create a new project |
| GET | `/api/v1/projects/` | List all projects |
| GET | `/api/v1/projects/:projectId` | Get details of a specific project |
| PUT | `/api/v1/projects/:projectId` | Update a project's details |
| DELETE | `/api/v1/projects/:projectId` | Delete a project |
| GET | `/api/v1/projects/:projectId/members` | List members of a project |
| POST | `/api/v1/projects/:projectId/members` | Add a member to a project |
| PUT | `/api/v1/projects/:projectId/members/:userId` | Update a member's role in a project |
| DELETE | `/api/v1/projects/:projectId/members/:userId` | Remove a member from a project |

**Sample — Create Project**
```
POST {{projectMUrl}}/api/v1/projects/
Content-Type: application/json

{
    "name": "New Test Project",
    "description": "This is a test project"
}
```

**Sample — Add Member to Project**
```
POST {{projectMUrl}}/api/v1/projects/:projectId/members
Content-Type: application/json

{
    "email": "member@example.com",
    "role": "member"
}
```

**Sample — Update Member Role**
```
PUT {{projectMUrl}}/api/v1/projects/:projectId/members/:userId
Content-Type: application/json

{
    "role": "project_admin"
}
```

---

## Task (3 endpoints)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/tasks/:projectId` | Create a task under a project (supports file attachment via form-data) |
| GET | `/api/v1/tasks/:projectId` | List all tasks for a project |
| GET | `/api/v1/tasks/:projectId/t/:taskId` | Get a single task by ID |

**Sample — Create Task (multipart/form-data)**
```
POST {{projectMUrl}}/api/v1/tasks/:projectId
Content-Type: multipart/form-data

title: Create note Routes
description: Create note Routes With Rest Api
assignedTo: <userId>
status: todo
files: <file upload>
```

---

## Subtask (4 endpoints)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/tasks/:projectId/t/:taskId/subtasks` | Create a subtask under a task |
| GET | `/api/v1/tasks/:projectId/t/:taskId/subtasks` | List subtasks for a task |
| PUT | `/api/v1/tasks/:projectId/st/:subTaskId` | Update a subtask |
| DELETE | `/api/v1/tasks/:projectId/st/:subTaskId` | Delete a subtask |

**Sample — Create Subtask**
```
POST {{projectMUrl}}/api/v1/tasks/:projectId/t/:taskId/subtasks
Content-Type: application/json

{
    "title": "Subtask title",
    "description": "Subtask description",
    "isCompleted": "false"
}
```

---

## Path Variables Reference

| Variable | Meaning |
|---|---|
| `:projectId` | MongoDB ObjectId of a project |
| `:taskId` | MongoDB ObjectId of a task |
| `:subTaskId` | MongoDB ObjectId of a subtask |
| `:userId` | MongoDB ObjectId of a user |
| `:resetToken` | Password reset token (from email link) |
| `:verificationToken` | Email verification token (from email link) |

## Environment Setup

Set the following collection variable before running requests:

| Variable | Example |
|---|---|
| `projectMUrl` | `http://localhost:8000` (or your deployed base URL) |

---

