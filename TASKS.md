# TASKS

# Tasks Plan — Aurora

## 📌 Global Assumptions

- Solo developer working full-time
- PostgreSQL database available locally and in production
- Node.js 18+ and React 18+ as baseline versions
- Target browsers: Chrome 100+, Firefox 100+, Safari 16+
- WebGL2 support assumed for target browsers
- JWT secret managed via environment variable
- CORS configured for localhost in development

## ⚠️ Risks

- WebGL performance may vary significantly across devices
- Complex 3D transitions may cause motion sickness for some users
- Widget docking could clutter surface layer if overused
- Materialized view refresh may cause brief data inconsistencies
- Z-axis navigation may have accessibility limitations

## 🧩 Epics

## Foundation & Backend API

**Goal:** Set up project infrastructure and implement core REST API with authentication

### ✅ Initialize repository and tooling (2)

Create monorepo structure with separate frontend and backend packages. Configure TypeScript, ESLint, Prettier, and Git hooks.

**Acceptance Criteria**

- Repository has /frontend and /backend directories
- TypeScript compiles in both packages
- ESLint and Prettier configured with shared config
- Pre-commit hooks run linting

**Dependencies**
_None_

### ✅ Set up PostgreSQL schema (3)

Create database migrations for users, user_preferences, dashboards, layers, widgets, widget_data, and sessions tables with proper constraints

**Acceptance Criteria**

- All 7 tables created with correct columns and types
- Foreign key constraints defined
- Indexes on user_preferences(user_id), layers(dashboard_id, z_index), widget_data(widget_id, timestamp)
- Migration files versioned and runnable

**Dependencies**

- Initialize repository and tooling

### ✅ Implement authentication endpoints (3)

Create POST /api/auth/login with bcrypt password hashing and JWT token generation

**Acceptance Criteria**

- Login endpoint validates credentials
- Passwords hashed with bcrypt cost factor 12
- JWT tokens with 24hr expiration returned
- Rate limited to 5 requests/minute per IP
- Tests cover valid and invalid login scenarios

**Dependencies**

- Set up PostgreSQL schema

### ✅ Build auth middleware (2)

Create JWT verification middleware for protected routes

**Acceptance Criteria**

- Valid tokens pass through middleware
- Invalid/expired tokens return 401
- User ID attached to request object
- Unit tests for all auth states

**Dependencies**

- Implement authentication endpoints

### ✅ Implement dashboard endpoints (3)

Create GET /api/dashboards/:id and GET /api/dashboards/:id/layers

**Acceptance Criteria**

- GET /api/dashboards/:id returns dashboard with layers and widgets
- Query params includeWidgets and layerDepth work correctly
- 404 for non-existent dashboards
- 403 for unauthorized access
- GET /api/dashboards/:id/layers returns layer stack

**Dependencies**

- Build auth middleware

### ✅ Implement widget CRUD endpoints (4)

Create POST, PATCH, DELETE for widgets and GET /api/widgets/:id/data

**Acceptance Criteria**

- POST creates widget with valid type and config
- PATCH /api/widgets/:id/docking updates isDocked state
- DELETE removes widget and returns confirmation
- GET /api/widgets/:id/data returns value, trend, constituents, historical
- TimeRange query parameter filters data correctly

**Dependencies**

- Implement dashboard endpoints

### ✅ Implement user preference endpoints (2)

Create GET /api/users/me and PATCH /api/users/me/preferences

**Acceptance Criteria**

- GET returns user profile with preferences
- PATCH updates maxBlurIntensity and performanceMode
- Invalid preference values return 400
- Updates persist to database

**Dependencies**

- Build auth middleware

### ✅ Add error handling middleware (2)

Implement global error handler with standardized error envelope

**Acceptance Criteria**

- All errors return { error: { code, message, details } } format
- 500 errors return generic message
- Request ID included in all error responses
- Errors logged with correlation IDs

**Dependencies**

- Implement authentication endpoints

### ✅ Add logging and observability (3)

Implement structured JSON logging with Winston and metrics collection

**Acceptance Criteria**

- Winston logs JSON with timestamp, level, userId, requestId
- X-Request-ID header propagated through all requests
- api_request_duration_seconds histogram metric
- Critical operations include timing spans

**Dependencies**

- Add error handling middleware

## Frontend Foundation

**Goal:** Set up React app with routing, state management, and API client

