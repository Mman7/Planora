# Architecture Rules

## 1. General Principles

All code must follow:

- Single Responsibility Principle (SRP).
- Separation of Concerns.
- Feature-Based Architecture.
- Dependency Direction.
- Reusable and maintainable code.

## 2. Code Quality

- Explicit `any` is forbidden.
- Nested ternary expressions are forbidden.
- Unused variables are forbidden.
- `debugger` statements are forbidden.
- `@ts-ignore` and `@ts-nocheck` are forbidden.
- `@ts-expect-error` requires a description.
- Circular dependencies are forbidden.
- Maximum file length: 800 lines.
- Maximum cyclomatic complexity: 10.
- Maximum nesting depth: 4.
- Maximum function parameters: 4.

## 3. Frontend Architecture

Technology:

- Next.js
- React
- TypeScript
- Zustand
- Tailwind CSS
- shadcn/ui

### Naming Convention

- Components: PascalCase.
- Component files: PascalCase.tsx.
- Hooks: use + PascalCase.
- Functions: camelCase.
- Variables: camelCase.
- Constants: UPPER_SNAKE_CASE.
- Types and Interfaces: PascalCase.
- Zustand stores: camelCase.store.ts.
- Tests: *.test.ts or *.test.tsx.

### Responsibilities

- Components handle UI rendering.
- Hooks encapsulate reusable React logic.
- Stores manage shared client state.
- API calls must be separated from presentation components.
- Components must not access the database directly.

## 4. Backend Architecture

Technology:

- Cloudflare Workers
- Hono
- Drizzle ORM
- Cloudflare D1
- Zod
- Better Auth

Architecture:
Feature-Based + Layered Architecture.

### Naming Convention

- Routes: *.routes.ts
- Controllers: *.controller.ts
- Services: *.service.ts
- Repositories: *.repository.ts
- Validation: *.validation.ts
- Types: *.types.ts
- Middleware: *.middleware.ts
- Providers: *.provider.ts
- Database schemas: *.schema.ts

### Layer Responsibilities

#### Routes

- Register HTTP endpoints.
- Attach middleware.
- Delegate requests to controllers.
- Must not contain business logic or database queries.

#### Controllers

- Handle HTTP requests and responses.
- Extract validated input.
- Call services.
- Must not contain database queries or complex business logic.

#### Services

- Implement business use cases.
- Coordinate repositories and domain packages.
- Handle authorization and business rules.
- Must not directly execute database queries.

#### Repositories

- Handle database queries and persistence.
- Use Drizzle ORM.
- Must not return HTTP responses.
- Must not call AI providers.

#### Validation

- Define Zod schemas.
- Validate request inputs and relevant data structures.
- Must not contain business logic.

## 5. Package Responsibilities

### Scheduling Engine

- Pure TypeScript.
- No Hono, React, Next.js, Drizzle or Cloudflare dependencies.
- No direct database access.
- Deterministic scheduling logic.

### AI Package

- AI provider abstraction.
- Gemini integration.
- Prompt templates.
- Structured output validation.
- Must not directly modify project database records.

### Database Package

- Drizzle schemas.
- Database relations.
- Migrations.
- Database client creation.

### Shared Package

- Shared types.
- Shared validation schemas.
- Shared constants.
- Must not depend on business modules.

## 6. Dependency Direction

Expected backend flow:

Route
-> Controller
-> Service
-> Repository
-> Database

Services may depend on:

- AI package.
- Scheduling Engine.
- Repository interfaces or implementations.

AI and Scheduling packages must not depend on API modules.

## 7. Single Responsibility

Every file, module and function should have one clear responsibility.

If a function handles multiple unrelated responsibilities,
split it into smaller functions or dedicated modules.

Do not create unnecessary abstractions solely to satisfy file naming rules.

## 8. Enforcement

ESLint enforces:

- Code quality.
- Complexity.
- File length.
- Import restrictions.
- Dependency boundaries.
- Naming conventions where technically enforceable.

Code review is required for architectural responsibilities
that cannot be reliably checked by static analysis.

## Code Formatting Requirements

- Prettier is the mandatory code formatter.
- After creating or modifying files, run Prettier on all changed files.
- Do not rely on ESLint to format code.
- Do not manually imitate Prettier formatting.
- Before completing a task, run:
  - `pnpm exec prettier --write <changed-files>`
  - `pnpm exec eslint <changed-files>`
  - `pnpm exec tsc --noEmit` (where applicable)
- Fix all formatting and lint errors before reporting completion.
- Never claim formatting or linting passed unless the commands were executed successfully.

## TypeScript Type Definition Convention

### 1. Interface — Object Contracts

Use `interface` for:

- Domain entities and object models
- API Request / Response DTOs
- Repository contracts
- Service contracts
- Component Props
- Configuration objects

### 2. Type — Type Composition & Type Logic

Use `type` for:

- Union types
- Intersection types
- Primitive aliases
- Tuple types
- Function types
- Conditional types
- Mapped types
- Utility type compositions

### 3. General Rules

- Do not use `type` simply to replace an object-shaped interface.
- Do not use `interface` for union or tuple definitions.
- Prefer `interface extends` when extending object contracts.
- Prefer `&` when composing type aliases.
- Avoid unnecessary duplicate type definitions.
