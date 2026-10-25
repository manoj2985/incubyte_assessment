# AI Conversation & Prompt Log

Raw prompts and responses from the development session for the Roadline Car Dealership Inventory System. Follows strict TDD (Red-Green-Refactor) and clean architecture with Git co-authorship.

---

### Prompt 1: Project Kickoff & Architecture

**Developer**
> We're building a car dealership inventory system with an Express API, MySQL via Prisma, and a React + Tailwind frontend. Strict requirement: follow TDD (Red-Green-Refactor).
>
> Requirements:
> - User auth with JWT (Customer vs Admin roles)
> - Endpoints: register/login, vehicle CRUD, search (make, model, category, price range), purchase (decrements stock), restock (admin only)
> - Concurrency: two people buying the last car at the same time cannot drive stock below 0
> - React SPA with search/filter, disabled purchase when stock is 0, admin dashboard for inventory management
>
> Lay out the monorepo structure and show how we'll handle the purchase concurrency in the database before writing code.

**Assistant**
> ### Monorepo Layout
> ```text
> roadline/
> ├── client/                 # React SPA (Vite + Tailwind CSS + Vitest)
> │   ├── src/
> │   │   ├── components/     # VehicleCard, VehicleForm, Navigation
> │   │   ├── context/        # AuthContext (JWT session & user role)
> │   │   ├── lib/            # Fetch API client wrapper
> │   │   └── pages/          # AuthPage, Dashboard
> ├── server/                 # Express REST API (Prisma + MySQL + Jest)
> │   ├── prisma/             # Schema, migrations, seed script
> │   ├── src/
> │   │   ├── errors/         # Custom AppError classes (400, 401, 403, 404)
> │   │   ├── middleware/     # Auth (JWT), RBAC (requireAdmin), validation, errors
> │   │   ├── repositories/   # Prisma query layer (User & Vehicle)
> │   │   ├── routes/         # Auth, Vehicle, Health
> │   │   └── services/       # AuthService and VehicleService (business logic)
> │   └── tests/              # Unit & Supertest integration suites
> ├── docker-compose.yml      # Isolated MySQL 8.4 container (port 3307)
> ├── README.md               # Setup, API docs, screenshots, AI disclosure
> └── TEST_REPORT.md          # Test results and coverage summary
> ```
>
> ### Concurrency Strategy
> Decrement atomically at the database level instead of in-memory arithmetic:
> ```sql
> UPDATE vehicles SET quantity = quantity - 1 WHERE id = ? AND quantity > 0;
> ```
> If affected rows = 0, reject with 400 Bad Request ("Vehicle is out of stock"). Prevents race conditions completely.
>
> ### TDD Progression
> 1. Service unit tests (Red) -> Service implementation (Green)
> 2. API integration tests (Red) -> Express routes & middleware (Green)
> 3. Frontend component tests (Red) -> React UI (Green)
> 4. Database configuration, seed, and smoke verification

---

### Prompt 2: Backend Domain & Auth Unit Tests (Red Phase)

**Developer**
> Write failing Jest unit tests for `AuthService` and `VehicleService` in `server/tests/` first. Do not write the implementation yet.
>
> Test cases needed:
> - Auth: email lowercasing/trimming, bcrypt hashing (never save plain text), duplicate email rejection, valid login returning JWT with role, invalid password rejection.
> - Vehicles: required fields validation (price > 0, quantity >= 0), search filtering (make, model, category, price range), purchase rejection when quantity is 0, atomic decrement, and restock (reject zero/negative amount).
>
> Mock the repositories so tests run fast. Run Jest and show the failing output.

**Assistant**
> Created `server/tests/auth.service.test.js` and `server/tests/vehicle.service.test.js`.
>
> ```bash
> npm run test -w server
> ```
>
> **Output (RED)**:
> ```text
> FAIL tests/auth.service.test.js
>   ● AuthService › register › hashes password and persists normalized email
>     Cannot find module '../src/services/auth.service'
> FAIL tests/vehicle.service.test.js
>   ● VehicleService › purchaseVehicle › throws when quantity is zero
>     Cannot find module '../src/services/vehicle.service'
>
> Test Suites: 2 failed, 2 total
> Tests:       9 failed, 9 total
> ```
> 9 tests failing as expected.