### ✅ Bootstrap React application (2)

Create React app with Vite, configure Tailwind CSS, and set up routing

**Acceptance Criteria**

- Vite dev server runs without errors
- Tailwind CSS configured with custom theme
- React Router set up with login and dashboard routes
- Base layout component with navigation

**Dependencies**
_None_

### ✅ Implement Zustand stores (3)

Create visual state store for cursor, layer depth and app state context

**Acceptance Criteria**

- IZVisualStateStore with cursor position, layerDepth, blurIntensity
- IAppStateContext with user, dashboard, auth state
- Performance-aware blur intensity adjustment logic
- Stores typed with TypeScript

**Dependencies**

- Bootstrap React application

### ✅ Build API client (3)

Create HTTP client with JWT auth, interceptors, and caching

**Acceptance Criteria**

- ApiClient with base URL and timeout
- JWT attached to all requests via Authorization header
- 401 responses trigger logout
- Widget data cached with 30-second TTL
- Retry logic for failed requests

**Dependencies**

- Implement Zustand stores

### ✅ Create auth context and login flow (3)

Implement authentication context, login page, and protected routes

**Acceptance Criteria**

- AuthProvider context with token storage
- Login form with email/password validation
- Successful login stores token and redirects
- Protected routes redirect to login if unauthenticated
- Logout clears token and redirects

**Dependencies**

- Build API client

### ✅ Implement error boundary (2)

Create React error boundary with fallback UI

**Acceptance Criteria**

- ErrorBoundary wraps entire app
- Errors caught and logged to /api/errors
- Fallback UI displayed with retry option
- Error details captured in development

**Dependencies**

- Create auth context and login flow

## Z-Engine & WebGL Foundation

**Goal:** Implement React Three Fiber canvas and glassmorphism shader system

### ✅ Set up React Three Fiber canvas (3)

Initialize R3F canvas with camera, lighting, and basic scene

**Acceptance Criteria**

- R3F Canvas component renders without errors
- Orthographic camera configured for 2.5D view
- Ambient and directional lights added
- Canvas responsive to window resize
- Performance monitoring with stats panel in dev

**Dependencies**

- Bootstrap React application

### ✅ Create glassmorphism shader (4)

Write custom shader material for frosted glass effect with dynamic blur

**Acceptance Criteria**

- Custom shader material with transparency and blur
- Opacity uniform controls glass transparency
- BlurIntensity uniform controls blur amount
- Shader compiled and applied to test mesh
- Performance test maintains 60fps

**Dependencies**

- Set up React Three Fiber canvas

### ✅ Implement GPU capability detection (3)

Detect GPU capabilities and adjust blur intensity accordingly

**Acceptance Criteria**

- GPU capability detected via getMaxAnisotropy()
- High-end GPUs use full blur
- Low-end GPUs fallback to CSS backdrop-filter
- Performance preference overrides auto-detection
- Detection runs on app initialization

**Dependencies**

- Create glassmorphism shader

### ✅ Add noise generation for gradient banding (3)

Implement real-time background noise to prevent color banding

**Acceptance Criteria**

- Noise texture generated procedurally
- Applied as overlay to glass layers
- Intensity adjustable via uniform
- Performance impact minimal
- Banding eliminated on gradient layers

**Dependencies**

- Create glassmorphism shader

### ✅ Implement contextual lighting (3)

Create cursor-following light source with dynamic shadows

**Acceptance Criteria**

- Virtual light source tracks cursor position
- Shadows shift based on cursor position
- Lighting effect reinforces depth perception
- Position tracked in Zustand store
- Performance: debounced updates at 60fps

**Dependencies**

- Set up React Three Fiber canvas

## Z-Axis Navigation

**Goal:** Implement layer stacking and Z-axis navigation with transitions

### ✅ Create Z-layer data structure (2)

Define IZLayer interface and layer management system

**Acceptance Criteria**

- IZLayer interface with id, zIndex, opacity, blurIntensity, widgets
- LayerStore in Zustand for layer state
- Layers sortable by zIndex
- Max 100 layers per dashboard constraint
- Type safety throughout

**Dependencies**

- Implement Zustand stores

### ✅ Render layered glass panes (4)

Create 3D plane components for each layer with glass material

**Acceptance Criteria**

- Each layer renders as 3D plane with glass shader
- Z-position determined by zIndex
- Opacity varies by depth (foreground clear, background faint)
- Blur increases with depth
- Layers fetch data from API on mount

