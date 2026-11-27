const apiUrl = process.env.API_URL ?? "http://localhost:8787";
const origin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const credentials = {
  name: "Demo Planner",
  email: process.env.SEED_EMAIL ?? "demo@ai-project-planner.local",
  password: process.env.SEED_PASSWORD ?? "DemoPlanner123!",
};

let cookie = "";

function updateCookie(response) {
  const cookies = response.headers.getSetCookie?.() ?? [];
  if (cookies.length > 0) {
    cookie = cookies.map((value) => value.split(";", 1)[0]).join("; ");
  }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  if (!headers.has("origin")) headers.set("origin", origin);
  if (options.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);

  const response = await fetch(`${apiUrl}${path}`, { ...options, headers });
  updateCookie(response);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message ?? body?.message ?? response.statusText;
    throw new Error(`${options.method ?? "GET"} ${path} failed (${response.status}): ${message}`);
  }
  return body;
}

async function authenticate() {
  const signUp = await fetch(`${apiUrl}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(credentials),
  });
  updateCookie(signUp);

  if (signUp.ok) {
    console.log(`Created seed account: ${credentials.email}`);
    return;
  }

  await request("/api/auth/sign-in/email", {
    method: "POST",
    body: JSON.stringify({ email: credentials.email, password: credentials.password }),
  });
  console.log(`Signed in with existing seed account: ${credentials.email}`);
}

async function createProject(project) {
  const projects = (await request("/api/projects?limit=100")).data.items;
  const existing = projects.find((item) => item.name === project.name);
  if (existing) {
    console.log(`Skipped existing project: ${existing.name}`);
    return;
  }

  const createdProject = (
    await request("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        name: project.name,
        description: project.description,
        color: project.color,
        icon: project.icon,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        dueDate: project.dueDate,
      }),
    })
  ).data;

  const phaseIds = {};
  for (const phase of project.phases) {
    const createdPhase = (
      await request(`/api/projects/${createdProject.id}/phases`, {
        method: "POST",
        body: JSON.stringify({
          name: phase.name,
          description: phase.description,
          position: phase.position,
          startDate: phase.startDate,
          endDate: phase.endDate,
        }),
      })
    ).data;
    phaseIds[phase.key] = createdPhase.id;
  }

  const taskIds = {};
  for (const task of project.tasks) {
    const createdTask = (
      await request(`/api/projects/${createdProject.id}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          phaseId: task.phaseKey ? phaseIds[task.phaseKey] : undefined,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          startDate: task.startDate,
          dueDate: task.dueDate,
          estimatedMinutes: task.estimatedMinutes,
          actualMinutes: task.actualMinutes,
          position: task.position,
        }),
      })
    ).data;
    taskIds[task.key] = createdTask.id;
  }

  for (const dependency of project.dependencies) {
    await request(
      `/api/projects/${createdProject.id}/tasks/${taskIds[dependency.taskKey]}/dependencies`,
      {
        method: "POST",
        body: JSON.stringify({ dependsOnTaskId: taskIds[dependency.dependsOnTaskKey] }),
      },
    );
  }

  console.log(`Created project: ${createdProject.name}`);
}

