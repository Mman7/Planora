# AI Project Planner — Complete UI Design Brief

## 1. Product Overview

Design a modern AI-powered Project Planner SaaS application.

The product helps users turn natural-language project ideas into structured, actionable project plans. Users can generate phases, tasks, subtasks, dependencies, milestones, estimates, and timelines with AI assistance.

The product should feel like a friendly and intelligent AI assistant that helps people organize and execute projects without overwhelming them with complicated project-management interfaces.

The interface should combine:

- The simplicity and approachability of Notion.
- The structured information hierarchy of modern productivity software.
- A helpful, context-aware AI assistant integrated into the workspace.

Do not directly copy any existing product.

## 2. Brand Personality

Design direction: **Soft Intelligent Minimalism**

Brand characteristics:

- Friendly
- Intelligent
- Calm
- Approachable
- Organized
- Reliable
- Modern

The first impression should communicate:
"This product makes project planning feel simple and manageable."

Avoid making the product look like traditional enterprise software or a generic AI chatbot.

## 3. Visual Design System

### Color Palette

Use a soft lavender and cool-white visual identity.

Brand colors:

- Primary: #7663C8
- Primary Hover: #9385D8
- Primary Soft: #F0EDFA
- Primary Border: #E4DFF5

Neutral colors:

- App Background: #F7F8FC
- Surface: #FFFFFF
- Muted Surface: #F0F2F7
- Border: #E5E7EF
- Primary Text: #25243A
- Secondary Text: #77788A

Semantic colors should be muted and soft:

- Success: background #E8F4EC, text #568568
- Warning: background #FBF2DF, text #A7803D
- Error: background #F9EAEA, text #B96B72
- Info: background #E9F0FA, text #6483B2

Use additional muted pastel colors such as blue, teal, pink, and orange to distinguish project categories and task groups.

Do not use saturated neon colors.

### Typography

Use Geist Sans as the primary typeface.

Use Geist Mono sparingly for technical metadata, identifiers, and keyboard shortcuts.

Typography scale:

- Page title: 28px / semibold
- Section title: 20px / semibold
- Panel title: 16px / semibold
- Body: 14px / regular
- Secondary text: 13px
- Labels and metadata: 12px

Maintain readable line heights and clear typography hierarchy.

### Spacing and Shape

Use a consistent 4px spacing system.

Important spacing values:
4, 8, 12, 16, 20, 24, 32, 40, 48px.

Border radius:

- Inputs and buttons: 6px
- Cards and panels: 8px
- Dropdowns and modals: 6–8px
- Badges: 4px
- Avatars: circular

Use subtle 1px borders.

Use gray-white surface layers to create visual hierarchy instead of excessive shadows.

Only use subtle shadows for floating elements such as dropdowns, popovers, and modals.

## 4. Global Application Layout

Design desktop-first, using 1440px as the primary reference width.

The main application layout must have three areas:

### Left Sidebar — Fixed Navigation

Width: approximately 230px.

Keep the sidebar expanded by default.

Include:

- Product logo and name
- Workspace
- My Projects
- Inbox
- Templates
- Settings
- User profile at the bottom

Each navigation item should have a consistent line icon and label.

The active navigation item should use a soft lavender background and purple text/icon.

Avoid individual cards around every navigation item.

### Center — Main Workspace

This is the primary working area.

Use flexible width with approximately 24–32px content padding.

Keep the content organized with:

- Clear page titles
- Descriptive secondary text
- Primary actions aligned consistently
- Well-organized lists and sections
- Comfortable whitespace

Prefer lists, grouped content, and lightweight panels over excessive cards.

### Right — AI Assistant Panel

Width: approximately 320px.

The AI Assistant should be a fixed right-side panel on desktop.

Include:

- Assistant identity and status
- Context of the currently opened project
- Conversation messages
- Suggested prompts
- AI-generated recommendations
- Message input area

The panel should be collapsible so users can expand the main workspace when needed.

The AI Assistant must feel like a helpful teammate, not the visual center of the entire application.

## 5. Required Screens

Create a consistent design system across these six screens.

### Screen 1 — Dashboard

Purpose:
Help users quickly continue their work.

Include:

- Friendly welcome message
- Create Project primary button
- Recent projects
- Projects grouped by recent activity or status
- Upcoming tasks
- Recent activity

Avoid excessive dashboard metric cards.

The page should feel clean, welcoming, and immediately understandable.

### Screen 2 — Create Project

Purpose:
Allow users to describe their project in natural language.

Include:

- Clear page title
- Large project description input
- Helpful example prompts
- Optional project name and preferences
- Generate Project Plan button
- AI clarification state