**Dependencies**

- Create Z-layer data structure
- Create glassmorphism shader

### ✅ Implement layer transition animation (4)

Animate camera movement when navigating between layers

**Acceptance Criteria**

- Clicking widget triggers layer lift animation
- Camera moves to reveal underlying layer
- Parent layer blurs during transition
- Animation duration 300ms
- Smooth easing function applied
- Transition cancellable on rapid clicks

**Dependencies**

- Render layered glass panes

### ✅ Add depth-based opacity calculation (2)

Calculate layer opacity based on distance from camera

**Acceptance Criteria**

- Foreground layer opacity: 0.9-1.0
- Mid-ground layer opacity: 0.5-0.7
- Background layer opacity: 0.1-0.3
- Opacity updates during layer transitions
- Formula: opacity = 1 - (depth / maxDepth) * 0.7

**Dependencies**

- Implement layer transition animation

### ✅ Implement layer lazy-loading (3)

Fetch data only for visible layer and adjacent layers

**Acceptance Criteria**

- Visible layer data fetched on mount
- Adjacent layers (±1 Z) prefetched
- Deep layers (Z > current+2) not fetched
- Fetched data cached in store
- Cache invalidation after 30 seconds

**Dependencies**

- Add depth-based opacity calculation

## Widget System

**Goal:** Implement widget rendering, data display, and prism effect

### ✅ Create widget component structure (4)

Build base widget component with metric, chart, and composite variants

**Acceptance Criteria**

- BaseWidget component with common props
- MetricWidget displays single value with trend
- ChartWidget displays line/bar chart
- CompositeWidget displays aggregated value
- All widgets use React.memo for performance
- Widgets render on 3D planes as HTML overlays

**Dependencies**

- Render layered glass panes

### ✅ Implement widget data fetching (3)

Fetch and cache widget data from API

**Acceptance Criteria**

- useWidgetData hook for data fetching
- TimeRange parameter defaults to 7d
- Loading and error states handled
- Data cached in API client
- Refetch on interval (5 minutes)
- Constituents data included for composites

**Dependencies**

- Create widget component structure

### ✅ Add prism effect for composite widgets (4)

Refract composite metrics into constituent parts on hover

**Acceptance Criteria**

- Hover on composite widget triggers prism effect
- Constituents displayed as expanding cards
- Each constituent shows name, value, weight
- Animation mimics light refraction
- 100ms debounce on hover events
- Effect contained within widget bounds

**Dependencies**

- Implement widget data fetching

### ✅ Create trend visualization (2)

Display trend indicators and sparklines for metrics

**Acceptance Criteria**

- Trend arrow shows direction (up/down/flat)
- Trend color coded (green/red/neutral)
- Sparkline chart for historical data
- Trend percentage displayed
- Accessible labels for screen readers

**Dependencies**

- Implement widget data fetching

### ✅ Add widget CRUD UI (3)

Create interface for creating and deleting widgets

**Acceptance Criteria**

- Add widget button opens creation modal
- Widget type selector (metric/chart/composite)
- Form validates title and config
- Create button calls POST /api/widgets
- Delete button on widget with confirmation
- Delete calls DELETE /api/widgets/:id

**Dependencies**

- Create widget component structure

## Widget Docking

**Goal:** Implement drag-and-drop widget docking to surface layer

### ✅ Add drag-and-drop capability (4)

Enable widgets to be dragged within and between layers

**Acceptance Criteria**

- Widgets draggable via drag handle
- Visual feedback on drag start
- Position updates in real-time
- Drag constrained to layer bounds
- Touch devices supported

**Dependencies**

- Create widget component structure

### ✅ Create docking zone on surface layer (3)

Define droppable area on top layer for docked widgets

**Acceptance Criteria**

- Surface layer has designated docking zone
- Zone highlights when dragging widget
- Visual indicator shows valid drop targets
- Zone size configurable
- Max 10 docked widgets limit enforced

**Dependencies**

- Add drag-and-drop capability

### ✅ Implement docking persistence (3)

Save and restore widget docking state via API

**Acceptance Criteria**

- Drop in docking zone calls PATCH /api/widgets/:id/docking
- isDocked set to true on dock
- targetLayerId and position saved
- Docked widgets persist across refresh
- Undock widget returns to original layer
- Error handling for failed requests

**Dependencies**

