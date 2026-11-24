AI Project Planner — Architecture & File Structure
Target architecture for the AI Project Planner MVP.
This project uses a modular monolith architecture inside a pnpm monorepo.
The frontend, API, database, AI integration, shared contracts, and scheduling engine are separated by responsibility without introducing microservices prematurely.
---

1. High-Level Architecture

```text
ai-project-planner/
│
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # Cloudflare Workers + Hono API
│
├── packages/
│   ├── database/               # Drizzle schema, migrations, DB access
│   ├── shared/                 # Shared types, schemas, constants
│   ├── scheduling-engine/      # Pure TypeScript scheduling logic
│   └── ai/                     # Gemini integration, prompts, AI schemas
│
├── docs/                       # Architecture and product documentation
│
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
└── README.md
```

Request Flow

```text
Browser
  │
  ▼
Next.js Web App
  │ HTTPS / REST
  ▼
Cloudflare Worker
  │
  ▼
Hono Router
  │
  ├── Middleware
  │     ├── Authentication
  │     ├── Validation
  │     ├── Authorization
  │     └── Error handling / logging
  │
  ▼
Route Handler
  │
  ▼
Application Service Layer
  │
  ├── AI Package
  │     └── Google Gemini API
  │
  ├── Scheduling Engine
  │
  └── Repository Layer
          │
          ▼
      Drizzle ORM
          │
          ▼
      Cloudflare D1 (SQLite)
```

Core Architecture Principles
Gemini generates and refines project plan content.
Scheduling Engine handles deterministic scheduling calculations.
Application Services orchestrate business workflows.
Repository Layer handles database persistence.
The application, not the AI model, owns final scheduling calculations.
Frontend communicates with the backend through REST APIs.
API keys and server secrets never reach the browser.
---

2. Repository Structure

```text
ai-project-planner/
│
├── apps/
│   │
│   ├── web/
│   │   ├── public/
│   │   │
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   │
│   │   │   │   ├── dashboard/
│   │   │   │   ├── projects/
│   │   │   │   │   └── [projectId]/
│   │   │   │   ├── settings/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/                 # shadcn/ui
│   │   │   │   ├── layout/
│   │   │   │   └── shared/
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── projects/
│   │   │   │   ├── phases/
│   │   │   │   ├── tasks/
│   │   │   │   ├── timeline/
│   │   │   │   ├── ai-chat/
│   │   │   │   └── revisions/
│   │   │   │
│   │   │   ├── hooks/
│   │   │   ├── stores/                 # Zustand
│   │   │   ├── lib/                    # API client, utilities
│   │   │   └── types/
│   │   │
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── index.ts                # Worker entry point
│       │   ├── app.ts                  # Hono app composition
│       │   │
│       │   ├── config/
│       │   │   └── env.ts              # Typed Worker bindings
│       │   │
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   └── logger.middleware.ts
│       │   │
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── project.routes.ts
│       │   │   ├── phase.routes.ts
│       │   │   ├── task.routes.ts
│       │   │   ├── ai.routes.ts
│       │   │   └── revision.routes.ts
│       │   │
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   └── auth.ts
│       │   │   │
│       │   │   ├── projects/
│       │   │   │   ├── project.service.ts
│       │   │   │   ├── project.repository.ts
│       │   │   │   └── project.validation.ts
│       │   │   │
│       │   │   ├── phases/
│       │   │   │   ├── phase.service.ts
│       │   │   │   └── phase.repository.ts
│       │   │   │
│       │   │   ├── tasks/
│       │   │   │   ├── task.service.ts
│       │   │   │   ├── task.repository.ts
│       │   │   │   └── task.validation.ts
│       │   │   │
│       │   │   ├── ai/
│       │   │   │   └── ai.service.ts
│       │   │   │
│       │   │   └── revisions/
│       │   │       ├── revision.service.ts
│       │   │       └── revision.repository.ts
│       │   │
│       │   └── tests/
│       │
│       ├── wrangler.jsonc
│       ├── .dev.vars.example
│       └── package.json
│
├── packages/
│   │
│   ├── database/
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── schema/
│   │   │   │   ├── project.schema.ts
│   │   │   │   ├── phase.schema.ts
│   │   │   │   ├── task.schema.ts
│   │   │   │   ├── milestone.schema.ts
│   │   │   │   ├── revision.schema.ts
│   │   │   │   ├── conversation.schema.ts
│   │   │   │   ├── ai-usage.schema.ts
│   │   │   │   ├── relations.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── index.ts
│   │   │
│   │   ├── drizzle/
│   │   │   └── migrations/
│   │   │
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── shared/
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── project.ts
│   │   │   │   ├── phase.ts
│   │   │   │   ├── task.ts
│   │   │   │   └── user.ts
│   │   │   │
│   │   │   ├── schemas/
│   │   │   │   ├── project.schema.ts
│   │   │   │   ├── task.schema.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── constants/
│   │   │   └── index.ts
│   │   │
│   │   └── package.json
│   │
│   ├── scheduling-engine/
│   │   ├── src/
│   │   │   ├── algorithms/
│   │   │   │   ├── topological-sort.ts
│   │   │   │   ├── cycle-detection.ts
│   │   │   │   └── critical-path.ts
│   │   │   │
│   │   │   ├── calendar/
│   │   │   │   ├── working-days.ts
│   │   │   │   └── date-calculator.ts
│   │   │   │
│   │   │   ├── scheduler.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── ai/
│       ├── src/
│       │   ├── providers/
│       │   │   ├── ai-provider.ts
│       │   │   └── gemini.provider.ts
│       │   │
│       │   ├── prompts/
│       │   │   ├── project-planner.ts
│       │   │   ├── task-generator.ts
│       │   │   └── plan-refinement.ts
│       │   │
│       │   ├── schemas/
│       │   │   ├── generated-project.schema.ts
│       │   │   ├── generated-task.schema.ts
│       │   │   └── index.ts
│       │   │
│       │   ├── types/
│       │   │   └── ai.types.ts
│       │   │
│       │   └── index.ts
│       │
│       └── package.json
│
├── docs/
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-specification.md
│   └── roadmap.md
│
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
└── README.md
```

