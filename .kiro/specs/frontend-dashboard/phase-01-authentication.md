# Phase 1: Project Setup and Authentication (Week 1)

[← Back to Overview](./00-overview.md) | [Next: Phase 2 →](./phase-02-layout-dashboard.md)

## Prerequisites

✅ **No prerequisites** - This is the first phase

## Phase Status

- **Dependencies:** None
- **Can Start:** Yes
- **Blocks:** Phase 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13

## Tasks

- [ ] 1.1 Initialize Vite + React + TypeScript project with strict mode
  - Create new directory `frontend/` at repository root (same level as AlgotradingBot/)
  - Initialize Vite project with React-TS template inside `frontend/` directory
  - Configure TypeScript with strict mode enabled
  - Set up project directory structure (features, components, hooks, services, utils, types)
  - Install core dependencies: React 18+, React Router v7, Redux Toolkit, RTK Query
  - Configure path aliases in tsconfig.json and vite.config.ts
  - Update root .gitignore to include frontend/node_modules and frontend/dist
  - _Requirements: 26.1, 26.2, 28.2_
  - **Note:** Frontend will be in `frontend/` folder, backend in `AlgotradingBot/` folder within same repository

- [ ] 1.2 Configure code quality tools (ESLint, Prettier, Vitest)
  - Install and configure ESLint with Airbnb React config
  - Install and configure Prettier with consistent formatting rules
  - Set up Vitest as test runner with React Testing Library
  - Configure test setup file with global mocks and utilities
  - Add pre-commit hooks with Husky and lint-staged
  - _Requirements: 26.9, 28.1_

- [ ] 1.3 Set up Redux store with RTK Query base configuration
  - Create Redux store with configureStore
  - Implement base query with environment injection middleware
  - Configure RTK Query with retry logic and error handling
  - Set up Redux DevTools integration
  - Create root reducer combining all slices
  - _Requirements: 23.1, 23.2_

- [x] 1.4 Implement authentication state slice and API
  - Create authSlice with login, logout, setToken, and session management actions
  - Implement authApi with login, logout, refresh, and getMe endpoints
  - Add token storage in memory and session storage
  - Implement automatic token refresh on 401 errors
  - Add session timeout logic (30 minutes inactivity)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 1.5 Create login page with form validation
  - Build LoginPage component with username, password, and "remember me" fields
  - Implement form validation using Zod schema
  - Add loading states and error display
  - Handle successful login with redirect to dashboard
  - Style with Material-UI components
  - _Requirements: 1.1, 1.2_

- [x] 1.6 Implement protected route component with role-based access
  - Create ProtectedRoute wrapper component
  - Check authentication status and redirect to login if needed
  - Implement role-based access control (admin vs trader)
  - Add loading state while checking auth
  - _Requirements: 24.7, 24.8_

- [x] 1.7 Set up error boundary for React error handling
  - Create ErrorBoundary class component
  - Implement getDerivedStateFromError and componentDidCatch
  - Create ErrorFallback UI with reload button
  - Integrate with error tracking service (Sentry placeholder)
  - Wrap app and route-level components with error boundaries
  - _Requirements: 18.8, 27.2_

- [x] 1.8 Configure environment variables and API client
  - Set up .env files for development and production
  - Configure VITE_API_BASE_URL and VITE_WS_URL variables
  - Create Axios instance with base configuration
  - Add request/response interceptors for auth tokens
  - Implement automatic token refresh interceptor
  - _Requirements: 26.3, 26.4, 24.2_

- [x] 1.9 Write unit tests for auth slice and components
  - Test authSlice reducers (login, logout, setToken)
  - Test LoginPage component rendering and form submission
  - Test ProtectedRoute redirect logic
  - Test ErrorBoundary error catching
  - Achieve 80%+ coverage for auth module
  - _Requirements: 25.1, 25.2, 25.4_

- [x] 1.10 Write property test for authentication token inclusion
  - **Property 1: Authentication Token Inclusion**
  - **Validates: Requirements 1.4, 24.2**
  - Test that all authenticated API requests include token in Authorization header
  - Use fast-check with 100+ iterations testing random tokens and endpoints
  - _Requirements: 30.1, 30.9_

- [x] 1.11 Write integration tests for authentication flow
  - Test login with valid credentials stores token and redirects
  - Test login with invalid credentials shows error
  - Test token refresh on 401 error
  - Test logout clears session and redirects to login
  - Use MSW to mock backend responses
  - _Requirements: 30.3_

- [x] 1.12 Checkpoint - Verify authentication module complete
  - Ensure all tests pass (unit, property, integration)
  - Verify login/logout flow works end-to-end
  - Check code coverage meets 80% threshold

- [x] 1.13 Phase 1 Verification - Build, Run, and Test Application
  - Stop all running services using `.\stop-all.ps1`
  - Build both backend and frontend using `.\build-all.ps1`
  - Verify builds complete successfully without errors
  - Start all services using `.\run-all.ps1`
  - Verify backend is accessible at http://localhost:8080
  - Verify frontend is accessible at http://localhost:5173
  - Verify Swagger UI works at http://localhost:8080/swagger-ui.html
  - Test authentication endpoints via Swagger or curl
  - If any issues found, diagnose and repair immediately
  - Once all verification passes, commit to git:
    - `git add .`
    - `git commit -m "feat: Phase 1 - Authentication module complete"`
    - `git push origin main` (or your branch)
  - Do not proceed to Phase 2 until all verification passes and code is committed
  - _Requirements: 26.8, 26.9, 26.10_

- [x] 1.14 Backend - Implement Authentication API Endpoints
  - **Location:** `AlgotradingBot/src/main/java/com/algotrader/bot/`
  - Create `controller/AuthController.java` with REST endpoints
  - Implement POST `/api/auth/login` endpoint accepting username/password, returning JWT token
  - Implement POST `/api/auth/logout` endpoint to invalidate tokens
  - Implement POST `/api/auth/refresh` endpoint to refresh expired tokens
  - Implement GET `/api/auth/me` endpoint to get current user info
  - Create `entity/User.java` JPA entity with id, username, passwordHash, email, role (ADMIN/TRADER)
  - Create `repository/UserRepository.java` extending JpaRepository
  - Create `service/AuthService.java` with authentication logic
  - Implement JWT token generation and validation using `io.jsonwebtoken:jjwt`
  - Add password hashing with BCrypt
  - Create `security/JwtAuthenticationFilter.java` to validate tokens on requests
  - Configure Spring Security in `config/SecurityConfig.java`
  - Add authentication endpoints to OpenAPI documentation
  - Write unit tests for AuthService (token generation, validation, user authentication)
  - Write integration tests for AuthController endpoints
  - Test with Postman or curl to verify login/logout/refresh flows
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 24.2_
  - **Dependencies:** Add to `build.gradle.kts`:
    - `implementation("org.springframework.boot:spring-boot-starter-security")`
    - `implementation("io.jsonwebtoken:jjwt-api:0.12.3")`
    - `runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.3")`
    - `runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.3")`

## Phase Complete

Once all tasks are complete and verification passes:
- ✅ Authentication module implemented
- ✅ All tests passing (unit, property, integration)
- ✅ Code coverage ≥ 80%
- ✅ Build, run, test cycle successful
- ✅ Changes committed to git

**Next:** [Phase 2: Core Layout and Dashboard](./phase-02-layout-dashboard.md)


