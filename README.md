# Roadline Car Dealership Inventory

Roadline is a full-stack dealership inventory application. Customers can register, sign in, search the current stock, and purchase an available vehicle. Administrators can add vehicles, update listings, restock inventory, and remove listings.

The backend protects inventory routes with JWT authentication and stores application data in MySQL. Stock purchases use an atomic database update so two requests cannot purchase the same last vehicle.

## Screenshots

### Sign in

![Roadline sign-in page](docs/screenshots/login.png)

### Administrator inventory

![Roadline administrator inventory](docs/screenshots/inventory.png)

## Technology

- Backend: Node.js, Express, Prisma, MySQL
- Frontend: React, Vite, Tailwind CSS
- Authentication: JSON Web Tokens and bcrypt password hashing
- Testing: Jest, Supertest, Vitest, React Testing Library
- Local database: MySQL installed locally or the optional Docker Compose service

## Features

- User registration and login
- Protected inventory and search endpoints
- Search by make, model, category, minimum price, and maximum price
- Purchase button disabled for out-of-stock vehicles
- Atomic quantity reduction when a purchase succeeds
- Administrator-only add, update, delete, and restock operations
- Responsive customer and administrator views
- Request validation with consistent API error responses

## Project structure

```text
client/                 React application
  src/components/       Reusable inventory components
  src/context/          Authentication state
  src/pages/            Login and inventory screens
server/                 Express API
  prisma/               MySQL schema, migrations, and seed data
  src/middleware/       Authentication, validation, and errors
  src/repositories/     Prisma database access
  src/routes/           REST API routes
  src/services/         Business rules
  tests/                Service and API tests
docs/screenshots/       Application screenshots
PROMPTS.md              AI conversation record
TEST_REPORT.md          Latest test results
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- MySQL 8 or newer
- Docker Desktop only if you prefer the included containerized MySQL setup

## Local setup

1. Install dependencies from the repository root.

   ```bash
   npm install
   ```

2. Create a MySQL database named `incubyte_car_deal`.

   ```sql
   CREATE DATABASE incubyte_car_deal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Copy the environment templates.

   ```powershell
   Copy-Item server/.env.example server/.env
   Copy-Item client/.env.example client/.env
   ```

4. Update `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `server/.env`. A typical local connection is:

   ```env
   DATABASE_URL=mysql://your-user:your-password@127.0.0.1:3306/incubyte_car_deal
   ```

5. Generate the Prisma client, apply the migration, and seed the database.

   ```bash
   npm run prisma:generate -w server
   npm run db:migrate -w server
   npm run db:seed -w server
   ```

6. Start both applications.

   ```bash
   npm run dev
   ```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:4000`.

Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from `server/.env` to open the administrator view. New registrations receive the customer role.

## Optional Docker database

If MySQL is not installed locally, start the included service before running the Prisma commands:

```bash
docker compose up -d
npm run db:deploy -w server
npm run db:seed -w server
```

The container maps MySQL to local port `3307`, and its connection is already shown in `server/.env.example`. Stop the service with `docker compose down`. The named volume preserves the database between runs.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API and React development servers |
| `npm test` | Run backend and frontend tests |
| `npm run test:report` | Generate JSON and coverage test output |
| `npm run build` | Create the frontend production build |
| `npm run lint` | Run static analysis |
| `npm run db:migrate -w server` | Apply the Prisma development migration |
| `npm run db:deploy -w server` | Apply committed migrations without creating a shadow database |
| `npm run db:seed -w server` | Create the admin user and sample inventory |

## REST API

Except for authentication and health checks, routes require `Authorization: Bearer <token>`.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | API health check |
| `POST` | `/api/auth/register` | Public | Register a customer |
| `POST` | `/api/auth/login` | Public | Log in |
| `GET` | `/api/vehicles` | Authenticated | List or filter vehicles |
| `GET` | `/api/vehicles/search` | Authenticated | Search vehicles |
| `POST` | `/api/vehicles` | Admin | Add a vehicle |
| `PUT` | `/api/vehicles/:id` | Admin | Update a vehicle |
| `DELETE` | `/api/vehicles/:id` | Admin | Delete a vehicle |
| `POST` | `/api/vehicles/:id/purchase` | Authenticated | Purchase one vehicle |
| `POST` | `/api/vehicles/:id/restock` | Admin | Increase stock |

Search parameters are `make`, `model`, `category`, `minPrice`, and `maxPrice`.

## Testing

The backend tests cover authentication, validation, protected routes, role permissions, filtering, purchasing, and restocking. The frontend tests cover API error handling, login, registration errors, dashboard loading, purchasing, administrator controls, vehicle forms, and out-of-stock behavior.

See [`TEST_REPORT.md`](TEST_REPORT.md) for the latest recorded results.

## My AI Usage

I used OpenAI Codex while building this project. I used it to discuss the stack, create initial test cases, implement parts of the Express and React structure, investigate a local database connection issue, and review the setup instructions. I ran the tests and builds after each implementation stage and kept the Red-Green commits visible in the repository history.

AI was useful for moving quickly between backend, frontend, and test setup. The main risk was accepting more structure than the application needed, so I kept the service and repository layers small, removed unnecessary presentation elements, and used direct code where an additional abstraction did not improve clarity.

The unedited prompts and direct conversation replies from this work session are recorded in [`PROMPTS.md`](PROMPTS.md).

## Deployment notes

- Set a long, random `JWT_SECRET` in the hosting platform.
- Use a managed MySQL connection for `DATABASE_URL`.
- Set `CLIENT_URL` to the deployed frontend origin.
- Change the example database and seeded administrator passwords immediately.
- Build the frontend with `npm run build -w client` and deploy the `client/dist` directory.