> This is the target structure, not a requirement to create every file on day one.

---

3. Responsibility Boundaries
   3.1 `apps/web`
   Owns presentation and client-side interaction.
   Responsibilities:
   Pages and layouts.
   UI components.
   Form state and client state.
   API calls.
   Timeline and project editing experience.
   Displaying AI-generated plans.
   User interaction and feedback.
   Rules:
   Must not connect directly to D1.
   Must not expose Gemini API keys.
   Must not contain backend business logic.
   Must communicate with the API through HTTP.
   3.2 `apps/api`
   Owns the HTTP application and orchestrates use cases.
   Responsibilities:
   Hono routes and middleware.
   Authentication integration.
   Request validation.
   Authorization checks.
   Application services.
   Calling AI and scheduling packages.
   Repository orchestration.
   Returning API responses.
   Rules:
   Routes should remain thin.
   Business workflows belong in application services.
   Database queries belong in repositories.
   API is responsible for injecting runtime environment variables into server-side services.
   3.3 `packages/database`
   Owns database-specific implementation.
   Responsibilities:
   Drizzle table definitions.
   Relations and indexes.
   Migrations.
   D1-to-Drizzle client creation.
   Database types and exports.
   Rules:
   D1 binding must be passed from the Worker runtime.
   Do not assume Cloudflare bindings are globally available.
   Do not put application workflows inside database packages.
   Better Auth manages its own required authentication tables according to the selected adapter and version.
   3.4 `packages/shared`
   Owns contracts shared by frontend and backend.
   Responsibilities:
   Shared TypeScript types.
   Zod schemas.
   Enums and constants.
   API input/output contracts.
   Shared domain-level types.
   Rules:
   Must be safe to import from both browser and server.
   Must not contain secrets.
   Must not contain database clients.
   Must not contain server-only implementation code.
   Avoid importing packages that are only required by the backend.
   3.5 `packages/scheduling-engine`
   Owns deterministic scheduling logic.
   Responsibilities:
   Dependency graph construction.
   Topological sorting.
   Cycle detection.
   Critical path calculation.
   Working-day calculation.
   Task date scheduling.
   Deadline validation.
   Rules:
   Pure TypeScript.
   No Hono.
   No React.
   No D1.
   No Drizzle.
   No Gemini SDK.
   Should be independently testable.
   The scheduling engine should receive validated task data and return calculated scheduling results.
   3.6 `packages/ai`
   Owns AI provider integration and AI-specific contracts.
   Responsibilities:
   AI provider interface.
   Gemini implementation.
   Prompt templates.
   AI-specific input/output schemas.
   Provider response parsing.
   Mapping Gemini responses into application-level results.
   Rules:
   Gemini API Key must be injected from the API runtime.
   Must not access `process.env` directly.
   Must not connect directly to D1.
   Must not write to the database.
   Must not decide final task dates.
   Must validate model output before returning it.
   The AI package should focus on AI integration, while application workflows remain in `apps/api`.

---

4. AI Integration Architecture
   The MVP uses Google Gemini through an API key generated in Google AI Studio.
   Official resources:
   Google AI Studio: https://aistudio.google.com/
   Gemini API documentation: https://ai.google.dev/gemini-api/docs
   Google Gen AI SDK: https://ai.google.dev/gemini-api/docs/libraries
   4.1 AI Request Flow

