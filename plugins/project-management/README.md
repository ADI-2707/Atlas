# `plugins/project-management`

The Project & Task Management plugin for the Atlas platform. It enables teams to create projects, track task boards (Kanban style), set milestones, and collaborate inside the client workspace.

- **Frontend:** React Project view (`@atlas/plugin-project-management`)
- **Backend:** NestJS Module (`apps/backend/src/plugins/project-management`)
- **Data Model:** `Project`, `Task`, `Milestone`, `TaskComment`

---

## Core Capabilities

- **Kanban Board:** Interactive drag-and-drop lists (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`) mapped to task statuses.
- **Collaborative Milestones:** Connect deadlines to project completions and trace user progress logs.
- **User Mentions:** Supports assignees notifications and audit trail listings for team members.

---

## Directory Structure

```
project-management/
├── manifest.json      # PM routes, widget, and permission declarations
├── package.json
├── backend/           # NestJS controllers and services
└── frontend/          # React boards and project settings UI
```