---

### Prompt 3: Service Layer Implementation (Green Phase)

**Developer**
> Now implement the service layer to make those 9 tests pass.
>
> 1. Custom errors in `server/src/errors/` (`AppError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `BadRequestError`).
> 2. `auth.service.js` using bcrypt and jsonwebtoken.
> 3. `vehicle.service.js` with search query sanitization, quantity checks, and atomic purchase/restock logic.
> 4. Abstract DB calls behind `user.repository.js` and `vehicle.repository.js`.
>
> Only write the minimal code to pass the tests. Run Jest.

**Assistant**
> Implemented errors, repositories, `AuthService`, and `VehicleService`.
>
> ```bash
> npm run test -w server
> ```
>
> **Output (GREEN)**:
> ```text
> PASS tests/auth.service.test.js
> PASS tests/vehicle.service.test.js
>
> Test Suites: 2 passed, 2 total
> Tests:       9 passed, 9 total
> Snapshots:   0 total
> Time:        1.42 s
> ```
> All 9 service tests passing.

---

### Prompt 4: API Integration Tests (Red Phase)

**Developer**
> Next, write Supertest integration tests in `server/tests/api.test.js` before writing any Express routes.
>
> Test:
> - `POST /api/auth/register` and `POST /api/auth/login`
> - `GET /api/vehicles` and `GET /api/vehicles/search` with query params
> - `POST /api/vehicles` (Admin allowed, Customer gets 403)
> - `PUT /api/vehicles/:id` and `DELETE /api/vehicles/:id` (Admin only)
> - `POST /api/vehicles/:id/purchase` (Customer allowed, 400 when out of stock)
> - `POST /api/vehicles/:id/restock` (Admin only)
> - Missing/invalid token returns 401
>
> Run the tests and confirm they fail.

**Assistant**
> Created `server/tests/api.test.js`.
>
> ```bash
> npm run test -w server -- tests/api.test.js
> ```
>
> **Output (RED)**:
> ```text
> FAIL tests/api.test.js
>   ● REST API › POST /api/auth/register › creates new user account
>     Cannot find module '../src/app'
>
> Test Suites: 1 failed, 1 total
> Tests:       7 failed, 7 total
> ```
> 7 tests failing. Ready for route implementation.

---

### Prompt 5: Express App, Routes & Middleware (Green Phase)

**Developer**
> Implement the Express routes and middleware to pass the Supertest suite:
> - `auth.middleware.js`: parse Bearer token, verify JWT, set `req.user`
> - `role.middleware.js`: `requireAdmin` check (403 if not ADMIN)
> - Input validation middleware
> - Centralized error handler returning uniform `{ error: message }`
> - Mount routes in `server/src/app.js` with CORS and express.json()
>
> Run the full backend test suite.

**Assistant**
> Implemented middleware, routes, and `app.js`.
>
> ```bash
> npm run test -w server
> ```
>
> **Output (GREEN)**:
> ```text
> PASS tests/api.test.js
> PASS tests/auth.service.test.js
> PASS tests/vehicle.service.test.js
>
> Test Suites: 3 passed, 3 total
> Tests:       16 passed, 16 total
> Snapshots:   0 total
> Time:        7.21 s
> ```
> All 16 backend tests pass.

---

### Prompt 6: Frontend Component Tests (Red Phase)

**Developer**
> Moving to `client/`. We're using Vite, React, Tailwind, and Vitest with React Testing Library.
>
> Write component tests first before creating the UI components:
> - `vehicle-card.test.jsx`: renders vehicle details, purchase button is enabled when stock > 0, button disabled + shows "Out of Stock" when quantity is 0, admin action buttons only visible for admin role.
> - `vehicle-form.test.jsx`: checks inputs and verifies price/quantity are parsed as numbers on submit.
> - `auth-page.test.jsx`: login/register toggle and API error display.
> - `dashboard.test.jsx`: loading state and vehicle list rendering.
>
> Run Vitest to confirm RED.

**Assistant**
> Created the 4 test files under `client/src/`.
>
> ```bash
> npm run test -w client
> ```
>
> **Output (RED)**:
> ```text
> FAIL src/components/vehicle-card.test.jsx
>   Failed to resolve import "./vehicle-card"
> FAIL src/components/vehicle-form.test.jsx
>   Failed to resolve import "./vehicle-form"
> FAIL src/pages/auth-page.test.jsx
>   Failed to resolve import "./auth-page"
> FAIL src/pages/dashboard.test.jsx
>   Failed to resolve import "./dashboard"
>
> Test Files  4 failed (4)
>      Tests  11 failed (11)
> ```
> 11 tests failing. Ready for UI implementation.

---

### Prompt 7: Frontend React SPA Implementation (Green Phase)

**Developer**
> Build the React components to pass the 11 tests:
> 1. `AuthContext` (token, user, login, logout, localStorage persistence).
> 2. `lib/api.js` wrapper attaching Bearer token.
> 3. `VehicleCard` with category pills, out-of-stock disabled button, and admin actions.
> 4. `VehicleForm` modal for add/edit.
> 5. `AuthPage` with login/register tabs and error display.
> 6. `Dashboard` with search bar, category dropdown, price filters, and vehicle grid.
>
> Keep the styling clean and functional with Tailwind. Run Vitest.

**Assistant**
> Implemented components, context, and API layer.
>
> ```bash
> npm run test -w client
> ```
>
> **Output (GREEN)**:
> ```text
>  ✓ src/lib/api.test.js (3 tests)
>  ✓ src/components/vehicle-card.test.jsx (2 tests)
>  ✓ src/pages/dashboard.test.jsx (2 tests)
>  ✓ src/components/vehicle-form.test.jsx (2 tests)
>  ✓ src/pages/auth-page.test.jsx (2 tests)
>
> Test Files  5 passed (5)
>      Tests  11 passed (11)
>   Duration  4.98s
> ```
> All 11 client tests pass.

---

### Prompt 8: Database Setup, Docker Isolation & Seeding

**Developer**
> Set up MySQL in `docker-compose.yml` on port `3307:3306` (database: `incubyte_car_deal`) so it doesn't conflict with any local MySQL running on 3306.
>
> Then:
> 1. Prisma schema with MySQL provider for `User` and `Vehicle` models.
> 2. Migration for initial schema.
> 3. `seed.js` creating an admin (`admin@roadline.com` / `AdminPass123!`) and 6 sample cars across Sedan, SUV, Truck, Coupe, Hatchback, and Electric categories.
>
> Apply migration and seed.

**Assistant**
> Configured Docker Compose, Prisma schema, migration, and seed script.
>
> ```bash
> npm run db:deploy -w server
> npm run db:seed -w server
> ```
>
> **Output**:
> ```text
> Applying migration `20261025091400_init`
> Database is now in sync with migrations.
> Running seed script...
> Seeded admin user: admin@roadline.com (role: ADMIN)
> Seeded 6 vehicle records across Sedan, SUV, Truck, Coupe, Hatchback, and Electric categories.
> Seed complete.
> ```

---

### Prompt 9: UI Polish & Full Verification

**Developer**
> Polish the UI with a clean dark theme (Carbon-style header, slate cards, clear stock badges) and run full verification:
> 1. Live DB smoke test: register, login, search, purchase (stock -1), admin restock (stock +1), non-admin delete rejection (403).
> 2. Backend Jest and client Vitest suites with coverage report.
> 3. `npm run lint` and `npm run build`.
> 4. Update README and test report.

**Assistant**
> UI polished and verification complete:
>
> - **Tests**: 27/27 passed (16 backend Jest, 11 frontend Vitest). Backend lines: 91.66%, frontend branches: 83.67%.
> - **Smoke Test**: Passed against MySQL container (purchase reduced Camry from 4 to 3; restock restored to 4; non-admin delete blocked with 403).
> - **Lint & Build**: 0 lint errors, Vite production build succeeded.
> - **Docs**: README.md and TEST_REPORT.md updated. All commits tagged with `Co-authored-by: OpenAI Codex <codex@openai.com>`.
