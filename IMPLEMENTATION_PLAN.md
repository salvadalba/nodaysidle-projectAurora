ROLE: Expert DevOps/Full-Stack Engineer

GOAL: Scaffold monorepo with frontend and backend, TypeScript, ESLint, Prettier, and pre-commit hooks

CONTEXT: Create repository structure for Aurora dashboard with separate frontend and backend packages. Configure TypeScript, ESLint, Prettier, and Git hooks.

FILES TO CREATE:

- package.json
- tsconfig.json
- .eslintrc.json
- .prettierrc
- .gitignore
- frontend/package.json
- frontend/tsconfig.json
- frontend/.eslintrc.json
- frontend/vite.config.ts
- frontend/index.html
- frontend/src/main.tsx
- backend/package.json
- backend/tsconfig.json
- backend/.eslintrc.json
- backend/src/index.ts

FILES TO MODIFY:
_None_

DETAILED STEPS:

1. Create root package.json with workspaces configuration for /frontend and /backend
2. Create shared TypeScript config at root tsconfig.json with strict mode enabled
3. Create shared ESLint config at .eslintrc.json with TypeScript rules
4. Create Prettier config at .prettierrc with 2-space indentation
5. Create .gitignore excluding node_modules, .env, dist, build
6. Create frontend/package.json with Vite, React 18+, TypeScript, and Tailwind CSS dependencies
7. Create frontend/tsconfig.json extending root config with React-specific settings
8. Create frontend/.eslintrc.json with React hooks rules
9. Create frontend/vite.config.ts with path aliases (@/*)
10. Create frontend/index.html as Vite entry point
11. Create frontend/src/main.tsx as React entry with strict mode
12. Create backend/package.json with Express, TypeScript, pg, bcrypt, jsonwebtoken, winston, cors, helmet dependencies
13. Create backend/tsconfig.json extending root config
14. Create backend/.eslintrc.json with Node-specific rules
15. Create backend/src/index.ts as Express server entry point listening on port 3000
16. Create .husky/pre-commit hook to run lint on both packages

VALIDATION:
cd frontend && npm run build && cd ../backend && npm run build

```

---

## Set up PostgreSQL schema

**Context**
Create database migrations for users, user_preferences, dashboards, layers, widgets, widget_data, and sessions tables with proper constraints and indexes.

### Universal Agent Prompt
```

ROLE: Expert Database Engineer

GOAL: Create PostgreSQL migrations for 7 tables with constraints and indexes

CONTEXT: Create database migrations for users, user_preferences, dashboards, layers, widgets, widget_data, and sessions tables with proper constraints and indexes.

FILES TO CREATE:

- backend/migrations/001_initial_schema.up.sql
- backend/migrations/001_initial_schema.down.sql
- backend/src/db/connection.ts
- backend/src/db/migrate.ts

FILES TO MODIFY:

- backend/package.json
- backend/src/index.ts

DETAILED STEPS:

1. Create migrations directory in backend
2. Create 001_initial_schema.up.sql with users table (id, email, password_hash, created_at, updated_at)
3. Add user_preferences table (id, user_id FK, maxBlurIntensity, performanceMode, theme, created_at, updated_at)
4. Add dashboards table (id, user_id FK, name, description, created_at, updated_at)
5. Add layers table (id, dashboard_id FK, zIndex, name, opacity, blurIntensity, created_at, updated_at)
6. Add widgets table (id, layer_id FK, type, title, config, isDocked, targetLayerId, position, zIndex, created_at, updated_at)
7. Add widget_data table (id, widget_id FK, timestamp, value, trend, constituents, historical)
8. Add sessions table (id, user_id FK, token, expires_at, created_at)
9. Create foreign key constraints: user_preferences.user_id, dashboards.user_id, layers.dashboard_id, widgets.layer_id, widget_data.widget_id, sessions.user_id
10. Create indexes: user_preferences(user_id), layers(dashboard_id, zIndex), widget_data(widget_id, timestamp), sessions(token)
11. Create 001_initial_schema.down.sql with DROP TABLE statements in reverse order
12. Create db/connection.ts with pg Pool connection using DATABASE_URL env var
13. Create db/migrate.ts to run migration files
14. Add pg (node-postgres) dependency to backend/package.json
15. Update backend/src/index.ts to connect to database on startup

VALIDATION:
cd backend && npm run db:migrate

```

---

## Implement authentication endpoints

**Context**
Create POST /api/auth/login with bcrypt password hashing and JWT token generation, rate limited to 5 requests/minute per IP.

### Universal Agent Prompt
```

ROLE: Expert Backend Engineer

GOAL: Create login endpoint with bcrypt, JWT, and rate limiting

CONTEXT: Create POST /api/auth/login with bcrypt password hashing and JWT token generation, rate limited to 5 requests/minute per IP.

FILES TO CREATE:

- backend/src/routes/auth.routes.ts
- backend/src/controllers/auth.controller.ts
- backend/src/services/auth.service.ts
- backend/src/middleware/rateLimit.middleware.ts
- backend/src/middleware/auth.middleware.ts

FILES TO MODIFY:

- backend/src/index.ts
- backend/package.json

DETAILED STEPS:

1. Create rateLimit.middleware.ts with memory-based rate limiter (5 req/min per IP for login)
2. Create auth.service.ts with hashPassword using bcrypt (cost 12) and generateJWT using jsonwebtoken (24hr exp)
3. Create auth.controller.ts with login handler that validates email/password, returns { token, user }
4. Create auth.routes.ts with POST /api/auth/login endpoint protected by rate limiter
5. Create auth.middleware.ts with verifyJWT function attaching userId to req
6. Register auth routes in backend/src/index.ts
7. Add jsonwebtoken and bcrypt dependencies to package.json
8. Add JWT_SECRET and JWT_EXPIRES_HOURS=24 to .env.example

VALIDATION:
cd backend && npm run build

```

---

## Build auth middleware

**Context**
Create JWT verification middleware for protected routes. Valid tokens pass through, invalid/expired return 401.

### Universal Agent Prompt
```

ROLE: Expert Backend Engineer

GOAL: Create JWT verification middleware with 401 on invalid tokens

CONTEXT: Create JWT verification middleware for protected routes. Valid tokens pass through, invalid/expired return 401.

FILES TO CREATE:

- backend/src/middleware/auth.middleware.ts
- backend/src/tests/auth.middleware.test.ts

FILES TO MODIFY:

- backend/src/index.ts
- backend/package.json

DETAILED STEPS:

1. Extract verifyJWT function to auth.middleware.ts (already created in previous task)
2. Add authenticate middleware that extracts Bearer token from Authorization header
3. Verify token using jwt.verify(), attach userId to req.user
4. Return 401 { error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } } on failure
5. Create unit tests for valid token, expired token, malformed token, missing token
6. Add jest and ts-jest to devDependencies
7. Configure test script in package.json

VALIDATION:
cd backend && npm run build && npm test

```

---

## Implement dashboard endpoints

**Context**
Create GET /api/dashboards/:id and GET /api/dashboards/:id/layers with includeWidgets and layerDepth query params.

### Universal Agent Prompt
```

ROLE: Expert Backend Engineer

GOAL: Create dashboard GET endpoints with layers and widgets

CONTEXT: Create GET /api/dashboards/:id and GET /api/dashboards/:id/layers with includeWidgets and layerDepth query params.

FILES TO CREATE:

- backend/src/routes/dashboard.routes.ts
- backend/src/controllers/dashboard.controller.ts
- backend/src/services/dashboard.service.ts
- backend/src/tests/dashboard.controller.test.ts

FILES TO MODIFY:

- backend/src/index.ts

DETAILED STEPS:

1. Create dashboard.service.ts with getDashboard(id, includeWidgets, layerDepth) query joining layers and widgets
2. Create getDashboardLayers(id) returning layers ordered by zIndex
3. Create dashboard.controller.ts with getDashboard and getDashboardLayers handlers
4. Add 404 for non-existent dashboards, 403 for unauthorized (userId mismatch)
5. Create dashboard.routes.ts with GET /api/dashboards/:id?includeWidgets=true&layerDepth=3
6. Add GET /api/dashboards/:id/layers endpoint
7. Protect routes with authenticate middleware
8. Register routes in backend/src/index.ts
9. Create tests covering valid requests, 404, 403 scenarios

VALIDATION:
cd backend && npm run build && npm test

```

---

## Implement widget CRUD endpoints

**Context**
Create POST, PATCH, DELETE for widgets and GET /api/widgets/:id/data with TimeRange query parameter.

### Universal Agent Prompt
```

ROLE: Expert Backend Engineer

GOAL: Create widget CRUD endpoints with data API

CONTEXT: Create POST, PATCH, DELETE for widgets and GET /api/widgets/:id/data with TimeRange query parameter.

FILES TO CREATE:

- backend/src/routes/widget.routes.ts
- backend/src/controllers/widget.controller.ts
- backend/src/services/widget.service.ts
- backend/src/tests/widget.controller.test.ts

FILES TO MODIFY:

- backend/src/index.ts

DETAILED STEPS:

1. Create widget.service.ts with createWidget, updateWidget, deleteWidget, getWidgetData, updateDocking
2. Support widget types: 'metric', 'chart', 'composite'
3. Create widget.controller.ts with POST /api/widgets, PATCH /api/widgets/:id, DELETE /api/widgets/:id
4. Add GET /api/widgets/:id/data?timeRange=7d returning { value, trend, constituents, historical }
5. Add PATCH /api/widgets/:id/docking for isDocked, targetLayerId, position updates
6. Return 400 for invalid widget type or config
7. Create widget.routes.ts with all endpoints protected by authenticate middleware
8. Register routes in backend/src/index.ts
9. Create tests for CRUD operations, data filtering, docking updates

VALIDATION:
cd backend && npm run build && npm test

```

---

## Implement user preference endpoints

**Context**
Create GET /api/users/me and PATCH /api/users/me/preferences for maxBlurIntensity and performanceMode.

### Universal Agent Prompt
```

ROLE: Expert Backend Engineer

GOAL: Create user profile and preference endpoints

CONTEXT: Create GET /api/users/me and PATCH /api/users/me/preferences for maxBlurIntensity and performanceMode.

FILES TO CREATE:

- backend/src/routes/user.routes.ts
- backend/src/controllers/user.controller.ts
- backend/src/services/user.service.ts
- backend/src/tests/user.controller.test.ts

FILES TO MODIFY:

- backend/src/index.ts

DETAILED STEPS:

1. Create user.service.ts with getUserProfile and updateUserPreferences
2. Create user.controller.ts with getProfile (GET /api/users/me) returning { id, email, preferences }
3. Add updatePreferences (PATCH /api/users/me/preferences) accepting { maxBlurIntensity, performanceMode, theme }
4. Validate maxBlurIntensity is 0-100, performanceMode is 'auto' | 'performance' | 'quality', theme is valid
5. Return 400 for invalid preference values
6. Create user.routes.ts with both endpoints protected by authenticate middleware
7. Register routes in backend/src/index.ts
8. Create tests for valid and invalid preference updates

VALIDATION:
cd backend && npm run build && npm test

```

---

## Add error handling middleware

**Context**
Implement global error handler with standardized error envelope format.

### Universal Agent Prompt
```

ROLE: Expert Backend Engineer

GOAL: Create global error handler with { error: { code, message, details } } format

CONTEXT: Implement global error handler with standardized error envelope format.

FILES TO CREATE:

- backend/src/middleware/error.middleware.ts
- backend/src/utils/errors.ts

FILES TO MODIFY:

- backend/src/index.ts

DETAILED STEPS:

1. Create utils/errors.ts with AppError class (code, message, statusCode, details)
2. Create error.middleware.ts with global error handler
3. Error response format: { error: { code, message, details }, requestId }
4. Return generic message for 500 errors to avoid leaking info
5. Generate and attach requestId to req in a separate middleware
6. Include requestId in all error responses
7. Log errors with correlation IDs
8. Register error middleware last in backend/src/index.ts (after routes)

VALIDATION:
cd backend && npm run build

```

---

## Add logging and observability

**Context**
Implement structured JSON logging with Winston and metrics collection with request duration histogram.

### Universal Agent Prompt
```

ROLE: Expert Backend Engineer

GOAL: Add Winston JSON logging and request duration metrics

CONTEXT: Implement structured JSON logging with Winston and metrics collection with request duration histogram.

FILES TO CREATE:

- backend/src/utils/logger.ts
- backend/src/middleware/requestId.middleware.ts
- backend/src/middleware/metrics.middleware.ts

FILES TO MODIFY:

- backend/src/index.ts
- backend/package.json

DETAILED STEPS:

1. Create utils/logger.ts with Winston logger in JSON format
2. Log format: { timestamp, level, userId, requestId, message, ...meta }
3. Create requestId.middleware.ts to generate X-Request-ID and propagate to req.id
4. Create metrics.middleware.ts to track api_request_duration_seconds histogram
5. Add timing spans for critical operations (DB queries, external calls)
6. Replace console.log with logger throughout existing code
7. Add winston to package.json dependencies
8. Register request middleware before routes in backend/src/index.ts

VALIDATION:
cd backend && npm run build

```

---

## Bootstrap React application

**Context**
Create React app with Vite, configure Tailwind CSS with custom theme for Aurora, and set up routing.

### Universal Agent Prompt
```

ROLE: Expert React Frontend Engineer

GOAL: Create Vite React app with Tailwind CSS and React Router

CONTEXT: Create React app with Vite, configure Tailwind CSS with custom theme for Aurora, and set up routing.

FILES TO CREATE:

- frontend/src/App.tsx
- frontend/src/routes/index.tsx
- frontend/src/routes/login.tsx
- frontend/src/routes/dashboard.tsx
- frontend/src/components/Layout.tsx
- frontend/src/components/Navbar.tsx
- frontend/tailwind.config.js
- frontend/src/index.css
- frontend/src/types/index.ts

FILES TO MODIFY:

- frontend/src/main.tsx

DETAILED STEPS:

1. Configure Tailwind with custom Aurora theme (colors for glass layers, blur utilities)
2. Create tailwind.config.js with extend: { colors: { glass: { ... } }, backdropBlur: { ... } }
3. Create src/index.css with Tailwind directives and base glassmorphism utilities
4. Create src/types/index.ts with basic TypeScript interfaces
5. Create App.tsx with BrowserRouter and error boundary wrapper
6. Create routes/index.tsx with Routes for /login and /dashboard
7. Create login.tsx page with email/password form
8. Create dashboard.tsx page placeholder
9. Create Layout.tsx component with Navbar and outlet
10. Create Navbar.tsx with logo and logout button
11. Update main.tsx to render App in strict mode

VALIDATION:
cd frontend && npm run build

```

---

## Implement Zustand stores

**Context**
Create visual state store for cursor, layer depth, blur intensity and app state context for user, dashboard, auth.

### Universal Agent Prompt
```

ROLE: Expert React Frontend Engineer

GOAL: Create Zustand stores for visual state and app context

CONTEXT: Create visual state store for cursor, layer depth, blur intensity and app state context for user, dashboard, auth.

FILES TO CREATE:

- frontend/src/stores/visualStateStore.ts
- frontend/src/stores/appStateStore.ts
- frontend/src/stores/layerStore.ts
- frontend/src/types/stores.ts

FILES TO MODIFY:

- frontend/package.json

DETAILED STEPS:

1. Add zustand to frontend/package.json dependencies
2. Create types/stores.ts with IZVisualStateStore (cursor, layerDepth, blurIntensity, performanceMode)
3. Create types/stores.ts with IAppStateContext (user, dashboard, isAuthenticated, loading, error)
4. Create visualStateStore.ts with actions: setCursorPosition, setLayerDepth, setBlurIntensity, adjustBlurForPerformance
5. Create appStateStore.ts with actions: setUser, setDashboard, login, logout, setLoading, setError
6. Create layerStore.ts with layers array, actions: setLayers, addLayer, updateLayer, removeLayer, reorderLayers
7. Implement performance-aware blur adjustment: if performanceMode === 'low', reduce blur intensity
8. Use TypeScript generics for type safety

VALIDATION:
cd frontend && npm run build

```

---

## Build API client

**Context**
Create HTTP client with JWT auth, interceptors, 401 logout, and 30-second widget data caching.

### Universal Agent Prompt
```

ROLE: Expert React Frontend Engineer

GOAL: Create API client with auth, interceptors, and caching

CONTEXT: Create HTTP client with JWT auth, interceptors, 401 logout, and 30-second widget data caching.

FILES TO CREATE:

- frontend/src/api/client.ts
- frontend/src/api/auth.api.ts
- frontend/src/api/dashboards.api.ts
- frontend/src/api/widgets.api.ts
- frontend/src/api/users.api.ts

FILES TO MODIFY:

- frontend/package.json

DETAILED STEPS:

1. Add axios to frontend/package.json
2. Create api/client.ts ApiClient class with baseURL from VITE_API_URL, timeout 10000ms
3. Add request interceptor to attach JWT from localStorage to Authorization header
4. Add response interceptor: on 401, clear token and redirect to login
5. Implement simple cache: Map with URL as key, 30-second TTL for widget data endpoints only
6. Add retry logic (3 attempts with exponential backoff) for failed requests
7. Create auth.api.ts with login(email, password) function
8. Create dashboards.api.ts with getDashboard(id, options), getDashboardLayers(id)
9. Create widgets.api.ts with createWidget, updateWidget, deleteWidget, getWidgetData, updateDocking
10. Create users.api.ts with getProfile, updatePreferences

VALIDATION:
cd frontend && npm run build

```

---

## Create auth context and login flow

**Context**
Implement authentication context, login page with validation, protected routes, and logout.

### Universal Agent Prompt
```

ROLE: Expert React Frontend Engineer

GOAL: Create auth context, login page, and protected routes

CONTEXT: Implement authentication context, login page with validation, protected routes, and logout.

FILES TO CREATE:

- frontend/src/contexts/AuthContext.tsx
- frontend/src/components/ProtectedRoute.tsx
- frontend/src/routes/login.tsx

FILES TO MODIFY:

- frontend/src/App.tsx
- frontend/src/stores/appStateStore.ts

DETAILED STEPS:

1. Create AuthContext.tsx with token storage in localStorage
2. Provide auth state: isAuthenticated, user, loading, login, logout
3. Login function: call API, store token, update store, redirect
4. Logout function: clear token, clear store, redirect to /login
5. Create ProtectedRoute.tsx component redirecting to /login if not authenticated
6. Update login.tsx with form validation (email format, password min length)
7. Show loading state during login API call
8. Display error messages on failed login
9. Update App.tsx to wrap routes with AuthProvider
10. Add /login and /dashboard routes with ProtectedRoute on dashboard

VALIDATION:
cd frontend && npm run build

```

---

## Implement error boundary

**Context**
Create React error boundary with fallback UI, error logging, and retry option.

### Universal Agent Prompt
```

ROLE: Expert React Frontend Engineer

GOAL: Create error boundary component with fallback and retry

CONTEXT: Create React error boundary with fallback UI, error logging, and retry option.

FILES TO CREATE:

- frontend/src/components/ErrorBoundary.tsx
- frontend/src/components/FallbackError.tsx

FILES TO MODIFY:

- frontend/src/App.tsx

DETAILED STEPS:

1. Create ErrorBoundary.tsx class component catching errors in children
2. On error: log to /api/errors endpoint (with stack trace in dev)
3. Set local state: hasError, error
4. Create FallbackError.tsx component with friendly error message
5. Add retry button that resets error state and re-renders children
6. Show error details in development mode only
7. Wrap entire App in ErrorBoundary in App.tsx

VALIDATION:
cd frontend && npm run build

```

---

## Set up React Three Fiber canvas

**Context**
Initialize R3F canvas with orthographic camera, lighting, and responsive resize handling.

### Universal Agent Prompt
```

ROLE: Expert WebGL/React Three Fiber Engineer

GOAL: Create R3F canvas with camera and lighting

CONTEXT: Initialize R3F canvas with orthographic camera, lighting, and responsive resize handling.

FILES TO CREATE:

- frontend/src/components/canvas/Canvas.tsx
- frontend/src/components/canvas/Camera.tsx
- frontend/src/components/canvas/Lighting.tsx
- frontend/src/components/canvas/Scene.tsx

FILES TO MODIFY:

- frontend/package.json
- frontend/src/routes/dashboard.tsx

DETAILED STEPS:

1. Add @react-three/fiber, @react-three/drei, three to frontend/package.json
2. Create Canvas.tsx wrapping @react-three/fiber Canvas
3. Make canvas responsive to window resize with useResize hook
4. Create Camera.tsx with OrthographicCamera for 2.5D view
5. Set camera position for isometric-like perspective
6. Create Lighting.tsx with AmbientLight and DirectionalLight
7. Create Scene.tsx as container for 3D objects
8. Add Stats panel from @react-three/drei in development mode
9. Integrate Canvas component into dashboard.tsx

VALIDATION:
cd frontend && npm run build

```

---

## Create glassmorphism shader

**Context**
Write custom shader material for frosted glass effect with dynamic opacity and blur intensity.

### Universal Agent Prompt
```

ROLE: Expert WebGL/Shader Engineer

GOAL: Create custom glass shader material with dynamic blur

CONTEXT: Write custom shader material for frosted glass effect with dynamic opacity and blur intensity.

FILES TO CREATE:

- frontend/src/shaders/GlassMaterial.tsx
- frontend/src/shaders/glass.glsl.ts
- frontend/src/components/canvas/GlassPane.tsx

FILES TO MODIFY:

- frontend/package.json

DETAILED STEPS:

1. Create glass.glsl.ts with vertex and fragment shader strings
2. Vertex shader: pass UVs and normals, handle position
3. Fragment shader: implement transparency with opacity uniform, blur with blurIntensity uniform
4. Add subtle noise for realism, rim lighting effect
5. Create GlassMaterial.tsx as shader material component extending shaderMaterial
6. Accept uniforms: opacity (0-1), blurIntensity (0-50), color, time
7. Create GlassPane.tsx using the GlassMaterial on a Plane mesh
8. Add props for position, size, opacity, blurIntensity
9. Test with a sample plane in dashboard.tsx

VALIDATION:
cd frontend && npm run build

```

---

## Implement GPU capability detection

**Context**
Detect GPU capabilities and adjust blur intensity. High-end GPUs use full blur, low-end fallback to CSS.

### Universal Agent Prompt
```

ROLE: Expert WebGL/Performance Engineer

GOAL: Detect GPU and adjust blur intensity accordingly

CONTEXT: Detect GPU capabilities and adjust blur intensity. High-end GPUs use full blur, low-end fallback to CSS.

FILES TO CREATE:

- frontend/src/hooks/useGPUDetection.ts
- frontend/src/utils/webgl.ts

FILES TO MODIFY:

- frontend/src/stores/visualStateStore.ts
- frontend/src/components/canvas/Canvas.tsx

DETAILED STEPS:

1. Create utils/webgl.ts with detectCapabilities() function
2. Get WebGL context and check capabilities via renderer.getParameter
3. Use getMaxAnisotropy() as proxy for GPU quality
4. Classify as: high (maxAnisotropy >= 16), medium (8-15), low (< 8)
5. Create useGPUDetection.ts hook running detection on mount
6. Return: gpuLevel, maxBlurIntensity based on GPU (high: 50, medium: 25, low: 10)
7. Update visualStateStore with detected capabilities
8. Add fallback to CSS backdrop-filter for low-end GPUs
9. Integrate detection into Canvas.tsx on mount

VALIDATION:
cd frontend && npm run build

```

---

## Add noise generation for gradient banding

**Context**
Implement real-time background noise texture to prevent color banding on gradient layers.

### Universal Agent Prompt
```

ROLE: Expert WebGL/Shader Engineer

GOAL: Add procedural noise texture to prevent banding

CONTEXT: Implement real-time background noise texture to prevent color banding on gradient layers.

FILES TO CREATE:

- frontend/src/utils/noise.ts
- frontend/src/shaders/GlassMaterial.tsx

FILES TO MODIFY:

- frontend/src/shaders/glass.glsl.ts

DETAILED STEPS:

1. Create utils/noise.ts with generateNoiseTexture() function
2. Generate noise texture procedurally using canvas (64x64 or 128x128)
3. Create random noise with adjustable intensity (0-255)
4. Convert texture to data URL for Three.js texture loading
5. Update glass fragment shader to accept noise texture uniform
6. Multiply final color by noise for subtle grain effect
7. Add noiseIntensity uniform (default 0.03) to GlassMaterial
8. Apply noise overlay to glass layers in shader

VALIDATION:
cd frontend && npm run build

```

---

## Implement contextual lighting

**Context**
Create cursor-following light source with dynamic shadows for depth perception.

### Universal Agent Prompt
```

ROLE: Expert WebGL/React Three Fiber Engineer

GOAL: Add cursor-tracking light with dynamic shadows

CONTEXT: Create cursor-following light source with dynamic shadows for depth perception.

FILES TO CREATE:

- frontend/src/components/canvas/ContextualLight.tsx
- frontend/src/hooks/useCursorLight.ts

FILES TO MODIFY:

- frontend/src/stores/visualStateStore.ts
- frontend/src/components/canvas/Canvas.tsx

DETAILED STEPS:

1. Add cursor position to visualStateStore: x, y coordinates
2. Create useCursorLight.ts hook tracking mouse position
3. Throttle updates to 60fps using requestAnimationFrame
4. Convert screen coordinates to normalized device coordinates (NDC)
5. Create ContextualLight.tsx component with PointLight
6. Update light position based on cursor from store
7. Add shadow casting: light.castShadow = true, objects receiveShadow
8. Position light slightly above z-axis for dramatic shadows
9. Adjust shadow map size and bias for quality
10. Integrate into Canvas.tsx

VALIDATION:
cd frontend && npm run build

```

---

## Create Z-layer data structure

**Context**
Define IZLayer interface and layer management system with Zustand store.

### Universal Agent Prompt
```

ROLE: Expert React Frontend Engineer

GOAL: Define layer interfaces and create layer store

CONTEXT: Define IZLayer interface and layer management system with Zustand store.

FILES TO CREATE:

- frontend/src/types/layers.ts
- frontend/src/stores/layerStore.ts

FILES TO MODIFY:

- frontend/src/stores/visualStateStore.ts

DETAILED STEPS:

1. Create types/layers.ts with IZLayer interface: id, zIndex (0-99), opacity, blurIntensity, widgets: IWidget[]
2. Add IWidget reference: id, type, title, config, position
3. Create layerStore.ts with Zustand
4. State: layers: Map<id, IZLayer>, currentZDepth: number, maxLayers: 100
5. Actions: setLayers, addLayer, updateLayer, removeLayer, reorderLayers, setCurrentZDepth
6. Selector: getLayersSorted returns layers sorted by zIndex ascending
7. Selector: getLayerById finds layer by ID
8. Add constraint check: max 100 layers, log warning if exceeded
9. Integrate currentZDepth with visualStateStore.layerDepth

VALIDATION:
cd frontend && npm run build

```

---

## Render layered glass panes

**Context**
Create 3D plane components for each layer with glass material, depth-based opacity and blur.

### Universal Agent Prompt
```

ROLE: Expert WebGL/React Three Fiber Engineer

GOAL: Render glass panes as 3D planes with depth styling

CONTEXT: Create 3D plane components for each layer with glass material, depth-based opacity and blur.

FILES TO CREATE:

- frontend/src/components/canvas/LayerPane.tsx
- frontend/src/components/canvas/LayerStack.tsx

FILES TO MODIFY:

- frontend/src/types/layers.ts
- frontend/src/components/canvas/Scene.tsx

DETAILED STEPS:

1. Create LayerPane.tsx component rendering Plane mesh with GlassMaterial
2. Props: layer (IZLayer), isVisible (bool)
3. Z-position calculated from layer.zIndex * layerSpacing (e.g., 2 units per layer)
4. Opacity varies by depth: foreground 0.9-1.0, mid 0.5-0.7, background 0.1-0.3
5. Blur increases with depth: blurIntensity = layer.zIndex * baseBlur
6. Use useWidgetData hook to fetch data for widgets in layer on mount
7. Create LayerStack.tsx mapping layers to LayerPane components
8. Use layerStore.getLayersSorted selector
9. Only render layers within visibility range (currentDepth ± 2)
10. Integrate LayerStack into Scene.tsx

VALIDATION:
cd frontend && npm run build

```

---

## Implement layer transition animation

**Context**
Animate camera movement when navigating between layers with 300ms smooth easing.

### Universal Agent Prompt
```

ROLE: Expert WebGL/Animation Engineer

GOAL: Create smooth camera animations for layer transitions

CONTEXT: Animate camera movement when navigating between layers with 300ms smooth easing.

FILES TO CREATE:

- frontend/src/hooks/useLayerTransition.ts
- frontend/src/components/camera/AnimatedCamera.tsx

FILES TO MODIFY:

- frontend/src/components/canvas/Camera.tsx
- frontend/src/stores/layerStore.ts

DETAILED STEPS:

1. Create useLayerTransition.ts hook for transition state
2. State: isTransitioning, targetZDepth, progress
3. Function: transitionToDepth(zIndex) triggers animation
4. Add throttle: max 1 transition per 300ms, cancellable on rapid clicks
5. Create AnimatedCamera.tsx extending Camera.tsx
6. Use @react-three/drei useSpring or custom lerping for smooth animation
7. Target z-position: -targetZDepth * layerSpacing
8. Duration: 300ms, easing: easeOutCubic
9. Blur parent layer during transition (increase blurIntensity)
10. Update layerStore.currentZDepth on animation complete

VALIDATION:
cd frontend && npm run build

```

---

## Add depth-based opacity calculation

**Context**
Calculate layer opacity based on distance from camera using formula.

### Universal Agent Prompt
```

ROLE: Expert React/Math Engineer

GOAL: Implement opacity calculation based on depth

CONTEXT: Calculate layer opacity based on distance from camera using formula.

FILES TO CREATE:

- frontend/src/utils/depth.ts

FILES TO MODIFY:

- frontend/src/components/canvas/LayerPane.tsx
- frontend/src/hooks/useLayerTransition.ts

DETAILED STEPS:

1. Create utils/depth.ts with calculateOpacity(depth, maxDepth) function
2. Formula: opacity = 1 - (depth / maxDepth) * 0.7
3. Clamp result between 0.1 and 1.0
4. maxDepth default: 100 (for 100 layers max)
5. Foreground (depth 0-10): 0.9-1.0 opacity
6. Mid-ground (depth 11-50): 0.5-0.7 opacity
7. Background (depth 51+): 0.1-0.3 opacity
8. Update LayerPane.tsx to use calculateOpacity for material opacity
9. Recalculate during layer transitions for smooth fade
10. Reactive to layerStore.currentZDepth changes

VALIDATION:
cd frontend && npm run build

```

---

## Implement layer lazy-loading

**Context**
Fetch data only for visible layer and adjacent layers (±1 Z), cache for 30 seconds.

### Universal Agent Prompt
```

ROLE: Expert React/Performance Engineer

GOAL: Lazy load layer data with prefetching and caching

CONTEXT: Fetch data only for visible layer and adjacent layers (±1 Z), cache for 30 seconds.

FILES TO CREATE:

- frontend/src/hooks/useLayerData.ts
- frontend/src/utils/layerCache.ts

FILES TO MODIFY:

- frontend/src/components/canvas/LayerPane.tsx
- frontend/src/stores/layerStore.ts

DETAILED STEPS:

1. Create utils/layerCache.ts with Map-based cache
2. Cache key: layerId, TTL: 30 seconds, auto-cleanup
3. Create useLayerData.ts(layerId, zIndex) hook
4. Check if layer is visible: |zIndex - currentZDepth| <= 1
5. Fetch layer data (widgets) only if visible and not cached
6. Prefetch adjacent layers (currentDepth ± 1) in background
7. Skip fetch for deep layers (|zIndex - currentZDepth| > 2)
8. Store fetched data in layerCache
9. Invalidate cache after 30 seconds (timestamp check)
10. Update LayerPane.tsx to use useLayerData instead of direct API call
11. Add loading state to layerStore: loadingLayers Set<layerId>

VALIDATION:
cd frontend && npm run build

```

---

## Create widget component structure

**Context**
Build base widget component with metric, chart, and composite variants using React.memo.

### Universal Agent Prompt
```

ROLE: Expert React Component Engineer

GOAL: Create base widget with metric, chart, composite variants

CONTEXT: Build base widget component with metric, chart, and composite variants using React.memo.

FILES TO CREATE:

- frontend/src/types/widgets.ts
- frontend/src/components/widgets/BaseWidget.tsx
- frontend/src/components/widgets/MetricWidget.tsx
- frontend/src/components/widgets/ChartWidget.tsx
- frontend/src/components/widgets/CompositeWidget.tsx

FILES TO MODIFY:

- frontend/src/components/canvas/LayerPane.tsx

DETAILED STEPS:

1. Create types/widgets.ts with IWidget, IWidgetData, WidgetType ('metric' | 'chart' | 'composite')
2. Create BaseWidget.tsx with common props: id, type, title, data, position, onClick
3. Use React.memo for performance optimization
4. Render as HTML content (not 3D mesh) using Html from @react-three/drei
5. Create MetricWidget.tsx extending BaseWidget
6. Display single value, trend indicator, sparkline placeholder
7. Create ChartWidget.tsx extending BaseWidget
8. Display line/bar chart using simple SVG or Canvas (no chart lib)
9. Create CompositeWidget.tsx extending BaseWidget
10. Display aggregated value with prism effect placeholder
11. Integrate widgets into LayerPane.tsx as HTML overlays at widget positions

VALIDATION:
cd frontend && npm run build

```

---

## Implement widget data fetching

**Context**
Fetch and cache widget data from API with 5-minute refetch interval.

### Universal Agent Prompt
```

ROLE: Expert React Data Engineer

GOAL: Create useWidgetData hook with caching and polling

CONTEXT: Fetch and cache widget data from API with 5-minute refetch interval.

FILES TO CREATE:

- frontend/src/hooks/useWidgetData.ts
- frontend/src/api/widgets.api.ts

FILES TO MODIFY:

- frontend/src/components/widgets/BaseWidget.tsx

DETAILED STEPS:

1. Update widgets.api.ts with getWidgetData(id, timeRange = '7d')
2. TimeRange types: '1d' | '7d' | '30d' | '90d'
3. Create useWidgetData.ts(widgetId, timeRange) hook
4. Return: { data, loading, error, refetch }
5. Use API client's built-in cache (30-second TTL)
6. Set up interval refetch every 5 minutes using setInterval
7. Clear interval on unmount
8. Handle loading state with boolean flag
9. Handle error state with error object
10. Include constituents data for composite widgets
11. Return historical array for sparkline charts
12. Update BaseWidget.tsx to use useWidgetData hook

VALIDATION:
cd frontend && npm run build

```

---

## Add prism effect for composite widgets

**Context**
Refract composite metrics into constituent parts on hover with expanding cards animation.

### Universal Agent Prompt
```

ROLE: Expert React/Animation Engineer

GOAL: Create hover prism effect for composite widgets

CONTEXT: Refract composite metrics into constituent parts on hover with expanding cards animation.

FILES TO CREATE:

- frontend/src/components/widgets/PrismEffect.tsx
- frontend/src/components/widgets/ConstituentCard.tsx

FILES TO MODIFY:

- frontend/src/components/widgets/CompositeWidget.tsx

DETAILED STEPS:

1. Create PrismEffect.tsx component with visibility state
2. Props: constituents (array of { name, value, weight }), isVisible
3. Create ConstituentCard.tsx for individual constituent display
4. Show: name, value, weight percentage, color indicator
5. Animation: cards expand outward from center mimicking light refraction
6. Use CSS transforms with spring animation
7. Debounce hover events by 100ms to avoid flickering
8. Keep effect contained within widget bounds (overflow: hidden)
9. Update CompositeWidget.tsx to wrap content in PrismEffect on hover
10. Show prism effect when widget has constituents data

VALIDATION:
cd frontend && npm run build

```

---

## Create trend visualization

**Context**
Display trend indicators and sparklines for metrics with color coding.

### Universal Agent Prompt
```

ROLE: Expert React/UI Engineer

GOAL: Add trend arrows and sparkline charts to metrics

CONTEXT: Display trend indicators and sparklines for metrics with color coding.

FILES TO CREATE:

- frontend/src/components/widgets/TrendIndicator.tsx
- frontend/src/components/widgets/Sparkline.tsx

FILES TO MODIFY:

- frontend/src/components/widgets/MetricWidget.tsx

DETAILED STEPS:

1. Create TrendIndicator.tsx component
2. Props: trend (number, percentage), direction ('up' | 'down' | 'flat')
3. Show arrow icon: up (↗), down (↘), flat (→)
4. Color code: up = green, down = red, flat = neutral gray
5. Display percentage with + or - prefix
6. Create Sparkline.tsx component using SVG polyline
7. Props: data (number array), width, height, color
8. Draw simple line chart from historical data points
9. Scale data to fit SVG dimensions
10. Add ARIA labels for screen readers
11. Update MetricWidget.tsx to include TrendIndicator and Sparkline

VALIDATION:
cd frontend && npm run build

```

---

## Add widget CRUD UI

**Context**
Create interface for creating and deleting widgets with modal and validation.

### Universal Agent Prompt
```

ROLE: Expert React/UI Engineer

GOAL: Create widget add/delete modal with form validation

CONTEXT: Create interface for creating and deleting widgets with modal and validation.

FILES TO CREATE:

- frontend/src/components/widgets/WidgetModal.tsx
- frontend/src/components/widgets/WidgetCreator.tsx
- frontend/src/components/widgets/WidgetDeleteButton.tsx

FILES TO MODIFY:

- frontend/src/routes/dashboard.tsx
- frontend/src/api/widgets.api.ts

DETAILED STEPS:

1. Create WidgetModal.tsx as dialog/modal wrapper
2. Props: isOpen, onClose, title, children
3. Create WidgetCreator.tsx form component
4. Fields: title (text), type (select: metric|chart|composite), config (JSON or form fields)
5. Validate: title required, type required, config valid JSON
6. On submit: call POST /api/widgets with form data
7. Create WidgetDeleteButton.tsx on widgets
8. Props: widgetId, onDeleted callback
9. Show confirmation dialog before delete
10. On confirm: call DELETE /api/widgets/:id
11. Add 'Add Widget' button in dashboard.tsx opening WidgetModal

VALIDATION:
cd frontend && npm run build

```

---

## Add drag-and-drop capability

**Context**
Enable widgets to be dragged within and between layers with visual feedback.

### Universal Agent Prompt
```

ROLE: Expert React/Interaction Engineer

GOAL: Implement widget drag-and-drop with visual feedback

CONTEXT: Enable widgets to be dragged within and between layers with visual feedback.

FILES TO CREATE:

- frontend/src/components/widgets/DragHandle.tsx
- frontend/src/hooks/useWidgetDrag.ts

FILES TO MODIFY:

- frontend/src/components/widgets/BaseWidget.tsx
- frontend/package.json

DETAILED STEPS:

1. Add @dnd-kit/core to frontend/package.json (OPTIONAL, recommended for better drag-drop)
2. Alternative: Use native HTML5 drag and drop API if keeping dependencies minimal
3. Create DragHandle.tsx component as grip icon on widget header
4. Create useWidgetDrag.ts hook for drag logic
5. State: isDragging, position {x, y}
6. On drag start: set isDragging true, add visual class
7. On drag move: update position, constrain to layer bounds
8. On drag end: save new position to API
9. Support touch devices with touch events
10. Add visual feedback: opacity 0.8, shadow, scale slightly
11. Update BaseWidget.tsx to include DragHandle and useWidgetDrag

VALIDATION:
cd frontend && npm run build

```

---

## Create docking zone on surface layer

**Context**
Define droppable area on top layer for docked widgets with visual indicators.

### Universal Agent Prompt
```

ROLE: Expert React/Interaction Engineer

GOAL: Create docking zone on surface layer with drop indicators

CONTEXT: Define droppable area on top layer for docked widgets with visual indicators.

FILES TO CREATE:

- frontend/src/components/dock/DockingZone.tsx
- frontend/src/hooks/useDockingZone.ts

FILES TO MODIFY:

- frontend/src/components/canvas/LayerPane.tsx

DETAILED STEPS:

1. Create DockingZone.tsx component for surface layer (zIndex 0)
2. Designated area: top or side panel on surface layer
3. Props: isHighlighted (bool), onDrop (function)
4. Highlight zone when dragging widget (border/glow effect)
5. Visual indicator: dashed border or 'Dock here' placeholder when empty
6. Create useDockingZone.ts hook managing dock state
7. State: dockedWidgets (array), isDraggingOver
8. Enforce max 10 docked widgets limit
9. Zone size configurable via props (width, height)
10. Integrate DockingZone into LayerPane.tsx for zIndex 0 only

VALIDATION:
cd frontend && npm run build

```

---

## Implement docking persistence

**Context**
Save and restore widget docking state via PATCH /api/widgets/:id/docking.

### Universal Agent Prompt
```

ROLE: Expert React/Backend Engineer

GOAL: Persist widget docking state to database

CONTEXT: Save and restore widget docking state via PATCH /api/widgets/:id/docking.

FILES TO CREATE:

- frontend/src/api/widgets.api.ts
- frontend/src/hooks/useWidgetDocking.ts

FILES TO MODIFY:

- frontend/src/components/dock/DockingZone.tsx
- frontend/src/components/widgets/BaseWidget.tsx

DETAILED STEPS:

1. Update widgets.api.ts with updateDocking(id, isDocked, targetLayerId, position) function
2. Call PATCH /api/widgets/:id/docking endpoint
3. Create useWidgetDocking.ts hook
4. Function: dockWidget(widgetId, targetLayerId, position) calls API
5. Function: undockWidget(widgetId) sets isDocked false, returns to original layer
6. On drop in DockingZone: call dockWidget with targetLayerId='surface'
7. Save position within docking zone
8. On undock: animate back to original layer position
9. Handle API errors with user feedback (toast/inline error)
10. Refresh widget data after successful dock/undock
11. Update DockingZone to call dockWidget on drop

VALIDATION:
cd frontend && npm run build

```

---

## Animate dock and undock transitions

**Context**
Smooth animations when widgets move between layers with 200ms duration.

### Universal Agent Prompt
```

ROLE: Expert React/Animation Engineer

GOAL: Create smooth dock/undock animations

CONTEXT: Smooth animations when widgets move between layers with 200ms duration.

FILES TO CREATE:

- frontend/src/components/widgets/AnimatedWidget.tsx
- frontend/src/hooks/useWidgetAnimation.ts

FILES TO MODIFY:

- frontend/src/components/widgets/BaseWidget.tsx
- frontend/src/components/dock/DockingZone.tsx

DETAILED STEPS:

1. Create useWidgetAnimation.ts hook
2. State: isAnimating, fromPosition, toPosition, progress
3. Animate position changes using CSS transitions or Framer Motion (OPTIONAL)
4. Use CSS transitions for simplicity (no extra dependency)
5. Duration: 200ms, easing: ease-out
6. Update AnimatedWidget.tsx to apply transition styles
7. On dock: animate from layer position to dock position
8. On undock: animate from dock position back to layer position
9. Fade opacity during layer transition
10. Animation cancellable on new actions (cancel previous animation)
11. Integrate into BaseWidget and DockingZone

VALIDATION:
cd frontend && npm run build

```

---

## Implement materialized view for KPI caching

**Context**
Create PostgreSQL materialized view for widget aggregations with 5-minute refresh.

### Universal Agent Prompt
```

ROLE: Expert Database/Backend Engineer

GOAL: Create materialized view for KPI caching with cron refresh

CONTEXT: Create PostgreSQL materialized view for widget aggregations with 5-minute refresh.

FILES TO CREATE:

- backend/migrations/002_kpi_materialized_view.up.sql
- backend/migrations/002_kpi_materialized_view.down.sql
- backend/src/jobs/refreshMaterializedView.ts
- backend/src/db/queries.ts

FILES TO MODIFY:

- backend/src/index.ts
- backend/src/services/widget.service.ts

DETAILED STEPS:

1. Create migration 002_kpi_materialized_view.up.sql
2. Create materialized view: mv_widget_kpi_data aggregating widget_data by widget_id and time ranges
3. Include columns: widget_id, time_range, value, trend, last_updated
4. Create index on mv_widget_kpi_data(widget_id, time_range)
5. Create down migration to drop view
6. Create jobs/refreshMaterializedView.ts with REFRESH MATERIALIZED VIEW CONCURRENTLY
7. Create db/queries.ts using materialized view for widget data queries
8. Set up node-cron or setInterval for 5-minute refresh
9. Add fallback to raw query if view stale
10. Monitor cache hit rate in logs
11. Update widget.service.ts to use queries from db/queries.ts

VALIDATION:
cd backend && npm run build

```

---

## Optimize WebGL rendering

**Context**
Ensure 60fps target with frame budget monitoring and render loop optimization.

### Universal Agent Prompt
```

ROLE: Expert WebGL/Performance Engineer

GOAL: Optimize R3F rendering for 60fps target

CONTEXT: Ensure 60fps target with frame budget monitoring and render loop optimization.

FILES TO CREATE:

- frontend/src/utils/performance.ts
- frontend/src/hooks/useFrameMonitor.ts

FILES TO MODIFY:

- frontend/src/components/canvas/Canvas.tsx
- frontend/src/components/canvas/GlassPane.tsx

DETAILED STEPS:

1. Create utils/performance.ts with frame monitoring utilities
2. Use performance.now() to measure frame duration
3. Create useFrameMonitor.ts hook tracking frame times
4. Emit metric webgl_frame_duration_ms when frame > 16ms
5. Alert when frame budget exceeded (log to console in dev)
6. Optimize R3F render loop: use frameloop='demand' when static
7. Add React.memo to GlassPane and LayerPane components
8. Implement instanced rendering for multiple similar panes
9. Reduce shader complexity when performanceMode is 'low'
10. Disable shadows on low-end devices
11. Limit resolution of noise texture based on GPU tier
12. Update Canvas.tsx with performance monitoring

VALIDATION:
cd frontend && npm run build

```

---

## Add request debouncing and throttling

**Context**
Implement debouncing for prism effect (100ms), layer transitions (300ms), and cursor updates (60fps).

### Universal Agent Prompt
```

ROLE: Expert React/Performance Engineer

GOAL: Add debounce and throttle to high-frequency events

CONTEXT: Implement debouncing for prism effect (100ms), layer transitions (300ms), and cursor updates (60fps).

FILES TO CREATE:

- frontend/src/hooks/useDebounce.ts
- frontend/src/hooks/useThrottle.ts
- frontend/src/utils/performanceConfig.ts

FILES TO MODIFY:

- frontend/src/components/widgets/PrismEffect.tsx
- frontend/src/hooks/useLayerTransition.ts
- frontend/src/hooks/useCursorLight.ts

DETAILED STEPS:

1. Create hooks/useDebounce.ts with configurable delay
2. Create hooks/useThrottle.ts with configurable interval
3. Create utils/performanceConfig.ts with constants
4. PRISM_DEBOUNCE_MS = 100, LAYER_THROTTLE_MS = 300, CURSOR_THROTTLE_MS = 16 (60fps)
5. Update PrismEffect.tsx: use useDebounce for hover state
6. Update useLayerTransition.ts: use useThrottle for transition calls
7. Update useCursorLight.ts: use useThrottle for cursor position updates
8. Batch API calls for position updates (collect changes, send in single request)
9. Make all values configurable via visualStateStore

VALIDATION:
cd frontend && npm run build

```

---

## Implement bundle optimization

**Context**
Code splitting and lazy loading for performance. Target <500KB gzipped, <2s load on 3G.

### Universal Agent Prompt
```

ROLE: Expert React/Build Engineer

GOAL: Optimize bundle size with code splitting and lazy loading

CONTEXT: Code splitting and lazy loading for performance. Target <500KB gzipped, <2s load on 3G.

FILES TO CREATE:

- frontend/src/utils/loadable.tsx
- frontend/vite.config.ts

FILES TO MODIFY:

- frontend/src/App.tsx
- frontend/src/routes/dashboard.tsx

DETAILED STEPS:

1. Update vite.config.ts with build optimizations
2. Enable manualChunks: separate vendors, shaders, heavy components
3. Configure build.target to es2015 for wider support
4. Create utils/loadable.tsx with React.lazy wrapper
5. Lazy load shaders in separate bundle
6. Lazy load heavy widgets (ChartWidget, CompositeWidget with prism)
7. Route-based code splitting: lazy load dashboard route
8. Update App.tsx to use Suspense for lazy routes
9. Add bundle analyzer to package.json (OPTIONAL: vite-bundle-visualizer)
10. Measure and report bundle size in build output
11. Target: <500KB gzipped total, <200KB for initial load

VALIDATION:
cd frontend && npm run build

```

---

## Add loading states and skeletons

**Context**
Improve perceived performance with skeleton screens, progressive loading, and spinners.

### Universal Agent Prompt
```

ROLE: Expert React/UI Engineer

GOAL: Add loading skeletons and progressive loading UI

CONTEXT: Improve perceived performance with skeleton screens, progressive loading, and spinners.

FILES TO CREATE:

- frontend/src/components/ui/Skeleton.tsx
- frontend/src/components/ui/Spinner.tsx
- frontend/src/components/ui/ErrorState.tsx
- frontend/src/components/ui/EmptyState.tsx
- frontend/src/components/widgets/WidgetSkeleton.tsx

FILES TO MODIFY:

- frontend/src/components/widgets/BaseWidget.tsx
- frontend/src/components/canvas/LayerPane.tsx

DETAILED STEPS:

1. Create Skeleton.tsx component with shimmer animation
2. Props: width, height, variant (text|circle|rect)
3. Create Spinner.tsx component for API calls >500ms
4. Create ErrorState.tsx with retry button
5. Create EmptyState.tsx for no-data scenarios
6. Create WidgetSkeleton.tsx matching widget layout
7. Update BaseWidget.tsx: show skeleton while data loading
8. Update LayerPane.tsx: progressive loading for deep layers
9. Show spinner for API calls taking >500ms (use timeout)
10. Show error state with retry button on failed fetches
11. Show empty state when data exists but is null/empty

VALIDATION:
cd frontend && npm run build

```

---

## Implement accessibility features

**Context**
Add keyboard navigation, screen reader support, ARIA labels, and fallback 2D view.

### Universal Agent Prompt
```

ROLE: Expert Accessibility Engineer

GOAL: Add full keyboard navigation and screen reader support

CONTEXT: Add keyboard navigation, screen reader support, ARIA labels, and fallback 2D view.

FILES TO CREATE:

- frontend/src/hooks/useKeyboardNav.ts
- frontend/src/components/ui/Fallback2DView.tsx
- frontend/src/utils/aria.ts

FILES TO MODIFY:

- frontend/src/components/widgets/BaseWidget.tsx
- frontend/src/components/canvas/LayerPane.tsx
- frontend/src/stores/appStateStore.ts

DETAILED STEPS:

1. Add prefersReducedMotion to appStateStore
2. Create useKeyboardNav.ts hook for keyboard shortcuts
3. Tab navigation through widgets with tabIndex
4. Arrow keys for Z-axis layer navigation (up/down to move between layers)
5. Create utils/aria.ts with ARIA label generators
6. Add ARIA labels to all interactive elements (buttons, inputs)
7. Add ARIA live region for announcing layer changes
8. Ensure focus indicators visible (outline styles)
9. Create Fallback2DView.tsx as alternative layout
10. Detect motion sensitivity via window.matchMedia('(prefers-reduced-motion: reduce)')
11. Auto-switch to 2D view when reduced motion preferred
12. Add toggle in settings for manual 2D/3D switch
13. Screen reader announcements for layer depth changes, widget docking

VALIDATION:
cd frontend && npm run build

```

---

## Write unit tests for widgets

**Context**
Test widget components with React Testing Library. Target >80% coverage.

### Universal Agent Prompt
```

ROLE: Expert QA/Test Engineer

GOAL: Create unit tests for all widget components

CONTEXT: Test widget components with React Testing Library. Target >80% coverage.

FILES TO CREATE:

- frontend/src/components/widgets/__tests__/MetricWidget.test.tsx
- frontend/src/components/widgets/__tests__/ChartWidget.test.tsx
- frontend/src/components/widgets/__tests__/CompositeWidget.test.tsx
- frontend/src/hooks/__tests__/useWidgetData.test.ts

FILES TO MODIFY:

- frontend/package.json
- frontend/vite.config.ts

DETAILED STEPS:

1. Add @testing-library/react, @testing-library/user-event, vitest to package.json
2. Configure vitest in vite.config.ts
3. Create MetricWidget.test.tsx: test render with props, trend display, loading state
4. Create ChartWidget.test.tsx: test data display, chart rendering
5. Create CompositeWidget.test.tsx: test prism effect trigger, constituents display
6. Create useWidgetData.test.ts: test fetch, cache, refetch, error handling
7. Mock API responses in tests
8. Test user interactions: click, hover, drag
9. Ensure all tests pass
10. Configure coverage in vitest (reporter: 'json', 'html', 'text')
11. Target >80% coverage for widget code

VALIDATION:
cd frontend && npm run build && npm run test:coverage

```

---

## Write unit tests for Zustand stores

**Context**
Test state management actions and updates. Target >80% coverage.

### Universal Agent Prompt
```

ROLE: Expert QA/Test Engineer

GOAL: Create unit tests for all Zustand stores

CONTEXT: Test state management actions and updates. Target >80% coverage.

FILES TO CREATE:

- frontend/src/stores/__tests__/visualStateStore.test.ts
- frontend/src/stores/__tests__/appStateStore.test.ts
- frontend/src/stores/__tests__/layerStore.test.ts

FILES TO MODIFY:

- frontend/vite.config.ts

DETAILED STEPS:

1. Create visualStateStore.test.ts
2. Test actions: setCursorPosition, setLayerDepth, setBlurIntensity
3. Test selector functions
4. Test state updates and persistence
5. Create appStateStore.test.ts
6. Test actions: setUser, setDashboard, login, logout
7. Test auth state changes
8. Create layerStore.test.ts
9. Test actions: setLayers, addLayer, updateLayer, removeLayer, reorderLayers
10. Test max 100 layers constraint
11. Test getLayersSorted selector
12. Ensure all tests pass
13. Target >80% coverage for store code

VALIDATION:
cd frontend && npm run build && npm run test:coverage

```

---

## Write API integration tests

**Context**
Test API endpoints with test database. Target >70% coverage.

### Universal Agent Prompt
```

ROLE: Expert QA/Backend Test Engineer

GOAL: Create integration tests for all API endpoints

CONTEXT: Test API endpoints with test database. Target >70% coverage.

FILES TO CREATE:

- backend/src/tests/api/auth.integration.test.ts
- backend/src/tests/api/dashboards.integration.test.ts
- backend/src/tests/api/widgets.integration.test.ts
- backend/src/tests/api/users.integration.test.ts
- backend/src/tests/api/errors.integration.test.ts
- backend/src/tests/setup.ts

FILES TO MODIFY:

- backend/package.json
- backend/tsconfig.json

DETAILED STEPS:

1. Add jest, ts-jest, @types/jest to package.json
2. Create test database setup in setup.ts (use TEST_DATABASE_URL)
3. Create auth.integration.test.ts: test login, invalid credentials, rate limiting
4. Create dashboards.integration.test.ts: test GET dashboards, 404, 403
5. Create widgets.integration.test.ts: test CRUD, data endpoint, docking
6. Create users.integration.test.ts: test profile, preferences updates
7. Create errors.integration.test.ts: test error envelope format, request IDs
8. Use test database isolation (transactions with rollback)
9. Clean up test data after each test
10. Ensure all tests pass
11. Target >70% coverage for API code

VALIDATION:
cd backend && npm run build && npm run test:integration

```

---

## Write E2E tests

**Context**
Playwright tests for critical user journeys: login, dashboard, layer navigation, docking, prism effect.

### Universal Agent Prompt
```

ROLE: Expert QA/E2E Test Engineer

GOAL: Create E2E tests with Playwright for critical journeys

CONTEXT: Playwright tests for critical user journeys: login, dashboard, layer navigation, docking, prism effect.

FILES TO CREATE:

- e2e/playwright.config.ts
- e2e/tests/login.spec.ts
- e2e/tests/dashboard.spec.ts
- e2e/tests/layerNavigation.spec.ts
- e2e/tests/widgetDocking.spec.ts
- e2e/tests/prismEffect.spec.ts
- e2e/tests/performanceMode.spec.ts

FILES TO MODIFY:

- package.json

DETAILED STEPS:

1. Add @playwright/test to root package.json devDependencies
2. Create playwright.config.ts with baseURL and test config
3. Create login.spec.ts: test valid login, invalid login, logout
4. Create dashboard.spec.ts: test dashboard load, widgets display
5. Create layerNavigation.spec.ts: test layer transitions, depth changes
6. Create widgetDocking.spec.ts: test drag widget, dock to surface, undock
7. Create prismEffect.spec.ts: test hover composite widget, constituents display
8. Create performanceMode.spec.ts: test performance mode toggle, blur changes
9. Use page object model pattern for reusable actions
10. Add assertions for UI elements, API responses
11. Ensure all tests pass in headless mode

VALIDATION:
npm run test:e2e

```

---

## Set up CI/CD pipeline

**Context**
Configure GitHub Actions workflow for automated testing and deployment.

### Universal Agent Prompt
```

ROLE: Expert DevOps/CI-CD Engineer

GOAL: Create GitHub Actions workflow with test and build

CONTEXT: Configure GitHub Actions workflow for automated testing and deployment.

FILES TO CREATE:

- .github/workflows/ci.yml
- .github/workflows/deploy-staging.yml
- docker/Dockerfile.frontend
- docker/Dockerfile.backend
- docker-compose.yml

FILES TO MODIFY:

- frontend/package.json
- backend/package.json

DETAILED STEPS:

1. Create .github/workflows/ci.yml
2. Trigger on push and pull_request to main
3. Jobs: lint, typecheck, test-frontend, test-backend, e2e
4. Lint step: run ESLint on both packages
5. Typecheck step: run tsc --noEmit on both packages
6. Test frontend: npm run test:coverage
7. Test backend: npm run test:integration
8. Build verification: npm run build on both packages
9. Create .github/workflows/deploy-staging.yml
10. Trigger on merge to main
11. Build Docker images, deploy to staging
12. Create docker/Dockerfile.frontend with multi-stage build
13. Create docker/Dockerfile.backend with multi-stage build
14. Create docker-compose.yml for local development
15. Add scripts to package.json for Docker operations

VALIDATION:
cd frontend && npm run build && cd ../backend && npm run build
