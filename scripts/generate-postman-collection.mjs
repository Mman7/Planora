import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const outputPath = resolve(root, "postman/ai-project-planner.postman_collection.json");
const projectsApiPrefix = "/api/projects";

const routeSources = [
  {
    file: "apps/api/src/modules/projects/project.routes.ts",
    prefix: projectsApiPrefix,
  },
  {
    file: "apps/api/src/modules/planning/planning.routes.ts",
    prefix: projectsApiPrefix,
  },
];

const methodNames = new Set(["get", "post", "patch", "delete"]);

function readConstants(source) {
  return Object.fromEntries(
    [...source.matchAll(/const\s+(\w+)\s*=\s*["'`]([^"'`]+)["'`]/g)].map((match) => [
      match[1],
      match[2],
    ]),
  );
}

function resolveRouteExpression(expression, constants) {
  const value = expression.trim();
  if (constants[value]) return constants[value];

  const literal = value.match(/^["'`](.*)["'`]$/s)?.[1];
  if (literal) {
    return literal.replace(/\$\{(\w+)\}/g, (_, name) => constants[name] ?? `:${name}`);
  }

  return value;
}

async function collectRoutes() {
  const routes = [
    { method: "GET", path: "/api/health", name: "Health check" },
    { method: "POST", path: "/api/auth/sign-up/email", name: "Register with email" },
    { method: "POST", path: "/api/auth/sign-in/email", name: "Sign in with email" },
    { method: "POST", path: "/api/auth/sign-out", name: "Sign out" },
    { method: "GET", path: "/api/auth/me", name: "Get current user" },
    { method: "GET", path: "/api/auth/*", name: "Auth callback" },
    { method: "POST", path: "/api/auth/*", name: "Auth action" },
  ];

  for (const routeSource of routeSources) {
    const source = await readFile(resolve(root, routeSource.file), "utf8");
    const constants = readConstants(source);
    const routePattern = /\b(\w+)\.(get|post|patch|delete)\(\s*([\s\S]*?)\s*,\s*[^)]/g;

    for (const match of source.matchAll(routePattern)) {
      const [, variable, method, expression] = match;
      if (!methodNames.has(method) || !variable.endsWith("Routes")) continue;

      const path = resolveRouteExpression(expression, constants);
      routes.push({
        method: method.toUpperCase(),
        path: `${routeSource.prefix}${path === "/" ? "" : path}`,
        name: `${method.toUpperCase()} ${path}`,
      });
    }
  }

  return routes;
}

function requestBody(path, method) {
  if (method === "POST" && path === "/api/auth/sign-up/email") {
    return { name: "Aisha Musa", email: "{{email}}", password: "{{password}}" };
  }
  if (method === "POST" && path === "/api/auth/sign-in/email") {
    return { email: "{{email}}", password: "{{password}}" };
  }
  if (method === "POST" && path === "/api/projects") {
    return { name: "New project", description: "Project description", priority: "MEDIUM" };
  }
  if (method === "POST" && path.endsWith("/phases")) {
    return { name: "Planning phase", position: 0 };
  }
  if (method === "POST" && path.endsWith("/tasks")) {
    return { title: "First task", priority: "MEDIUM", estimatedMinutes: 60 };
  }
  if (path.endsWith("/dependencies")) {
    return { dependsOnTaskId: "{{taskId}}" };
  }
  if (method === "PATCH" && path.includes("/projects/")) {
    return { name: "Updated name" };
  }
  return null;
}

function toPostmanRequest(route) {
  const pathParts = route.path
    .split("/")
    .filter(Boolean)
    .map((part) => (part.startsWith(":") ? `{{${part.slice(1)}}}` : part));
  const body = requestBody(route.path, route.method);
  const request = {
    name: route.name,
    request: {
      method: route.method,
      header: body ? [{ key: "Content-Type", value: "application/json" }] : [],
      url: {
        raw: `{{baseUrl}}/${pathParts.join("/")}`,
        host: ["{{baseUrl}}"],
        path: pathParts,
      },
    },
  };

  if (body) {
    request.request.body = {
      mode: "raw",
      raw: `${JSON.stringify(body, null, 2)}\n`,
      options: { raw: { language: "json" } },
    };
  }

  return request;
}

const routes = await collectRoutes();
const collection = {
  info: {
    name: "AI Project Planner API",
    description: "Generated from the Hono route definitions.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:8787" },
    { key: "email", value: "you@example.com" },
    { key: "password", value: "replace-with-password" },
    { key: "projectId", value: "replace-with-project-id" },
    { key: "phaseId", value: "replace-with-phase-id" },
    { key: "taskId", value: "replace-with-task-id" },
  ],
  item: routes.map(toPostmanRequest),
};

await mkdir(resolve(root, "postman"), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(collection, null, 2)}\n`);
