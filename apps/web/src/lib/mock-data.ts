export type View =
  "dashboard" | "create" | "project" | "assistant" | "settings";
export type ProjectTab = "overview" | "tasks" | "timeline";
export type TaskStatus = "Done" | "In progress" | "To do";
export type Priority = "High" | "Medium";

const TODO_STATUS: TaskStatus = "To do";
const HIGH_PRIORITY: Priority = "High";
const DONE_STATUS: TaskStatus = "Done";
const IN_PROGRESS_STATUS: TaskStatus = "In progress";
const MEDIUM_PRIORITY: Priority = "Medium";
const PURPLE_TONE = "purple" as const;
const EDITED_RECENTLY = "Edited 2 hours ago";

export type Task = {
  id: string;
  name: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  due: string;
  start: number;
  span: number;
  progress: number;
};

export type Phase = {
  id: string;
  name: string;
  tone: "teal" | "purple" | "orange" | "pink";
  tasks: Task[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: "In progress" | "On track" | "At risk";
  progress: number;
  tone: "purple" | "teal" | "orange";
  edited: string;
  phases: Phase[];
};

export const PROJECTS: Project[] = [
  {
    id: "mobile-app",
    name: "Mobile app launch",
    description: "A booking app for local fitness classes.",
    status: IN_PROGRESS_STATUS,
    progress: 64,
    tone: PURPLE_TONE,
    edited: EDITED_RECENTLY,
    phases: [
      {
        id: "discovery",
        name: "Discovery",
        tone: "teal",
        tasks: [
          {
            id: "interviews",
            name: "User interviews",
            status: DONE_STATUS,
            priority: HIGH_PRIORITY,
            assignee: "SM",
            due: "12 Nov",
            start: 5,
            span: 8,
            progress: 100,
          },
          {
            id: "competitor",
            name: "Competitor review",
            status: DONE_STATUS,
            priority: MEDIUM_PRIORITY,
            assignee: "AM",
            due: "18 Nov",
            start: 10,
            span: 7,
            progress: 100,
          },
        ],
      },
      {
        id: "design",
        name: "Design",
        tone: PURPLE_TONE,
        tasks: [
          {
            id: "wireframes",
            name: "Onboarding flow wireframes",
            status: IN_PROGRESS_STATUS,
            priority: HIGH_PRIORITY,
            assignee: "SM",
            due: "28 Nov",
            start: 18,
            span: 10,
            progress: 60,
          },
          {
            id: "style-guide",
            name: "Visual style guide",
            status: TODO_STATUS,
            priority: MEDIUM_PRIORITY,
            assignee: "JL",
            due: "5 Dec",
            start: 25,
            span: 10,
            progress: 0,
          },
        ],
      },
      {
        id: "build",
        name: "Build",
        tone: "orange",
        tasks: [
          {
            id: "booking-api",
            name: "Class booking API",
            status: IN_PROGRESS_STATUS,
            priority: HIGH_PRIORITY,
            assignee: "AM",
            due: "19 Dec",
            start: 29,
            span: 15,
            progress: 45,
          },
          {
            id: "payments",
            name: "Payments integration",
            status: TODO_STATUS,
            priority: "High",
            assignee: "JL",
            due: "9 Jan",
            start: 38,
            span: 12,
            progress: 0,
          },
        ],
      },
    ],
  },
  {
    id: "website",
    name: "Website redesign",
    description: "A calmer, clearer website for a growing studio.",
    status: "On track",
    progress: 38,
    tone: "teal",
    edited: EDITED_RECENTLY,
    phases: [],
  },
  {
    id: "content",
    name: "Q1 content calendar",
    description: "Plan a thoughtful editorial rhythm for the new year.",
    status: "At risk",
    progress: 82,
    tone: "orange",
    edited: EDITED_RECENTLY,
    phases: [],
  },
];

export const UPCOMING_TASKS = [
  ["Finalize onboarding flow", "Today"],
  ["Review API contract", "Tomorrow"],
  ["Draft launch announcement", "Fri, 28 Nov"],
  ["Book usability sessions", "Mon, 1 Dec"],
] as const;

export const RECENT_ACTIVITY = [
  ["Sam completed", "Wireframes", "1h ago"],
  ["AI added 4 tasks to", "Website redesign", "3h ago"],
  ["You created", "Q1 content calendar", "Yesterday"],
] as const;

export const DATE_LABELS = [
  "Nov 24",
  "Dec 1",
  "Dec 8",
  "Dec 15",
  "Dec 22",
  "Dec 29",
];