const projects = [
  {
    name: "Mobile App Launch",
    description: "Launch a booking app for local fitness classes.",
    color: "#7663c8",
    icon: "smartphone",
    status: "ACTIVE",
    priority: "HIGH",
    startDate: "2026-12-01",
    dueDate: "2027-02-28",
    phases: [
      {
        key: "discovery",
        name: "Discovery",
        description: "Understand users and validate the first release.",
        position: 0,
        startDate: "2026-12-01",
        endDate: "2026-12-14",
      },
      {
        key: "build",
        name: "Build",
        description: "Implement the core booking experience.",
        position: 1,
        startDate: "2026-12-15",
        endDate: "2027-02-07",
      },
      {
        key: "launch",
        name: "Launch",
        description: "Prepare the beta release and measure adoption.",
        position: 2,
        startDate: "2027-02-08",
        endDate: "2027-02-28",
      },
    ],
    tasks: [
      {
        key: "interviews",
        title: "Interview five target users",
        description: "Capture booking habits, pain points, and must-have features.",
        phaseKey: "discovery",
        status: "DONE",
        priority: "HIGH",
        startDate: "2026-12-01",
        dueDate: "2026-12-05",
        estimatedMinutes: 600,
        actualMinutes: 540,
        position: 0,
      },
      {
        key: "wireframes",
        title: "Create onboarding wireframes",
        description: "Design the first-run flow from sign-up through class booking.",
        phaseKey: "discovery",
        status: "IN_PROGRESS",
        priority: "HIGH",
        startDate: "2026-12-06",
        dueDate: "2026-12-14",
        estimatedMinutes: 480,
        position: 1,
      },
      {
        key: "booking-api",
        title: "Implement class booking API",
        description: "Support class availability, reservations, and cancellation.",
        phaseKey: "build",
        status: "TODO",
        priority: "URGENT",
        startDate: "2026-12-15",
        dueDate: "2027-01-10",
        estimatedMinutes: 1200,
        position: 0,
      },
      {
        key: "payments",
        title: "Add payment integration",
        description: "Connect checkout and handle failed payments gracefully.",
        phaseKey: "build",
        status: "TODO",
        priority: "HIGH",
        startDate: "2027-01-11",
        dueDate: "2027-01-24",
        estimatedMinutes: 900,
        position: 1,
      },
      {
        key: "beta",
        title: "Run private beta",
        description: "Invite a small group of customers and collect launch feedback.",
        phaseKey: "launch",
        status: "TODO",
        priority: "MEDIUM",
        startDate: "2027-02-08",
        dueDate: "2027-02-21",
        estimatedMinutes: 600,
        position: 0,
      },
    ],
    dependencies: [
      { taskKey: "wireframes", dependsOnTaskKey: "interviews" },
      { taskKey: "booking-api", dependsOnTaskKey: "wireframes" },
      { taskKey: "payments", dependsOnTaskKey: "booking-api" },
      { taskKey: "beta", dependsOnTaskKey: "payments" },
    ],
  },
  {
    name: "Website Redesign",
    description: "Create a clearer marketing site for a growing studio.",
    color: "#2d8c83",
    icon: "globe",
    status: "PLANNING",
    priority: "MEDIUM",
    startDate: "2027-01-04",
    dueDate: "2027-02-12",
    phases: [
      {
        key: "content",
        name: "Content",
        description: "Clarify the message and page structure.",
        position: 0,
        startDate: "2027-01-04",
        endDate: "2027-01-15",
      },
      {
        key: "design",
        name: "Design",
        description: "Shape the visual system and key pages.",
        position: 1,
        startDate: "2027-01-18",
        endDate: "2027-01-29",
      },
      {
        key: "delivery",
        name: "Delivery",
        description: "Build, review, and publish the new site.",
        position: 2,
        startDate: "2027-02-01",
        endDate: "2027-02-12",
      },
    ],
    tasks: [
      {
        key: "audit",
        title: "Audit existing site",
        description: "Review analytics, navigation, and content gaps.",
        phaseKey: "content",
        status: "TODO",
        priority: "MEDIUM",
        startDate: "2027-01-04",
        dueDate: "2027-01-08",
        estimatedMinutes: 360,
        position: 0,
      },
      {
        key: "messaging",
        title: "Approve homepage messaging",
        description: "Agree on the headline, proof points, and primary CTA.",
        phaseKey: "content",
        status: "TODO",
        priority: "HIGH",
        startDate: "2027-01-11",
        dueDate: "2027-01-15",
        estimatedMinutes: 240,
        position: 1,
      },
      {
        key: "prototype",
        title: "Prototype homepage",
        description: "Create a responsive homepage prototype for review.",
        phaseKey: "design",
        status: "TODO",
        priority: "HIGH",
        startDate: "2027-01-18",
        dueDate: "2027-01-29",
        estimatedMinutes: 720,
        position: 0,
      },
      {
        key: "build",
        title: "Build and publish site",
        description: "Implement approved pages and complete the launch checklist.",
        phaseKey: "delivery",
        status: "TODO",
        priority: "MEDIUM",
        startDate: "2027-02-01",
        dueDate: "2027-02-12",
        estimatedMinutes: 1200,
        position: 0,
      },
    ],
    dependencies: [
      { taskKey: "messaging", dependsOnTaskKey: "audit" },
      { taskKey: "prototype", dependsOnTaskKey: "messaging" },
      { taskKey: "build", dependsOnTaskKey: "prototype" },
    ],
  },
];

try {
  await authenticate();
  for (const project of projects) await createProject(project);
  console.log("Seed complete.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  console.error(
    `Make sure the API is running at ${apiUrl} and local migrations have been applied.`,
  );
  process.exitCode = 1;
}