- Create docking zone on surface layer

### ✅ Animate dock and undock transitions (3)

Smooth animations when widgets move between layers

**Acceptance Criteria**

- Widget animates to dock position on drop
- Undock animates widget back to original layer
- Animation duration 200ms
- Opacity transition during layer change
- Animation cancellable on new actions

**Dependencies**

- Implement docking persistence

## Performance & Polish

**Goal:** Optimize rendering, add caching, and polish UX

### ✅ Implement materialized view for KPI caching (3)

Create PostgreSQL materialized view for widget aggregations

**Acceptance Criteria**

- Materialized view created for KPI aggregations
- View refreshed every 5 minutes via cron
- Widget data queries use materialized view
- Cache hit rate monitored
- Fallback to raw query if view stale

**Dependencies**

- Implement dashboard endpoints

### ✅ Optimize WebGL rendering (4)

Ensure 60fps target with frame budget monitoring

**Acceptance Criteria**

- Frame duration monitored via performance.now()
- webgl_frame_duration_ms metric emitted
- Frame budget alerts when >16ms
- R3F render loop optimized
- Unnecessary re-renders eliminated

**Dependencies**

- Add contextual lighting

### ✅ Add request debouncing and throttling (2)

Implement debouncing for high-frequency events

**Acceptance Criteria**

- Prism effect hover debounced 100ms
- Layer transition throttled to 1 per 300ms
- Cursor position updates throttled to 60fps
- API calls for position updates batched
- Debounce/throttle values configurable

**Dependencies**

- Implement layer transition animation

### ✅ Implement bundle optimization (3)

Code splitting and lazy loading for performance

**Acceptance Criteria**

- Shaders loaded in separate bundle
- Heavy widgets lazy-loaded
- Route-based code splitting
- Bundle size <500KB gzipped
- Load time <2s on 3G

**Dependencies**

- Optimize WebGL rendering

### ✅ Add loading states and skeletons (3)

Improve perceived performance with loading UI

**Acceptance Criteria**

- Skeleton screens for widgets while loading
- Progressive loading for deep layers
- Spinners for API calls >500ms
- Error states with retry buttons
- Empty states for no-data scenarios

**Dependencies**

- Implement layer lazy-loading

### ✅ Implement accessibility features (4)

Add keyboard navigation and screen reader support

**Acceptance Criteria**

- Tab navigation through widgets
- Arrow keys for Z-axis layer navigation
- ARIA labels on all interactive elements
- Focus indicators visible
- Screen reader announces layer changes
- Fallback 2D view for motion sensitivity

**Dependencies**

- Add loading states and skeletons

## Testing & Quality

**Goal:** Comprehensive test coverage and CI/CD setup

### ✅ Write unit tests for widgets (4)

Test widget components with React Testing Library

**Acceptance Criteria**

- MetricWidget tests for render and props
- ChartWidget tests for data display
- CompositeWidget tests for prism effect
- Widget hooks tests
- Coverage >80% for widget code

**Dependencies**

- Create widget component structure

### ✅ Write unit tests for Zustand stores (3)

Test state management actions and updates

**Acceptance Criteria**

- Visual state store tests
- App state context tests
- Action tests for all state updates
- Selector tests
- Coverage >80% for store code

**Dependencies**

- Implement Zustand stores

### ✅ Write API integration tests (4)

Test API endpoints with test database

**Acceptance Criteria**

- Auth endpoint tests
- Dashboard endpoint tests
- Widget endpoint tests
- User preference tests
- Error response tests
- Coverage >70% for API code

**Dependencies**

- Implement widget CRUD endpoints

### ✅ Write E2E tests (5)

Playwright tests for critical user journeys

**Acceptance Criteria**

- Login flow test
- Dashboard load test
- Layer navigation test
- Widget docking test
- Prism effect test
- Performance mode test

**Dependencies**

- Implement accessibility features

### ✅ Set up CI/CD pipeline (3)

Configure automated testing and deployment

**Acceptance Criteria**

- GitHub Actions workflow defined
- Tests run on PR
- Linting and type checking enforced
- Build verification passes
- Deployment to staging on merge

**Dependencies**

- Write E2E tests

## ❓ Open Questions

- Maximum number of layers per dashboard
- Undo/redo functionality for widget operations
- WebSocket support for real-time data updates
- Accessibility fallback strategy for Z-axis navigation
- Maximum docked widgets on surface layer