```text
Next.js Frontend
      │
      ▼
Hono API
      │
      ▼
AI Application Service
      │
      ▼
packages/ai
      │
      ├── Provider Interface
      │
      ├── Gemini Provider
      │
      ├── Prompt Templates
      │
      └── Response Validation
      │
      ▼
Google Gemini API
      │
      ▼
Validated AI Result
      │
      ▼
Scheduling Engine
      │
      ▼
Final Project Plan
```

4.2 Gemini Provider
The API key should never be hardcoded.
Use dependency injection so that the provider receives the API key from the Cloudflare Worker environment.
Example:

```typescript
// packages/ai/src/providers/gemini.provider.ts

import { GoogleGenAI } from "@google/genai";

export function createGeminiProvider(apiKey: string) {
  const client = new GoogleGenAI({ apiKey });

  return {
    async generateContent(prompt: string) {
      const response = await client.models.generateContent({
        model: "YOUR_GEMINI_MODEL",
        contents: prompt,
      });

      return response.text;
    },
  };
}
```

The model identifier should be configured using a model supported by the current Gemini API.
4.3 Cloudflare Environment Variables
Local development:

```text
apps/api/.dev.vars
```

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Keep `.dev.vars` out of Git.
For production:

```bash
npx wrangler secret put GEMINI_API_KEY
```

Cloudflare Worker environment type:

```typescript
export type Bindings = {
  GEMINI_API_KEY: string;
  DB: D1Database;
};
```

Inject the API key into the AI provider at the application service boundary:

```typescript
const provider = createGeminiProvider(c.env.GEMINI_API_KEY);
```

Do not expose the key to Next.js or browser-side code.
4.4 AI Output Validation
Never assume Gemini always returns valid data.
Recommended process:
Send prompt to Gemini.
Receive model response.
Parse the response.
Validate it with Zod.
Reject or handle invalid output.
Return validated data to the application service.
Pass generated tasks to the scheduling engine.
AI-generated data should be treated as untrusted external input.
---

5. Backend Layering
   Use the following request path:

```text
HTTP Request
    │
    ▼
Middleware
    │
    ▼
Route Handler
    │
    ▼
Application Service
    │
    ├── AI Package
    │
    ├── Scheduling Engine
    │
    └── Repository
             │
             ▼
          Drizzle
             │
             ▼
             D1
```

Route
Responsible for HTTP concerns:
Read path and query parameters.
Parse request body.
Invoke validation.
Call application services.
Return appropriate HTTP responses.
Routes should remain thin.
Application Service
Responsible for use cases and business rules:
Create a project.
Generate a project plan.
Refine an existing plan.
Validate task dependencies.
Recalculate a schedule.
Enforce ownership and permissions.
Coordinate AI, scheduling, and persistence.
Repository
Responsible for persistence:
Query projects and tasks.
Insert, update, and delete records.
Load related data.
Persist revisions.
Retrieve AI usage records.
Repositories should not decide product workflows or call Gemini.
---

6. Initial Database Domains
   Better Auth manages its required authentication tables.
   Use the exact schema expected by the selected Better Auth adapter and version.
   Application tables planned for the MVP:
   Table Responsibility
   `project` Project details, owner, status, settings
   `phase` Ordered project phases
   `task` Task details, estimates, status, dates
   `task_dependency` Prerequisite relationships between tasks
   `milestone` Important project checkpoints
   `project_revision` Versioned snapshots of project plans
   `project_conversation` AI/user conversation history
   `ai_usage` Provider, model, token usage, estimated cost
   `project_member` is intentionally deferred until collaboration becomes part of the product.
   Suggested Relationships

```text
User
 ├── Projects
 ├── Sessions
 ├── Accounts
 └── AI Usage

Project
 ├── Phases
 │    └── Tasks
 │         └── Task Dependencies
 ├── Milestones
 ├── Project Revisions
 └── Project Conversations
```

Important Constraints
A task dependency must connect tasks belonging to the same project.
A task cannot depend on itself.
Duplicate dependency edges must be rejected.
Cycles must be detected by the scheduling engine.
Database foreign keys and application validation should both be used where appropriate.
For D1/SQLite:
Use `TEXT` for UUIDs and ISO dates.
Use `INTEGER` for timestamps, booleans and durations.
Store JSON as serialized `TEXT` where appropriate.
---

7. API Route Plan
   Initial endpoints:
   Method Endpoint Purpose
   GET `/health` Health check
   POST `/api/projects` Create project
   GET `/api/projects` List current user's projects
   GET `/api/projects/:id` Get project details
   PATCH `/api/projects/:id` Update project
   DELETE `/api/projects/:id` Delete project
   POST `/api/projects/:id/generate` Generate plan with AI
   POST `/api/projects/:id/refine` Refine plan with AI
   GET `/api/projects/:id/revisions` List revisions
   POST `/api/projects/:id/recalculate` Recalculate schedule
   POST `/api/tasks` Create task
   PATCH `/api/tasks/:id` Update task
   DELETE `/api/tasks/:id` Delete task
   Add phase, milestone, and dependency endpoints as the UI and use cases require them.
   All resource endpoints must enforce ownership and authorization.

