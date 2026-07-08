# GitHub-Native Agent Workflow Guide

This repository contains a GitHub-native replacement for a Linear-centered agent
delivery workflow. It uses GitHub Issues, GitHub Projects, Issue Forms, labels,
pull request templates, GitHub Actions, and the GitHub API as the system of
record.

It also includes a static presentation site for sharing the model with a team.
The published page is a reading and copy surface only; it is not part of the
agent workflow state model.

The intended operating model matches the Linear guide: the human creates only
Brainstorm Chat, Planner Chat, and Orchestrator Chat. Orchestrator Chat creates
GitHub Issues, labels, Project fields, worker packets, and state ledger updates
through GitHub tools, `gh`, or the GitHub API. The Issue Form is a fallback when
automation access is missing.

## Automation-First Setup

Manual GitHub setup is a fallback, not the default path. Planner Chat should
return a `GitHub Setup Packet`; Orchestrator Chat applies it through GitHub
tools, `gh`, or the GitHub API.

Core commands or equivalent API calls:

```bash
gh auth status
gh repo edit --enable-issues --enable-projects
gh label create agent-ready --color 35f2a3 --description "Ready for agent worker" --force
gh project field-create <project-number> --owner <owner> --name Status --data-type SINGLE_SELECT --single-select-options "Intake,Ready,In Progress,Review,Blocked,Done"
```

If Orchestrator lacks permission, it returns `Human action required` with exact
commands, issue body, labels, and Project fields.

The Vite base path is configured as:

```ts
base: "/agent_workflow_guide_github_solutions/"
```

## Local Development

```bash
npm install
npm run dev
npm run check
npm run preview
```

## Core Files

- [AGENTS.md](AGENTS.md) contains repository-level rules for coding agents.
- [docs/github-agent-workflow.md](docs/github-agent-workflow.md) is the primary
  GitHub-native workflow guide.
- [GITHUB_PAGES_3D_AGENT_DESIGN.md](GITHUB_PAGES_3D_AGENT_DESIGN.md) contains
  the visual and deployment design constraints for the presentation site.
- [.github/ISSUE_TEMPLATE/agent-task.yml](.github/ISSUE_TEMPLATE/agent-task.yml)
  defines structured task intake.
- [.github/pull_request_template.md](.github/pull_request_template.md) defines
  the required PR evidence package.

## GitHub Project Schema

Planner includes these fields in the `GitHub Setup Packet`, and Orchestrator
creates or verifies them in GitHub Projects:

```text
Status: Intake, Ready, In Progress, Review, Blocked, Done
Work Type: Guide, Template, Automation, Site, Docs
Risk: Low, Medium, High
QA Required: Yes, No
```

Recommended ready filter:

```text
Status = Ready
label:agent-ready
no open blockers
```

## Recommended Labels

```text
agent-ready
blocked
qa-required
security-review
design-review
docs
automation
workflow
```

## Deployment

1. In GitHub, open repository Settings -> Pages.
2. Set Build and deployment Source to GitHub Actions.
3. Push to `main`.
4. The deploy workflow builds Vite and publishes `dist`.

No secrets are required for the static Pages deployment.
