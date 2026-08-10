# Project Management Backend

A RESTful API service for collaborative project management. Built with Node.js, Express, and MongoDB, it supports project organization, task and subtask management, project notes, and JWT-based authentication with role-based access control.

## Features

- **Authentication** — Register, login, logout, refresh tokens, email verification, password reset/change
- **Projects** — Create, update, delete, and list projects; manage project members and their roles
- **Tasks** — Create and manage tasks within a project, with file attachment support
- **Subtasks** — Create, update, list, and delete subtasks under a task
- **Notes** — Add, update, list, and delete notes scoped to a project
- **Role-based access control** — Project-level roles (e.g. `project_admin`, `member`)

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens (JWT), bcrypt for password hashing |
| Validation | express-validator |
| File uploads | Multer |
| Email | Nodemailer + Mailgen |
| Dev tools | nodemon, prettier |

## Project Structure

```
Project-Management-Backend/
├── public/
│   └── images/
├── src/
│   ├── controllers/     # Request handlers for auth, projects, tasks, subtasks, notes
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── middlewares/     # Auth guards, validation, error handling, multer config
│   ├── utils/           # Helpers (email sending, async handler, API response/error wrappers)
│   ├── db/              # MongoDB connection setup
│   └── index.js         # App entry point
├── .env                 # Environment variables (not committed)
├── package.json
├── postmancollection.json
├── POSTMAN.md
├── PRD.md
└── README.md
```
*(Note: exact folder names inside `src/` may differ slightly from your actual layout — adjust as needed.)*

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local instance or a hosted URI, e.g. MongoDB Atlas)
- An SMTP-compatible email service for Nodemailer (e.g. Mailtrap for development)

### Installation

```bash
git clone https://github.com/deepaksoam002/Project-Management-Backend.git
cd Project-Management-Backend
npm install
```

### Environment Variables

Create a `.env` file in the project root. Based on the dependencies in use, you'll likely need values along these lines — check your actual `.env`/`.env.example` for exact variable names:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

BASE_URL=http://localhost:8000
```

### Running the Server

```bash
npm run dev
```

The server starts on the port defined in your `.env` (default shown above: `8000`).

## API Documentation

Full API reference with all 32 endpoints, grouped by resource (auth, projects, tasks, subtasks, notes, healthcheck), is available in [`POSTMAN.md`](./POSTMAN.md).

A ready-to-import Postman collection is included at [`postmancollection.json`](./postmancollection.json). In Postman: **Import → Files** → select the file, then set the `projectMUrl` collection variable to your running server's base URL (e.g. `http://localhost:8000`).

### Quick Overview

| Resource | Base Path | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Registration, login, tokens, password/email management |
| Healthcheck | `/api/v1/healthcheck` | Server status check |
| Projects | `/api/v1/projects` | Project CRUD and member management |
| Tasks | `/api/v1/tasks/:projectId` | Task CRUD within a project |
| Subtasks | `/api/v1/tasks/:projectId/t/:taskId/subtasks` | Subtask CRUD within a task |
| Notes | `/api/v1/notes/:projectId` | Note CRUD within a project |

See [`POSTMAN.md`](./POSTMAN.md) for full request/response details on each endpoint.

## Product Requirements

For the full feature scope and requirements this backend was built against, see [`PRD.md`](./PRD.md).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the server in development mode with nodemon |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your branch and open a pull request

## License

Not currently specified — add a `LICENSE` file if you'd like to define usage terms.
