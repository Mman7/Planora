# AI Project Planner --- Tech Stack

> Current selected stack for the AI Project Planner MVP.
>
> Core principle: AI understands and proposes plans; deterministic
> application code validates dependencies and calculates schedules.

## 1. Stack overview

  -----------------------------------------------------------------------
  Layer                   Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend framework      Next.js                 Pages, routing,
                                                  rendering

  UI library              React                   Component-based
                                                  interface

  Language                TypeScript              Static typing across
                                                  the application

  Styling                 Tailwind CSS            Utility-first styling

  UI components           shadcn/ui               Reusable, customizable
                                                  UI components

  Client state            Zustand                 Shared client-side
                                                  state

  Backend runtime         Cloudflare Workers      Serverless execution
                                                  environment

  Backend framework       Hono                    HTTP routing and
                                                  middleware

  Database                Cloudflare D1           Managed SQLite database

  ORM                     Drizzle ORM             Typed schema, queries,
                                                  migrations

  Authentication          Better Auth             Registration, login,
                                                  sessions

  Validation              Zod                     Runtime validation of
                                                  external data

  AI provider             Google Gemini API       Requirement
                                                  understanding and plan
                                                  generation

  Scheduling              Pure TypeScript package Dependency analysis and
                                                  deterministic
                                                  scheduling

  Date utilities          date-fns                Date manipulation
                                                  helpers

  Unit/integration        Vitest                  Test business logic and
  testing                                         modules

  E2E testing             Playwright              Test complete browser
                                                  workflows

  Package management      pnpm                    Workspace and
                                                  dependency management

  Deployment              Cloudflare              Worker API and D1
                                                  hosting
  -----------------------------------------------------------------------

The exact package versions should be selected and pinned when the
repository is scaffolded. Verify current compatibility before
integrating Better Auth, Drizzle, D1, and the chosen Next.js deployment
adapter.

------------------------------------------------------------------------

## 2. Frontend

### Next.js

Role: React framework for the web application.

Used for:

-   App Router and page routing.
-   Dashboard and project pages.
-   Authentication pages.
-   Project editor and timeline screens.
-   Server and client component composition.
-   Production build and deployment.

### React

Role: Component model for the user interface.

Used for:

-   Reusable UI components.
-   Forms and interactive controls.
-   Task and phase views.
-   Timeline interactions.

### TypeScript

Role: Main programming language for frontend and backend code.

Used for:

-   Shared domain types.
-   API contracts.
-   Database-related types.
-   Scheduling engine implementation.
-   AI provider interfaces.

TypeScript checks types during development and compilation. It does not
validate arbitrary JSON at runtime; use Zod for that.

### Tailwind CSS

Role: Utility-first styling.

Used for:

-   Layout and spacing.
-   Responsive design.
-   Typography and colors.
-   Component styling.

### shadcn/ui

Role: Reusable component source collection.

Potential components:

-   Dialog.
-   Dropdown Menu.
-   Calendar.
-   Table.
-   Sidebar.
-   Form controls.
-   Tabs and Popovers.

Components can be customized in the project rather than treated as an
opaque hosted UI system.

### Zustand

Role: Client-side shared state management.

Potential state:

-   Current project selection.
-   Active timeline view.
-   Temporary task editing state.
-   UI preferences.
-   Local interaction state.

Zustand is not the persistent source of truth. Persisted project data
belongs in the backend database. Use a clear API/cache strategy for
server data rather than placing every server response into one global
store.

------------------------------------------------------------------------

## 3. Backend

### Cloudflare Workers

Role: Serverless runtime for the API.

Responsibilities:

-   Execute API code when requests arrive.
-   Provide access to Cloudflare bindings such as D1.
-   Host the Hono application.
-   Access configured secrets and environment variables.

Important concepts to learn:

-   Worker request lifecycle.
-   Runtime APIs and compatibility.
-   Bindings and environment configuration.
-   CPU and execution limits.
-   Local development with Wrangler.
-   Secrets and production deployment.

Workers are not a traditional always-running Node.js server. Code should
follow the Workers runtime and its supported APIs.

### Hono

Role: HTTP web framework running on Cloudflare Workers.

Responsibilities:

-   Route definitions.
-   Request and response handling.
-   Middleware composition.
-   Error handling.
-   API grouping.

Example:

``` ts
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;
```

### Better Auth

Role: Authentication framework.

Responsibilities:

-   Registration and login.
-   Session creation and validation.
-   Cookie handling.
-   OAuth integrations if enabled.
-   Authentication database tables.

Authentication and authorization are different:

-   Authentication identifies the user.
-   Authorization determines whether that user may access a specific
    project or task.

The application must still enforce resource ownership and permissions in
its service layer.

Use the current Better Auth D1/Drizzle integration instructions and
generated schema for the selected version. Do not guess or rename
required auth fields.

