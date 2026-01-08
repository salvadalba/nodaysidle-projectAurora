# AGENT

# Agent Prompts — Aurora

## 🧭 Global Rules

### ✅ Do

- Use exact stack: React, Tailwind CSS, Node.js, REST API, PostgreSQL
- Prefer simplicity over extensibility
- Use TypeScript for all code
- Follow Optical Hierarchy design philosophy
- Implement Z-axis navigation as core differentiator
- Use Zustand for state management
- Use React Three Fiber for WebGL/3D effects
- Use bcrypt with cost factor 12 for passwords
- Use JWT with 24hr expiration
- Rate limit auth to 5 requests/minute per IP
- Cache widget data with 30-second TTL
- Target 60fps with frame budget monitoring
- Debounce prism effect hover by 100ms
- Throttle layer transitions to 1 per 300ms
- Throttle cursor position updates to 60fps
- Max 100 layers per dashboard
- Max 10 docked widgets on surface layer
- Use materialized views for KPI aggregations
- Refresh materialized view every 5 minutes
- Bundle size target: <500KB gzipped
- Load time target: <2s on 3G
- Coverage target: >80% for frontend, >70% for API

### ❌ Don’t

- Do NOT introduce alternative technologies to the specified stack
- Do NOT use Redux, MobX, or other state management
- Do NOT use GraphQL instead of REST
- Do NOT use MongoDB or other databases
- Do NOT use Next.js or Gatsby
- Do NOT use CSS-in-JS libraries besides Tailwind
- Do NOT create WebSocket support unless explicitly requested
- Do NOT add undo/redo functionality unless explicitly requested
- Do NOT exceed the specified max layers and docked widgets

## 🧩 Task Prompts

## Initialize monorepo with tooling

**Context**
Create repository structure for Aurora dashboard with separate frontend and backend packages. Configure TypeScript, ESLint, Prettier, and Git hooks.
