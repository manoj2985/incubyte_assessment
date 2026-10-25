# Test Report

## Scope

The automated suite checks the backend business rules and HTTP contract as well as the main frontend user interactions. Database schema application and an end-to-end MySQL smoke test are recorded separately because they use the Docker MySQL service.

## Latest automated result

Run from the repository root with:

```bash
npm run test:report
```

| Suite | Test files | Tests | Result |
| --- | ---: | ---: | --- |
| Backend Jest and Supertest | 3 | 16 | Passed |
| Frontend Vitest and Testing Library | 5 | 11 | Passed |
| Total | 8 | 27 | Passed |

## Coverage

| Application | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| Backend | 89.08% | 80.00% | 85.29% | 91.66% |
| Frontend | 74.20% | 83.67% | 53.12% | 74.20% |

## Covered behavior

- Password hashing, normalized email addresses, duplicate registration, login, and JWT creation
- Request validation and consistent error responses
- Protected inventory access and administrator authorization
- Vehicle filtering by text, category, and price range
- Purchase stock reduction, out-of-stock handling, and restocking
- Login and registration interface behavior
- Inventory loading and purchase feedback
- Administrator inventory controls
- Vehicle form conversion and out-of-stock button state

## Additional verification

- Frontend production build: passed with Vite
- Prisma client generation: passed
- Initial MySQL migration SQL generation: passed
- MySQL 8.4 container health check: passed
- Prisma migration deployment: passed
- Admin and sample inventory seed: passed
- Database-backed API health check: passed
- Database-backed administrator login: passed
- Database-backed vehicle search: passed
- Atomic purchase reduced Toyota Camry stock from 4 to 3: passed
- Administrator restock returned Toyota Camry stock from 3 to 4: passed

Machine-readable JSON reports are produced in the ignored `test-results` directory when `npm run test:report` is executed.

