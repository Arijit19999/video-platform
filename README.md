# Video Platform - Full Stack Application

A comprehensive video upload, processing, and streaming platform with sensitivity analysis.

## Features

- 🎥 Video upload with progress tracking
- 🔄 Real-time processing updates
- 🛡️ Content sensitivity analysis
- 📺 HTTP range request streaming
- 👥 Multi-tenant architecture
- 🔐 Role-based access control (Viewer, Editor, Admin)

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io for real-time updates
- JWT authentication
- Multer for file uploads

### Frontend
- React + Vite
- Socket.io client
- Axios for API calls
- Context API for state management

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/video-platform.git
cd video-platform
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`

Create \`.env\` file:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-platform
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:5173
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd ../frontend
npm install
\`\`\`

## Running the Application

### Start MongoDB
\`\`\`bash
mongod
\`\`\`

### Start Backend (Terminal 1)
\`\`\`bash
cd backend
npm run dev
\`\`\`

### Start Frontend (Terminal 2)
\`\`\`bash
cd frontend
npm run dev
\`\`\`

Visit: http://localhost:5173

## User Roles

- **Viewer**: Read-only access to assigned videos
- **Editor**: Upload, edit, and manage video content
- **Admin**: Full system access including user management

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Videos
- POST `/api/videos` - Upload video (Editor/Admin only)
- GET `/api/videos` - Get all videos (with filters)
- GET `/api/videos/:id/stream` - Stream video

## Project Structure

\`\`\`
video-platform/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── uploads/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
└── README.md
\`\`\`

## Environment Variables

### Backend
- \`PORT\` - Server port (default: 5000)
- \`MONGODB_URI\` - MongoDB connection string
- \`JWT_SECRET\` - Secret key for JWT tokens
- \`FRONTEND_URL\` - Frontend URL for CORS

## Contributing

1. Fork the repository
2. Create feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

Your Name - [Your Email]

## Acknowledgments

- Assignment provided by [Organization Name]
- Built as part of Full Stack Development course