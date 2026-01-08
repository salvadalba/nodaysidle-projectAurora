# TRD

# Technical Requirements Document

## 🧭 System Context

Aurora is a spatial SaaS dashboard featuring a Z-axis navigation engine built with React, React Three Fiber for WebGL rendering, and a Node.js/Express REST API backend with PostgreSQL data persistence. The system uses glassmorphic UI patterns where depth and opacity convey information hierarchy.

## 🔌 API Contracts

### GetDashboard

- **Method:** GET
- **Path:** /api/dashboards/:dashboardId
- **Auth:** Bearer JWT
- **Request:** Query params: ?includeWidgets=true&layerDepth=max
- **Response:** { "id": "uuid", "name": "string", "layers": [{ "id": "uuid", "zIndex": "number", "opacity": "number", "widgets": [] }], "updatedAt": "ISO8601" }
- **Errors:**
- 401: Invalid or expired token
- 403: User not authorized for this dashboard
- 404: Dashboard not found

### GetWidgets

- **Method:** GET
- **Path:** /api/dashboards/:dashboardId/widgets
- **Auth:** Bearer JWT
- **Request:** Query params: ?layerId=:layerId&docked=true|false
- **Response:** { "widgets": [{ "id": "uuid", "type": "metric|chart|composite", "title": "string", "layerId": "uuid", "zIndex": "number", "isDocked": "boolean", "config": {}, "data": {} }] }
- **Errors:**
- 401: Invalid or expired token
- 404: Dashboard not found

### GetWidgetData

- **Method:** GET
- **Path:** /api/widgets/:widgetId/data
- **Auth:** Bearer JWT
- **Request:** Query params: ?timeRange=7d|30d|90d&includeConstituents=true
- **Response:** { "widgetId": "uuid", "value": "number|string", "trend": "number", "constituents": [{ "name": "string", "value": "number", "weight": "number" }], "historical": [{ "timestamp": "ISO8601", "value": "number" }] }
- **Errors:**
- 401: Invalid or expired token
- 404: Widget not found
- 400: Invalid timeRange parameter

### UpdateWidgetDocking

- **Method:** PATCH
- **Path:** /api/widgets/:widgetId/docking
- **Auth:** Bearer JWT
- **Request:** { "isDocked": "boolean", "targetLayerId": "uuid", "position": { "x": "number", "y": "number" } }
- **Response:** { "id": "uuid", "isDocked": "boolean", "layerId": "uuid", "position": { "x": "number", "y": "number" }, "updatedAt": "ISO8601" }
- **Errors:**
- 401: Invalid or expired token
- 403: User not authorized for this widget
- 404: Widget not found
- 400: Invalid target layer or position

### GetLayerStack

- **Method:** GET
- **Path:** /api/dashboards/:dashboardId/layers
- **Auth:** Bearer JWT
- **Request:**
- **Response:** { "layers": [{ "id": "uuid", "name": "string", "zIndex": "number", "opacity": "number", "blurIntensity": "number", "widgetCount": "number" }] }
- **Errors:**
- 401: Invalid or expired token
- 404: Dashboard not found

### CreateWidget

- **Method:** POST
- **Path:** /api/dashboards/:dashboardId/widgets
- **Auth:** Bearer JWT
- **Request:** { "type": "metric|chart|composite", "title": "string", "layerId": "uuid", "config": {}, "dataSource": "string" }
- **Response:** { "id": "uuid", "type": "string", "title": "string", "layerId": "uuid", "zIndex": "number", "isDocked": "false", "createdAt": "ISO8601" }
- **Errors:**
- 401: Invalid or expired token
- 400: Invalid widget type or configuration
- 404: Dashboard or layer not found

### DeleteWidget

- **Method:** DELETE
- **Path:** /api/widgets/:widgetId
- **Auth:** Bearer JWT
- **Request:**
- **Response:** { "id": "uuid", "deleted": "true" }
- **Errors:**
- 401: Invalid or expired token
- 403: User not authorized for this widget
- 404: Widget not found

### Login