### Zod

Role: Runtime validation.

Use it to validate:

-   API request bodies.
-   Query parameters.
-   Shared API contracts.
-   Gemini structured output.
-   AI refinement patch operations.
-   Settings and scheduling inputs.

Example:

``` ts
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  status: z.enum(["todo", "in_progress", "done"]),
});
```

Validation is especially important because AI output is not guaranteed
to be correct just because it is returned as JSON.

------------------------------------------------------------------------

## 4. Database

### Cloudflare D1

Role: Managed SQLite database integrated with Cloudflare Workers.

Planned data:

-   Better Auth user/session/account/verification records.
-   Projects.
-   Phases.
-   Tasks.
-   Task dependencies.
-   Milestones.
-   Project revisions.
-   Project conversations.
-   AI usage records.

Why D1 for the MVP:

-   Native integration with Workers.
-   SQLite is sufficient for the expected relational data model.
-   No separate PostgreSQL connection service is needed.
-   Simple deployment within the selected Cloudflare architecture.

Important considerations:

-   D1 is SQLite, not PostgreSQL.
-   Use SQLite-compatible schema types and SQL features.
-   A D1 database has platform limits and serial query processing;
    monitor actual workload as usage grows.
-   Use supported D1 batch/transaction patterns and verify the current
    Drizzle adapter behavior.

### Drizzle ORM

Role: TypeScript ORM and database toolkit.

Responsibilities:

-   Define tables and columns.
-   Define indexes and relations.
-   Build typed queries.
-   Generate and apply migrations.
-   Map database records into application types.

Example:

``` ts
const result = await db
  .select()
  .from(projects)
  .where(eq(projects.userId, userId));
```

Mental model:

-   D1 is where the data is stored.
-   Drizzle is the TypeScript interface used to define and query that
    data.

------------------------------------------------------------------------

## 5. AI integration

### Google Gemini API

Role: Initial LLM provider.

AI responsibilities:

-   Understand natural-language project descriptions.
-   Identify phases and tasks.
-   Estimate task effort/duration.
-   Suggest dependencies and milestones.
-   Identify assumptions and project risks.
-   Propose changes to an existing plan.

The AI should return structured data that is validated before use.

### Provider abstraction

Keep an application-level interface so the product is not coupled to
Gemini-specific code.

Conceptual example:

``` ts
interface AIProvider {
  generatePlan(input: ProjectRequest): Promise<GeneratedPlan>;
  refinePlan(input: RefinementRequest): Promise<PlanPatch>;
}
```

The Gemini implementation adapts the provider API to this interface.

This makes it possible to add or replace a provider later without
rewriting project services.

### Structured output and validation

Recommended flow:

``` text
User Description
      │
      ▼
Gemini API
      │
      ▼
Structured JSON
      │
      ▼
Zod Validation
      │
      ▼
Business Rule Validation
      │
      ▼
Scheduling Engine
      │
      ▼
Database Persistence
```

Do not trust generated output without validation. Handle malformed
output, missing fields, invalid references, provider errors, and
timeouts.

### AI refinement

Prefer patch-based refinement over regenerating the entire project.

For example, the AI can propose operations such as:

-   Add a task.
-   Update a task estimate.
-   Change a task description.
-   Add or remove a dependency.
-   Add a milestone.

The application validates the patch, checks permissions and dependency
integrity, recalculates affected dates, and records a revision.

------------------------------------------------------------------------

## 6. Scheduling Engine

### Implementation technology: Pure TypeScript

This is an application domain module, not an external SaaS product.

It should not depend on:

-   React or Next.js.
-   Hono or Cloudflare Workers.
-   Drizzle or D1.
-   Gemini.

### Responsibilities

  -----------------------------------------------------------------------
  Capability                          Purpose
  ----------------------------------- -----------------------------------
  Dependency graph                    Represent task prerequisites

  DAG validation                      Ensure dependencies are acyclic

  Topological Sort                    Determine a valid task processing
                                      order

  Cycle Detection                     Reject circular dependencies

  Working-day calculation             Respect configured workdays

  Date calculation                    Calculate task start and finish
                                      dates

  Parallel scheduling                 Schedule independent tasks
                                      concurrently

  Critical Path Method                Identify tasks that determine
                                      project duration
  -----------------------------------------------------------------------

### Initial scheduling assumptions

-   Start with Finish-to-Start dependencies.
-   Store task estimates as integer minutes.
-   Support configurable working days and hours per day.
-   Use an explicit project timezone.
-   Keep date calculations deterministic.
-   Validate all dependencies before scheduling.
-   Define how manual date changes affect downstream tasks before
    implementing automatic rescheduling.

The AI may suggest estimates and dependencies, but the scheduling engine
calculates the final dates.

------------------------------------------------------------------------

## 7. Date utilities

### date-fns

