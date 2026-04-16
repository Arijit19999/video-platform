# VideoVault — Video Upload, Sensitivity Processing & Streaming

A full-stack application for uploading videos, processing them through a sensitivity analysis pipeline with real-time progress tracking, and streaming approved content — built with Node.js, Express, MongoDB, React, and Socket.io.

## Architecture Overview

```
┌─────────────────┐       ┌──────────────────────────────────┐
│   React + Vite   │◄─────►│  Express API + Socket.io Server  │
│   (Frontend)     │ REST  │         (Backend)                 │
│   Port 5173      │  +WS  │         Port 5000                 │
└─────────────────┘       └──────────┬───────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │     MongoDB          │
                          │  (Users + Videos)    │
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   Local Filesystem   │
                          │  (Video Storage)     │
                          └─────────────────────┘
```

## Features

- **Video Upload** — Drag-and-drop upload with real-time progress bar
- **Sensitivity Analysis** — Automated 5-stage processing pipeline with live Socket.io updates
- **Video Streaming** — HTTP range request support for seek-friendly playback
- **Role-Based Access Control** — Viewer / Editor / Admin roles
- **Multi-Tenant Isolation** — Users only see their own content (admins see org-wide)
- **Admin Panel** — User management, role changes, system stats
- **Filtering & Search** — Filter by status, search by title, sort by date/size

## Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS v4         |
| Backend     | Node.js, Express.js                     |
| Database    | MongoDB + Mongoose                      |
| Real-Time   | Socket.io                               |
| Auth        | JWT (jsonwebtoken + bcryptjs)           |
| Upload      | Multer                                  |
| Styling     | Tailwind CSS, Lucide React icons        |

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/video-app.git
cd video-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-app
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
MAX_FILE_SIZE=104857600
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`:

```
VITE_API_URL=http://localhost:5000
```

### 4. Seed Demo Users

```bash
cd backend
npm run seed
```

This creates three accounts:
| Role   | Email             | Password     |
|--------|-------------------|--------------|
| Admin  | admin@demo.com    | password123  |
| Editor | editor@demo.com   | password123  |
| Viewer | viewer@demo.com   | password123  |

### 5. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open http://localhost:5173

## API Documentation

### Authentication

| Method | Endpoint          | Body                              | Description      |
|--------|-------------------|-----------------------------------|------------------|
| POST   | /api/auth/register | { name, email, password, role }  | Create account   |
| POST   | /api/auth/login    | { email, password }              | Login, get JWT   |
| GET    | /api/auth/me       | —                                | Get current user |

### Videos

| Method | Endpoint                | Auth     | Description                        |
|--------|-------------------------|----------|------------------------------------|
| POST   | /api/videos/upload      | Editor+  | Upload video (multipart/form-data) |
| GET    | /api/videos             | All      | List videos (with filters)         |
| GET    | /api/videos/:id         | Owner/Admin | Get video details               |
| DELETE | /api/videos/:id         | Editor+  | Delete video                       |
| GET    | /api/videos/:id/stream  | Owner/Admin | Stream video (range requests)   |

Query params for listing: `status`, `search`, `sortBy`, `order`

### Admin

| Method | Endpoint                    | Auth  | Description         |
|--------|-----------------------------|-------|---------------------|
| GET    | /api/admin/users            | Admin | List all users      |
| PATCH  | /api/admin/users/:id/role   | Admin | Change user role    |
| DELETE | /api/admin/users/:id        | Admin | Delete user         |
| GET    | /api/admin/stats            | Admin | System statistics   |

## RBAC Roles

| Permission          | Viewer | Editor | Admin |
|---------------------|--------|--------|-------|
| View own videos     | ✅     | ✅     | ✅    |
| Stream safe videos  | ✅     | ✅     | ✅    |
| Upload videos       | ❌     | ✅     | ✅    |
| Delete own videos   | ❌     | ✅     | ✅    |
| View all org videos | ❌     | ❌     | ✅    |
| Manage users        | ❌     | ❌     | ✅    |

## Sensitivity Analysis Pipeline

The processing service simulates a 5-stage analysis:

1. **Validation** — File format verification (10%)
2. **Frame Extraction** — Video frame sampling (30%)
3. **Content Analysis** — Pattern detection scan (50%)
4. **Classification** — Sensitivity scoring (75%)
5. **Report Generation** — Final determination (90% → 100%)

Results: `safe` or `flagged` — determined by a hash-based classifier (placeholder for production ML model).

All stages emit real-time Socket.io events to the connected user.

## Assumptions & Design Decisions

1. **Simulated Analysis** — Real ML-based content moderation (e.g., AWS Rekognition) would be used in production. The current pipeline demonstrates the architecture.
2. **Local Storage** — Videos stored on disk. For production: AWS S3 or Cloudinary with signed URLs.
3. **Org-based Isolation** — Users belong to an `orgId`. Default is `default-org` for demo simplicity.
4. **JWT via Query Param** — The stream endpoint accepts `?token=` for `<video>` tag compatibility (HTML5 video cannot send custom headers).

## Deployment Guide

### 1. Database — MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free M0 cluster
2. Create a database user and whitelist `0.0.0.0/0` for access
3. Copy the connection string: `mongodb+srv://user:pass@cluster.mongodb.net/video-app`

### 2. Video Storage — Cloudinary (Free, 25GB)

1. Sign up at [cloudinary.com](https://cloudinary.com) (no credit card needed)
2. From the dashboard, copy: Cloud Name, API Key, API Secret

### 3. Backend — Render (Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo, set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:

```
PORT=5000
MONGODB_URI=mongodb+srv://...your-atlas-uri...
JWT_SECRET=generate-a-random-64-char-string
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
MAX_FILE_SIZE=104857600
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=https://your-frontend.vercel.app
```

7. Deploy and copy the URL (e.g., `https://video-app-backend.onrender.com`)

### 4. Frontend — Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Set root directory to `frontend`
3. Framework: Vite
4. Add environment variable:

```
VITE_API_URL=https://video-app-backend.onrender.com
```

5. Deploy

### 5. Seed Demo Data

After backend is deployed, seed users via:

```bash
MONGODB_URI=your-atlas-uri node backend/src/utils/seed.js
```

### 6. Run Tests

```bash
cd backend && npm test
```

## Testing

Tests use Node's built-in test runner with supertest:

- `tests/auth.test.js` — Registration, login, token validation, protected routes
- `tests/video.test.js` — Upload permissions, RBAC enforcement, CRUD operations, admin endpoints

## License

MIT