- **Method:** POST
- **Path:** /api/auth/login
- **Auth:** None
- **Request:** { "email": "string", "password": "string" }
- **Response:** { "token": "JWT", "user": { "id": "uuid", "name": "string", "email": "string", "preferences": {} } }
- **Errors:**
- 400: Missing email or password
- 401: Invalid credentials

### GetUserProfile

- **Method:** GET
- **Path:** /api/users/me
- **Auth:** Bearer JWT
- **Request:**
- **Response:** { "id": "uuid", "name": "string", "email": "string", "preferences": { "maxBlurIntensity": "number", "performanceMode": "auto|high|low" }, "defaultDashboardId": "uuid" }
- **Errors:**
- 401: Invalid or expired token

### UpdateUserPreferences

- **Method:** PATCH
- **Path:** /api/users/me/preferences
- **Auth:** Bearer JWT
- **Request:** { "maxBlurIntensity": "number", "performanceMode": "auto|high|low" }
- **Response:** { "id": "uuid", "preferences": { "maxBlurIntensity": "number", "performanceMode": "string" } }
- **Errors:**
- 401: Invalid or expired token
- 400: Invalid preference values

## 🧱 Modules

### frontend-app

- **Responsibilities:**
- React application bootstrap and routing
- Authentication context and session management
- Error boundary and global error handling
- **Interfaces:**
- IRouter
- IAuthProvider
- IErrorBoundary
- **Depends on:**
- frontend-z-engine
- api-client

### frontend-z-engine

- **Responsibilities:**
- Z-axis navigation and layer transitions
- WebGL canvas management via React Three Fiber
- Glassmorphism shader rendering and effects
- Depth-based blur and opacity calculations
- Cursor position tracking and contextual lighting
- **Interfaces:**
- IZLayer
- IZNavigationController
- IGlassMaterial
- ILightSource
- **Depends on:**
- frontend-state

### frontend-widgets

- **Responsibilities:**
- Widget component rendering (metric, chart, composite)
- Prism effect for composite metric refraction
- Drag-and-drop docking functionality
- Widget data fetching and caching
- **Interfaces:**
- IWidget
- IWidgetDockingHandler
- IPrismEffect
- **Depends on:**
- frontend-z-engine
- frontend-state
- api-client

### frontend-state

- **Responsibilities:**
- Zustand store for transient visual state (cursor, layer depth)
- React Context for application state (user, dashboard)
- Performance-aware blur intensity adjustments
- **Interfaces:**
- IVisualStateStore
- IAppStateContext
- **Depends on:**
_None_

### api-client

- **Responsibilities:**
- HTTP client with JWT authentication
- Request/response interceptors
- Retry logic and error handling
- Response caching for widget data
- **Interfaces:**
- IApiClient
- IAuthService
- IDashboardService
- IWidgetService
- **Depends on:**
_None_

### backend-api

- **Responsibilities:**
- Express server setup and middleware
- JWT authentication and authorization
- Request validation and error handling
- CORS and security headers
- **Interfaces:**
- IServer
- IAuthMiddleware
- IErrorHandler
- **Depends on:**
- backend-services
- backend-database

### backend-services

- **Responsibilities:**
- Dashboard data aggregation and hierarchical queries
- User session and preference management
- Widget configuration and docking state persistence
- KPI data calculation with constituent breakdown
- **Interfaces:**
- IDashboardService
- IUserService
- IWidgetService
- IDataService
- **Depends on:**
- backend-database

### backend-database

- **Responsibilities:**
- PostgreSQL connection pooling
- Query execution and transaction management
- Migration application on startup
- Materialized view refresh for KPI caching
- **Interfaces:**
- IDatabase
- IQueryBuilder
- IMigrationRunner
- **Depends on:**
_None_

## 🗃 Data Model Notes

- users table: id (uuid, PK), email (unique), password_hash, name, created_at
- user_preferences table: user_id (FK), max_blur_intensity, performance_mode, default_dashboard_id, stored as JSONB for flexibility
- dashboards table: id (uuid, PK), owner_id (FK users), name, created_at, updated_at
- layers table: id (uuid, PK), dashboard_id (FK), z_index (unique per dashboard), opacity, blur_intensity, name
- widgets table: id (uuid, PK), layer_id (FK), dashboard_id (FK), type (metric|chart|composite), title, config (JSONB), data_source (JSONB), is_docked, docked_layer_id, docked_position (JSONB)
- widget_data table: widget_id (FK), timestamp, value, constituents (JSONB), indexed for time-series queries
- sessions table: id (uuid, PK), user_id (FK), token_hash, expires_at
- Composite widget constituents stored as JSONB array: [{name, value, weight, source_table}]
- Materialized view for KPI aggregations refreshed every 5 minutes

