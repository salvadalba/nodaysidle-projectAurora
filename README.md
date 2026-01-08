# 🌌 Aurora - Spatial SaaS Dashboard

Aurora is a revolutionary data visualization platform that replaces traditional 2D scrolling/tabs with an immersive Z-axis navigation experience. Built with React Three Fiber for WebGL rendering and Express.js backend.

## ✨ Features

- **Z-Axis Navigation**: Navigate through data layers using scroll, keyboard, or touch
- **Glassmorphism UI**: Premium translucent design with depth blur
- **Widget System**: Metric, Chart, and Composite widget types
- **Real-time Updates**: Live data visualization
- **JWT Authentication**: Secure user sessions

## 🚀 Tech Stack

**Frontend:**

- React 18 + TypeScript
- React Three Fiber (WebGL)
- Zustand (State Management)
- Tailwind CSS
- Vite

**Backend:**

- Express.js + TypeScript
- PostgreSQL
- JWT Authentication
- Winston Logging

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm 9+

### Setup

1. **Clone and install:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/aurora.git
   cd aurora
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

   Required environment variables:

   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/aurora
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRATION=24h
   PORT=3000
   ```

3. **Run migrations and seed:**

   ```bash
   npm run db:migrate --workspace=backend
   npm run db:seed --workspace=backend
   ```

4. **Start development servers:**

   ```bash
   # Terminal 1: Backend
   npm run dev:backend
   
   # Terminal 2: Frontend
   npm run dev:frontend
   ```

5. **Open browser:** <http://localhost:5173>

### Demo Credentials

- Email: `demo@aurora.dev`
- Password: `demo123`

## 📦 Deployment

### Option 1: Vercel + Neon PostgreSQL

1. **Create Neon database:**
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Deploy Backend to Vercel:**

   ```bash
   cd backend
   vercel
   ```

   Set environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `JWT_SECRET`: A secure random string
   - `FRONTEND_URL`: Your frontend URL

3. **Deploy Frontend to Vercel:**

   ```bash
   cd ..
   vercel
   ```

   Set environment variables:
   - `VITE_API_URL`: Your backend URL + `/api`

### Option 2: Railway

1. Create new project on [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Deploy from GitHub
4. Configure environment variables

## 🗂️ Project Structure

```
aurora/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # Widget components
│   │   ├── engine/          # Z-Engine (R3F)
│   │   ├── hooks/           # Custom hooks
│   │   ├── routes/          # Page components
│   │   └── store/           # Zustand stores
│   └── package.json
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── db/              # Database connection
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helpers
│   ├── migrations/          # SQL migrations
│   └── package.json
└── package.json             # Root monorepo config
```

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/logout | User logout |
| GET | /api/dashboards | List dashboards |
| POST | /api/dashboards | Create dashboard |
| GET | /api/dashboards/:id | Get dashboard |
| POST | /api/dashboards/:id/layers | Create layer |
| POST | /api/widgets | Create widget |
| GET | /api/widgets/:id | Get widget |
| PATCH | /api/widgets/:id | Update widget |
| DELETE | /api/widgets/:id | Delete widget |
| GET | /api/widgets/:id/data | Get widget data |
| GET | /api/users/me | Get user profile |
| PATCH | /api/users/me/preferences | Update preferences |

## 🎮 Navigation Controls

- **↑/↓ or W/S**: Navigate depth layers
- **Mouse Wheel**: Scroll through layers
- **Home/End**: Jump to surface/deepest layer
- **+/-**: Zoom in/out

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.