---

8. Package Dependencies
   Each workspace package owns its dependencies.
   Suggested dependency relationships:

```text
apps/web
  └── @repo/shared

apps/api
  ├── @repo/shared
  ├── @repo/database
  ├── @repo/ai
  └── @repo/scheduling-engine

packages/database
  └── drizzle-orm

packages/shared
  └── zod

packages/scheduling-engine
  └── No infrastructure dependencies

packages/ai
  ├── @google/genai
  └── zod
```

Use `workspace:*` for internal workspace dependencies.
Example `apps/api/package.json`:

```json
{
  "name": "api",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@repo/shared": "workspace:*",
    "@repo/database": "workspace:*",
    "@repo/ai": "workspace:*",
    "@repo/scheduling-engine": "workspace:*",
    "hono": "^4.0.0"
  }
}
```

Example `packages/ai/package.json`:

```json
{
  "name": "@repo/ai",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@google/genai": "^1.0.0",
    "zod": "^4.0.0"
  }
}
```

Use actual compatible package versions when installing. The versions above are illustrative.
---

9. Architecture Rules
   Keep the product as a modular monolith for the MVP.
   Keep the scheduling engine independent of infrastructure.
   Keep AI provider code behind an interface.
   AI proposes plan content; application code validates and schedules it.
   Validate all external input at runtime with Zod.
   Enforce authorization on every resource access.
   Keep routes thin and business logic in application services.
   Keep database queries in repositories where that separation adds value.
   Do not introduce microservices, queues, Redis, or event infrastructure without a demonstrated requirement.
   Do not create every planned folder before it is needed.
   Keep secrets in Cloudflare Worker secrets or local development environment files.
   Keep shared packages free of server-only dependencies.
   Keep AI provider implementations independent of database persistence.
   Keep database access inside the backend runtime.

---

10. Suggested Implementation Order
    Build the MVP incrementally.
    Phase Implementation
    1 Scaffold pnpm workspace, Next.js app and Worker API
    2 Add Hono and health endpoint
    3 Add D1, Drizzle and first migrations
    4 Integrate Better Auth and verify session handling
    5 Implement project, phase and task CRUD
    6 Define shared contracts and Zod schemas
    7 Integrate Gemini through `packages/ai`
    8 Build and test scheduling engine independently
    9 Add AI refinement and revision history
    10 Build project editor and timeline UI
    11 Add end-to-end tests and deploy the MVP
    Do not implement all modules simultaneously.
    Complete each phase before introducing unnecessary complexity.

---

11. Important Implementation Notes
    Cloudflare Workers
    Use Worker bindings through the request/runtime context.
    Do not assume Node.js globals or `process.env` are available.
    Verify SDK compatibility with the Cloudflare Workers runtime.
    Use Cloudflare secrets for production credentials.
    Database
    Create the Drizzle client using the D1 binding.
    Better Auth schema must match the selected adapter/version.
    Verify D1 migration and transaction behavior.
    Prefer supported D1 batch operations for atomic multi-statement operations where appropriate.
    AI
    Keep Gemini API Key server-side.
    Validate all Gemini responses.
    Handle rate limits, API failures and malformed output.
    Track token usage and estimated cost.
    Do not let AI directly persist data or calculate final task schedules.
    Frontend Deployment
    The Next.js deployment target is a separate decision.
    If deploying on Cloudflare, verify the current OpenNext adapter and compatibility requirements.

---

12. Final Architecture Decision
    The AI Project Planner MVP will use:
    Layer Technology
    Frontend Next.js
    UI Tailwind CSS + shadcn/ui
    Client State Zustand
    Backend Cloudflare Workers
    API Framework Hono
    Database Cloudflare D1
    ORM Drizzle ORM
    Authentication Better Auth
    AI Provider Google Gemini API
    AI SDK `@google/genai`
    Validation Zod
    Scheduling Custom TypeScript Engine
    Monorepo pnpm Workspaces
    Version Control Git + GitHub
    Final Design Philosophy
    The application follows three important principles:
1. AI handles intelligence.
   Gemini understands user requirements, generates project plans, breaks down tasks and suggests improvements.
1. Application code handles correctness.
   The backend validates data, enforces business rules, manages permissions and persists project information.
1. Scheduling Engine handles deterministic calculations.
   Task dependencies, working days, deadlines and critical paths are calculated by application code rather than relying on AI-generated dates.
   The goal is to build a maintainable, testable and extensible modular monolith without prematurely introducing distributed system complexity.
   This architecture is the foundation for the AI Project Planner MVP.