## 🔐 Validation & Security

- JWT tokens with 24-hour expiration and refresh token flow
- Password hashing using bcrypt with cost factor 12
- Rate limiting on auth endpoints: 5 requests per minute per IP
- Input validation using Joi schemas for all API requests
- SQL injection prevention via parameterized queries only
- CORS restricted to specific origins in production
- Content Security Policy headers for WebGL resources
- Widget config JSONB validated against type-specific schemas
- Z-index values constrained per dashboard (0-100 range)

## 🧯 Error Handling Strategy

Standardized error envelope: { error: { code: string, message: string, details: {} } }. Client-side error boundary catches React errors and displays fallback UI. API errors logged with correlation IDs. 500 errors return generic message to client.

## 🔭 Observability

- **Logging:** Structured JSON logging via Winston on backend (timestamp, level, userId, requestId, message). Client-side errors sent to /api/errors endpoint.
- **Tracing:** Request ID propagated from client via X-Request-ID header. All backend logs include request ID. Critical operations (widget queries, auth) include timing spans.
- **Metrics:**
- api_request_duration_seconds (histogram, labeled by endpoint, status)
- widget_data_cache_hit_rate (gauge)
- webgl_frame_duration_ms (histogram, client-reported)
- active_layer_depth (gauge, average user navigation depth)
- dock_widget_events_total (counter)

## ⚡ Performance Notes

- Target 60fps WebGL rendering: frame budget ~16ms, monitor via performance.now() in R3F loop
- Adaptive blur: detect GPU capability via renderer.capabilities.getMaxAnisotropy(), fallback to CSS backdrop-filter
- Widget data API responses cached in browser with 30-second TTL
- PostgreSQL materialized views for KPI aggregations refreshed every 5 minutes
- Connection pooling: pg.Pool with max 20 clients, 5 min idle timeout
- Debounce prism effect hover events by 100ms to avoid excessive re-renders
- Lazy-load layer data: only fetch visible layer + adjacent layers in Z-stack
- Bundle shaders separately and load asynchronously
- Use React.memo for widget components to prevent unnecessary re-renders during layer transitions

## 🧪 Testing Strategy

### Unit

- Widget component rendering with React Testing Library
- Zustand store actions and state updates
- API client request/response handling with MSW
- Shader validation logic and GPU capability detection

### Integration

- Layer transition animations with mocked R3F canvas
- Widget docking API flow (client request to DB persistence)
- Auth login flow (credentials to JWT to protected request)
- Composite widget constituent data aggregation

### E2E

- Complete user journey: login → view dashboard → navigate layers → dock widget → logout
- Prism effect hover on composite metric displays constituents
- Performance mode switching adjusts blur intensity
- Widget CRUD operations persist across page refresh

## 🚀 Rollout Plan

- Phase 1: Implement backend API with stub endpoints and basic auth, deploy to staging
- Phase 2: Create React app with basic widget rendering (no Z-axis), verify API integration
- Phase 3: Implement R3F canvas and single-layer glassmorphism with adaptive blur
- Phase 4: Add Z-axis navigation engine with 2-3 layers, implement layer transitions
- Phase 5: Implement prism effect for composite widgets
- Phase 6: Add widget docking functionality with drag-and-drop
- Phase 7: Performance optimization, caching, materialized views
- Phase 8: Beta deployment to limited users with monitoring and feedback collection

## ❓ Open Questions

- Maximum number of layers allowed per dashboard (performance vs depth trade-off)?
- How should widget configurations be versioned for undo/redo functionality?
- Should real-time data updates be supported via WebSockets or polling?
- Accessibility fallback for keyboard-only navigation in Z-axis interface?
- Maximum number of docked widgets allowed on surface layer?