The experience should make it obvious that users can simply describe an idea instead of manually filling out a complicated form.

Show a friendly empty state before the user starts.

### Screen 3 — Project Workspace

This is the most important screen.

Include:

- Project name and description
- Project status
- Project progress
- Start date and target date
- Project phases
- Task list grouped by phase
- Task status and priority
- Assignees
- Due dates
- Add task and add phase actions
- Switch between Overview, Tasks, and Timeline views

Keep task information scannable.

Use subtle pastel colors to distinguish phases and statuses.

The right-side AI Assistant should understand the current project context.

### Screen 4 — Timeline / Gantt View

Design a clean and modern project timeline.

Include:

- Timeline header
- Date scale
- Task rows grouped by phase
- Task duration bars
- Milestone markers
- Dependency connectors
- Today indicator
- Task progress
- Zoom controls
- Date navigation

Use muted pastel colors for task bars.

Use purple as the main selected-task or active interaction color.

Ensure text and dates remain readable.

Avoid excessive grid lines, visual clutter, and complicated decorations.

Prioritize readability and dependency visibility.

### Screen 5 — AI Assistant

Design the assistant experience as an extension of the project workspace.

Include:

- Conversation history
- Context-aware messages
- Suggested prompts
- AI-generated project improvements
- Task generation suggestions
- Dependency recommendations
- Risk analysis suggestions

Important interaction:

When AI proposes changes, show a structured change preview.

For example:
"Add a testing phase"

Show:

- 3 new tasks
- 2 new dependencies
- Updated estimated timeline

Provide two clear actions:

- Reject
- Apply Changes

AI must never silently modify the user's existing project plan.

Use a soft lavender background to distinguish AI-generated proposals.

### Screen 6 — Settings

Include:

- Profile settings
- Workspace preferences
- Working days and working hours
- Calendar settings
- AI provider configuration
- Notification preferences
- Account settings

Keep settings grouped and easy to navigate.

## 6. Component Design Language

Create consistent reusable components.

Buttons:

- Primary: solid purple background with white text.
- Secondary: subtle outlined button.
- Tertiary: ghost button.
- Destructive: muted red treatment.

Inputs:

- White background.
- Subtle neutral border.
- Clear focus state using purple.
- Friendly placeholder text.

Cards:

- White or muted gray-white background.
- Subtle border.
- 8px radius.
- Avoid unnecessary shadows.

Badges:

- Soft pastel backgrounds.
- Muted readable text.
- Small and compact.

Other components:

- Tabs
- Dropdowns
- Tooltips
- Modals
- Toast notifications
- Progress bars
- Checkboxes
- Task rows
- Empty states
- Skeleton loading states

Use consistent Lucide-style line icons.

## 7. UX Writing

Use friendly, concise, natural language.

Examples:

- "Create your project"
- "What are you planning to build?"
- "Your project plan is ready"
- "Nothing here yet"
- "Let's improve your project plan"
- "Thinking through your plan..."

Avoid overly technical or robotic system messages.

## 8. Interaction and Responsive Behavior

Desktop:

- Fixed expanded sidebar.
- Flexible main workspace.
- Collapsible right AI panel.

Tablet:

- Sidebar can collapse.
- AI panel can become a drawer.

Mobile:

- Use a compact navigation pattern.
- AI assistant should open as a full-screen or bottom-sheet experience.
- Avoid squeezing the desktop three-column layout into a narrow screen.
- Timeline should support horizontal scrolling.

Use subtle interactions:

- 120–180ms hover transitions.
- 150–200ms dropdown and modal transitions.
- 200–250ms page transitions.

Respect reduced-motion preferences.

## 9. Strict Design Constraints

DO:

- Use Soft Minimalism.
- Use a soft lavender and cool-white palette.
- Maintain balanced information density.
- Prioritize readability and usability.
- Use subtle borders and background layers.
- Keep the AI assistant contextual and helpful.
- Maintain consistent components across all screens.

DO NOT:

- Use excessive gradients.
- Use Glassmorphism.
- Use blurred transparent panels.
- Use neon colors.
- Use excessive rounded corners.
- Use too many floating cards.
- Use excessive dashboard statistics.
- Make the AI chat the entire product.
- Add decorative elements without a functional purpose.
- Make the Gantt chart visually complicated.

## 10. Final Design Goal

The final result should look like a polished, production-ready SaaS application.

It should feel friendly enough for beginners, structured enough for serious project planning, and intelligent enough to communicate the value of AI assistance.

The design should be visually calm but not boring, minimal but not empty, and colorful but not overwhelming.

Consistency across all six screens is more important than making each screen visually unique.