Role: Date manipulation utility library.

Potential uses:

-   Parsing and formatting dates.
-   Adding and comparing dates.
-   Calendar calculations.
-   Supporting display formatting.

Do not assume a date utility alone solves timezone and working-calendar
logic. Keep the project's scheduling rules explicit and testable. Use a
deliberate timezone strategy for project-local dates.

------------------------------------------------------------------------

## 8. Testing

### Vitest

Role: Unit and integration testing.

Best suited for:

-   Graph algorithms.
-   Cycle detection.
-   Topological sorting.
-   Critical path calculations.
-   Working-day calculations.
-   Zod schemas.
-   Service-level business rules.
-   AI response mapping.

### Playwright

Role: Browser-based end-to-end testing.

Example user journey:

1.  Open the application.
2.  Register and sign in.
3.  Create a project.
4.  Enter a natural-language description.
5.  Generate a plan.
6.  Review phases and tasks.
7.  Edit a task.
8.  Ask AI to refine the plan.
9.  Confirm the updated timeline.
10. Reload and verify persisted data.

------------------------------------------------------------------------

## 9. Development and deployment

### pnpm

Role: Package manager and monorepo workspace tooling.

Used for:

-   Installing dependencies.
-   Managing workspace packages.
-   Running scripts across apps and packages.
-   Sharing internal packages.

### Wrangler

Role: Cloudflare developer CLI.

Used for:

-   Local Worker development.
-   Local D1 development.
-   Database migrations.
-   Environment configuration.
-   Worker deployment.

### Cloudflare deployment

Target:

-   API: Cloudflare Workers.
-   Database: Cloudflare D1.
-   Secrets: Cloudflare Worker secrets.

The frontend deployment target remains a separate decision. If deploying
Next.js on Cloudflare, evaluate the current OpenNext adapter and its
compatibility. Do not assume every Next.js feature runs identically in
every deployment environment.

------------------------------------------------------------------------

## 10. Data and architecture principles

1.  AI handles interpretation, decomposition, estimation, and proposed
    refinements.
2.  Application code handles validation, authorization, dependency
    integrity, scheduling, and persistence.
3.  Use Zod at external data boundaries.
4.  Keep the scheduling engine deterministic and framework-independent.
5.  Keep the AI provider behind an interface.
6.  Keep database-specific code inside the database package/repository
    boundary.
7.  Enforce user ownership for every project-related operation.
8.  Store estimates as integer minutes to avoid floating-point duration
    ambiguity.
9.  Use SQLite-compatible schema design for D1.
10. Avoid microservices and extra infrastructure until real product
    requirements justify them.

------------------------------------------------------------------------

## 11. Stack learning order

  -----------------------------------------------------------------------
  Order                   Topic                   Practical outcome
  ----------------------- ----------------------- -----------------------
  1                       Cloudflare Workers      Run a local Worker and
                                                  understand bindings

  2                       Hono                    Build routes and
                                                  middleware

  3                       SQLite + D1             Create relational
                                                  tables and constraints

  4                       Drizzle ORM             Define schema and run
                                                  migrations

  5                       Better Auth             Register, log in,
                                                  validate sessions

  6                       Zod                     Validate API and AI
                                                  data

  7                       Gemini API              Generate a validated
                                                  project plan

  8                       Graph algorithms        Implement DAG and cycle
                                                  detection

  9                       Scheduling algorithms   Calculate working dates
                                                  and critical path

  10                      Zustand + frontend      Build interactive
                          integration             project editing

  11                      Vitest + Playwright     Test logic and user
                                                  workflows

  12                      Cloudflare deployment   Deploy and verify the
                                                  MVP
  -----------------------------------------------------------------------

## 12. Explicitly not in the initial stack

Avoid adding these without a concrete need:

-   Neon / PostgreSQL: not needed for the current D1-first architecture.
-   Prisma: Drizzle is the selected ORM.
-   Hyperdrive: not needed when using D1.
-   Redis: no current cache or distributed coordination requirement.
-   Microservices: a modular monolith is sufficient for the MVP.
-   Message queues: defer until asynchronous workload and reliability
    needs justify them.
-   Multiple AI providers: start with Gemini behind an abstraction, then
    add alternatives only when useful.

------------------------------------------------------------------------

## 13. MVP completion criteria

The stack is successfully integrated when:

-   A user can register, sign in, and sign out.
-   A user can create and manage private projects.
-   Gemini can generate a structured project plan.
-   Invalid AI output is rejected safely.
-   Task dependencies are validated and cycles are rejected.
-   The scheduling engine calculates dates deterministically.
-   The user can edit tasks and view a timeline.
-   AI can propose changes to an existing plan.
-   Revisions and AI usage are persisted.
-   Automated tests cover core business rules and user journeys.
-   The application is deployed and its production workflow is verified.
