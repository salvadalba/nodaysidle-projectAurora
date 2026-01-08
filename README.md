<div align="center">

# 🌌 Aurora

### Spatial Dashboard Engine

*Navigate your data in three dimensions*

[![Live Demo](https://img.shields.io/badge/Live-Demo-blueviolet?style=for-the-badge)](https://aurora-dashboard-five.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)

<br />

<img src="assets/hero.png" alt="Aurora - Spatial Dashboard" width="800" />

<br />

**[🚀 Try Live Demo](https://aurora-dashboard-five.vercel.app)** • **[📖 Documentation](#features)** • **[🛠️ Setup](#quick-start)**

</div>

---

## ✨ What is Aurora?

Aurora reimagines data dashboards by replacing traditional 2D scrolling with **immersive Z-axis navigation**. Dive through layers of your data like floating through space, with beautiful glassmorphism effects and smooth parallax animations.

<details>
<summary><b>🎬 See it in action</b></summary>
<br />

- Navigate between **5 depth layers** using keyboard or buttons
- Watch widgets float with **parallax animation**
- Experience **glassmorphism** with depth-based blur
- Explore with subtle **camera orbit controls**

</details>

---

## 🎯 Features

<table>
<tr>
<td width="50%">

### 🌐 Z-Engine

WebGL-powered 3D engine built on React Three Fiber

- Smooth camera transitions along Z-axis
- Dynamic FOV based on zoom level
- Multi-point stage lighting
- Ambient particles & stars

</td>
<td width="50%">

### 🎨 Glassmorphism

Custom GLSL shaders for depth perception

- Animated shimmer effects
- Distance-based blur (Prism effect)
- Active layer highlighting
- Soft edge glow

</td>
</tr>
<tr>
<td width="50%">

### 📊 Widget System

Three widget types with auto-generated data

- **Metric** - KPI with trend indicator
- **Chart** - Sparkline visualization
- **Composite** - Breakdown bars

</td>
<td width="50%">

### 🔧 Docking System

Widgets snap to layer positions

- X/Y coordinate placement
- Layer assignment
- Smart grid fallback
- State management with Zustand

</td>
</tr>
</table>

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or Neon)
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/salvadalba/nodaysidle-projectAurora.git
cd nodaysidle-projectAurora

# Install dependencies
npm install

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Run migrations
npm run db:migrate --workspace=backend
npm run db:seed --workspace=backend

# Start development servers
npm run dev:backend   # Terminal 1: Backend on :3000
npm run dev:frontend  # Terminal 2: Frontend on :5173
```

### Environment Variables

```env
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/aurora
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3000/api
```

---

## 🎮 Controls

| Control | Action |
|---------|--------|
| `↑` / `↓` | Navigate between layers |
| `W` / `S` | Navigate between layers |
| `+` / `-` | Zoom in/out |
| `Scroll` | Navigate depth |
| `Home` | Jump to surface |
| `End` | Jump to deepest layer |
| `Mouse Drag` | Slight camera orbit |

---

## 🏗️ Architecture

```
aurora/
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── engine/          # Z-Engine (React Three Fiber)
│   │   │   ├── ZEngine.tsx  # Main canvas & scene graph
│   │   │   └── LayerStack.tsx # GLSL glassmorphism layers
│   │   ├── components/      # Widget renderers
│   │   ├── store/           # Zustand state (zStore, dockingStore)
│   │   └── hooks/           # useZNavigation
│   └── package.json
├── backend/                  # Express.js + TypeScript
│   ├── src/
│   │   ├── routes/          # REST API endpoints
│   │   ├── db/              # PostgreSQL connection
│   │   └── middleware/      # Auth, logging
│   └── migrations/          # SQL schemas
└── package.json             # Monorepo root
```

---

## 🚀 Deployment

### Vercel + Neon (Recommended)

1. **Database**: Create a [Neon](https://neon.tech) PostgreSQL database
2. **Backend**: Deploy `/backend` to Vercel
3. **Frontend**: Deploy root with `vercel.json`
4. **Environment**: Set variables in Vercel dashboard

### Live Deployment

| Service | URL |
|---------|-----|
| Frontend | [aurora-dashboard-five.vercel.app](https://aurora-dashboard-five.vercel.app) |
| Backend | aurora-api-phi.vercel.app |
| Database | Neon (Frankfurt) |

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Infrastructure |
|----------|---------|---------------|
| React 18 | Express.js | Vercel |
| TypeScript | TypeScript | Neon PostgreSQL |
| React Three Fiber | PostgreSQL | GitHub Actions |
| Three.js | JWT Auth | npm Workspaces |
| Zustand | Winston Logging | |
| Tailwind CSS | Helmet Security | |
| Vite | | |

</div>

---

## 📄 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User authentication |
| `GET` | `/api/dashboards` | List dashboards |
| `GET` | `/api/dashboards/:id` | Get dashboard with layers |
| `POST` | `/api/dashboards/:id/layers` | Create layer |
| `POST` | `/api/widgets` | Create widget |
| `PATCH` | `/api/widgets/:id` | Update widget |
| `DELETE` | `/api/widgets/:id` | Delete widget |
| `GET` | `/api/users/me` | Get profile |

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ using React Three Fiber**

[⬆ Back to top](#-aurora)

</div>
