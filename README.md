# DevPulse API 🚀

A collaborative platform for software teams to report bugs, suggest features, and coordinate issue resolutions.

---

## 🔗 Live Links

* Live API: [https://dev-pulse-eight-rho.vercel.app/]

---

# 🛠️ Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Raw SQL (`pool.query`)
* JWT Authentication
* bcryptjs

---

# ✨ Features

## Authentication Module

* User Registration
* User Login
* JWT Authentication
* Role Based Authorization

## Issues Module

* Create Issue
* Get All Issues
* Get Single Issue
* Update Issue
* Delete Issue
* Sorting & Filtering

---

# 👥 User Roles

## Contributor

* Register & Login
* Create Issues
* View Issues

## Maintainer

* All Contributor Permissions
* Update Any Issue
* Delete Any Issue
* Change Issue Status

---

# 📁 Project Structure

```bash
src/
│
├── app.ts
├── server.ts
│
├── config/
├── db/
├── middleware/
├── modules/
│   ├── auth/
│   └── issues/
│
├── types/
└── utility/
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_secret_key
```

---

# 🚀 Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/mohammad-pamel/devpulse.git
```

## 2. Move Into Project

```bash
cd devpulse
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Run Development Server

```bash
npm run dev
```

## 5. Build Project

```bash
npm run build
```

## 6. Start Production Server

```bash
npm start
```

---

# 🗄️ Database Schema

## Users Table

| Field      | Type               |
| ---------- | ------------------ |
| id         | SERIAL PRIMARY KEY |
| name       | VARCHAR(100)       |
| email      | VARCHAR(50) UNIQUE |
| password   | TEXT               |
| role       | VARCHAR(20)        |
| created_at | TIMESTAMP          |
| updated_at | TIMESTAMP          |

---

## Issues Table

| Field       | Type               |
| ----------- | ------------------ |
| id          | SERIAL PRIMARY KEY |
| title       | VARCHAR(150)       |
| description | TEXT               |
| type        | VARCHAR(20)        |
| status      | VARCHAR(20)        |
| reporter_id | INT                |
| created_at  | TIMESTAMP          |
| updated_at  | TIMESTAMP          |

---

# 📌 API Endpoints

## Authentication Routes

### Register User

```http
POST /api/auth/signup
```

### Login User

```http
POST /api/auth/login
```

---

## Issues Routes

### Create Issue

```http
POST /api/issues
```

### Get All Issues

```http
GET /api/issues
```

### Get Single Issue

```http
GET /api/issues/:id
```

### Update Issue

```http
PATCH /api/issues/:id
```

### Delete Issue

```http
DELETE /api/issues/:id
```

---

# 🔐 Authentication

Protected routes require JWT token.

Example:

```http
Authorization: your_jwt_token
```

---

# 📦 Scripts

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsup",
  "start": "node dist/server.js"
}
```

---

# 📖 Author

Developed by Mohammad Pamel
