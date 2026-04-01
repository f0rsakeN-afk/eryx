export const STATIC_RESPONSE = `
## Overview

Here's a comprehensive showcase of every supported response format.

---

## 1. Email Template

\`\`\`email
Subject: Sick Leave Request — [Your Name]

Dear [Manager's Name],

I hope you are doing well. I am writing to inform you that I am currently unwell and will not be able to attend work today. I would like to request sick leave for [date].

Thank you for your understanding.

Sincerely,
[Your Name]
\`\`\`

---

## 2. Timeline

\`\`\`timeline
{
  "title": "Product Roadmap",
  "items": [
    { "title": "Project Kickoff", "description": "Initial planning, team onboarding, and design system setup.", "date": "Jan 2024", "status": "done" },
    { "title": "Alpha Release", "description": "Core chat UI, authentication, and basic AI integration.", "date": "Mar 2024", "status": "done" },
    { "title": "Beta Launch", "description": "Public beta with formatting engine and media support.", "date": "Jun 2024", "status": "active" },
    { "title": "v1.0 GA", "description": "Full production release with billing and teams.", "date": "Q4 2024", "status": "upcoming" },
    { "title": "Mobile Apps", "description": "iOS and Android clients.", "date": "2025", "status": "upcoming" }
  ]
}
\`\`\`

---

## 3. Comparison

\`\`\`comparison
{
  "title": "Frontend Frameworks",
  "items": [
    {
      "name": "Next.js",
      "badge": "Recommended",
      "description": "Full-stack React framework with SSR, SSG, and edge support.",
      "features": ["App Router & RSC", "Built-in optimizations", "Edge & serverless ready"],
      "highlight": true
    },
    {
      "name": "Remix",
      "description": "Web standards-first React framework focused on progressive enhancement.",
      "features": ["Nested routing", "Progressive enhancement", "Great data loading"]
    },
    {
      "name": "Vite + React",
      "description": "Minimal SPA setup with lightning-fast HMR.",
      "features": ["Blazing fast HMR", "Zero opinions", "Great for SPAs"]
    }
  ]
}
\`\`\`

---

## 4. Terminal Output

\`\`\`terminal
$ bun install
bun install v1.1.0
 + next@16.2.1
 + react@19.2.4
 + tailwindcss@4.0.0
106 packages installed [3.2s]

$ bun run build
> next build

   ▲ Next.js 16.2.1
   Creating an optimized production build...

✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages (12/12)

Route (app)               Size     First Load JS
┌ ○ /                     4.2 kB         102 kB
├ ○ /home                 6.8 kB         108 kB
└ ƒ /chat/[id]            9.1 kB         112 kB

✓ Build complete in 18.4s
\`\`\`

---

## 5. Metrics

\`\`\`metric
{
  "title": "Dashboard Overview",
  "items": [
    { "label": "Monthly Revenue", "value": "$48.2K", "trend": "+12.4% vs last month", "up": true },
    { "label": "Active Users", "value": "24.5K", "trend": "+8.1%", "up": true },
    { "label": "Churn Rate", "value": "2.1%", "trend": "-0.4%", "up": false, "description": "Lower is better" },
    { "label": "Avg Session", "value": "6m 32s", "trend": "+18s", "up": true }
  ]
}
\`\`\`

---

## 6. Kanban Board

\`\`\`kanban
{
  "title": "Sprint 14",
  "columns": [
    {
      "title": "To Do",
      "items": ["Design system audit", "Write integration tests", "Update onboarding flow"]
    },
    {
      "title": "In Progress",
      "items": ["Auth middleware refactor", "Dashboard chart components"]
    },
    {
      "title": "Done",
      "items": ["CI/CD pipeline setup", "Project scaffolding", "Dark mode support"]
    }
  ]
}
\`\`\`

---

## 7. Mermaid Diagram

\`\`\`mermaid
graph TD
  A[User] -->|HTTP Request| B[API Gateway]
  B --> C{Auth Service}
  C -->|Valid Token| D[Chat Service]
  C -->|Invalid| E[401 Unauthorized]
  D --> F[(Vector DB)]
  D --> G[LLM API]
  G -->|Stream| H[SSE Response]
  H -->|Rendered| A
\`\`\`

---

## 8. Flashcards

\`\`\`flashcard
{
  "title": "React Concepts",
  "cards": [
    {
      "front": "What is the difference between useMemo and useCallback?",
      "back": "useMemo memoizes a computed value; useCallback memoizes a function reference. Both prevent unnecessary recalculations on re-renders."
    },
    {
      "front": "When does React bail out of rendering a child?",
      "back": "When wrapped in React.memo and props are shallowly equal, or when a state update produces the same value as the current state."
    },
    {
      "front": "What is the purpose of the key prop in lists?",
      "back": "It gives React a stable identity for each element so it can efficiently diff, reorder, and reconcile list items without recreating DOM nodes."
    }
  ]
}
\`\`\`

---

## 9. Poll

\`\`\`poll
{
  "question": "Which AI assistant do you use most at work?",
  "options": [
    { "label": "ChatGPT", "votes": 1840 },
    { "label": "Claude", "votes": 1320 },
    { "label": "Gemini", "votes": 740 },
    { "label": "Copilot", "votes": 620 },
    { "label": "Other", "votes": 280 }
  ]
}
\`\`\`

---

## 10. File Tree

\`\`\`file-tree
frontend/
  app/
    (main)/
      home/
        page.tsx
      chat/
        [id]/
          page.tsx
    layout.tsx
  components/
    main/
      chat/
        ai-response-formatter.tsx
        format/
          code-block.tsx
          chart-visualizer.tsx
          timeline.tsx
          mermaid.tsx
    ui/
      button.tsx
      sidebar.tsx
  lib/
    utils.ts
  package.json
  tailwind.config.ts
\`\`\`

---

## 11. Persona Card

\`\`\`persona
{
  "name": "Priya Nair",
  "role": "Lead Frontend Engineer · 7 years experience",
  "avatar": "PN",
  "bio": "Obsessed with design systems, performance budgets, and shipping fast. Believes every millisecond of TTI is a moral failing.",
  "tags": ["React", "TypeScript", "Design Systems", "a11y"],
  "traits": [
    { "label": "Technical depth", "value": 92 },
    { "label": "Design sensitivity", "value": 85 },
    { "label": "Process maturity", "value": 74 },
    { "label": "Mentorship", "value": 88 }
  ]
}
\`\`\`

---

## 12. Diff Viewer

\`\`\`diff
--- a/lib/utils.ts
+++ b/lib/utils.ts
@@ -1,6 +1,8 @@
 import { clsx } from 'clsx'
-import { twMerge } from 'tailwind-merge'
+import { twMerge, type ClassValue } from 'tailwind-merge'

-export function cn(...inputs: any[]) {
+export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs))
 }
+
+export const noop = () => {}
\`\`\`

---

## 13. Charts

\`\`\`chart
{
  "type": "bar",
  "title": "Weekly Active Users",
  "items": [
    { "name": "Mon", "value": 3200 },
    { "name": "Tue", "value": 4100 },
    { "name": "Wed", "value": 3800 },
    { "name": "Thu", "value": 5200 },
    { "name": "Fri", "value": 4700 },
    { "name": "Sat", "value": 2100 },
    { "name": "Sun", "value": 1800 }
  ]
}
\`\`\`

---

## 14. Math

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

Inline: the complexity is $O(n \\log n)$.

---

## 15. Callouts

> [!NOTE]
> All visualizations lazy-load their dependencies — Recharts and Mermaid are never in the initial bundle.

> [!TIP]
> Use \`\`\`mermaid for flowcharts, sequence diagrams, ER diagrams, and Gantt charts natively.

> [!WARNING]
> The \`diff\` parser expects unified diff format. Output from \`git diff\` works out of the box.

---

## 16. Code

\`\`\`typescript
async function streamChat(prompt: string) {
  const res = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  for await (const chunk of readChunks(reader)) {
    process(decoder.decode(chunk));
  }
}
\`\`\`
`;
