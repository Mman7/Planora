# AI Project Planner

AI Project Planner is a pnpm monorepo containing a Next.js frontend, a Cloudflare Workers API, a Cloudflare D1 database, and shared TypeScript packages.

## Prerequisites

- Node.js 20 or later
- pnpm 10
- Wrangler (already installed as an API workspace development dependency)

Check your pnpm version:

```bash
pnpm --version
```

## Install Dependencies

Run this from the project root:

```bash
pnpm install
```

## Configure API Environment Variables

Copy the example configuration file.

PowerShell:

```powershell
Copy-Item apps/api/.dev.vars.example apps/api/.dev.vars
```

macOS/Linux:

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

Then edit `apps/api/.dev.vars` and set a random `BETTER_AUTH_SECRET`:

```dotenv
BETTER_AUTH_SECRET="replace-with-a-random-local-secret"
BETTER_AUTH_URL="http://localhost:8787"
CORS_ORIGIN="http://localhost:3000"
```

`.dev.vars` is for local development only and must not be committed to Git.

## Initialize the Local Database

Run this from the project root on the first setup or whenever migration files change:

```bash
pnpm db:migrate:local
```

If you change the database schema, generate a migration first:

```bash
pnpm db:generate
pnpm db:migrate:local
```

## Start the Development Environment

Open two terminals and keep both processes running.

Terminal 1, start the API:

```bash
pnpm dev:api
```

API default URL: <http://localhost:8787>

Terminal 2, start the web app:

```bash
pnpm dev:web
```

Web default URL: <http://localhost:3000>

API health check: <http://localhost:8787/api/health>

## Common Commands

```bash
# Start the frontend
pnpm dev:web

# Start the API
pnpm dev:api

# Run API tests
pnpm test:api

# Type-check all workspaces
pnpm typecheck:all

# Check code style
pnpm lint

# Automatically fix code style issues
pnpm lint:fix

# Build all workspaces
pnpm build

# Open the Drizzle database management interface
pnpm db:studio

# Generate the Postman collection
pnpm postman:generate
```

The generated collection is written to `postman/ai-project-planner.postman_collection.json`.
Import this file into Postman, set the `baseUrl` variable if needed, and replace the
`projectId`, `phaseId`, and `taskId` variables with IDs from your local data.

## Project Structure

```text
apps/web              Next.js frontend
apps/api              Cloudflare Workers + Hono API
packages/database     Drizzle schema and D1 migrations
packages/shared       Shared types and schemas
packages/ai           AI capabilities
packages/scheduling-engine
                      Project scheduling engine
docs                  Architecture, design, and technology docs
```

## Production Build and Deployment

Build all workspaces:

```bash
pnpm build
```

Deploy the API to Cloudflare:

```bash
pnpm --filter api deploy
```

Before deploying, configure `BETTER_AUTH_SECRET` and other required secrets in the Cloudflare environment. Also verify the D1 database binding and migration configuration.
