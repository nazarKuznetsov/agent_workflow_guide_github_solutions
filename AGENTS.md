# Agent Instructions

This repository is the GitHub-native workflow guide and presentation site for
agent-driven delivery. Treat GitHub as the system of record.

Before changing workflow rules, templates, automation, UI, deployment, or 3D
assets, read:

- `docs/github-agent-workflow.md`
- `GITHUB_PAGES_3D_AGENT_DESIGN.md`

## Operating Model

- Planner Chat changes process rules, templates, project schema, and durable
  workflow guidance.
- Orchestrator Chat executes the GitHub Project queue, tracks blockers, starts
  workers, and maintains the state ledger through GitHub Issues and comments.
- Worker Chat handles exactly one GitHub Issue in one isolated workspace, one
  branch, and one pull request.

Do not start worker delivery from memory. GitHub Issues, GitHub Projects,
linked PRs, repository files, tests, Actions output, and runtime output are the
sources of truth.

## GitHub Readiness Gate

Treat `Project Status = Ready` and label `agent-ready` as the default ready
filter. Do not start worker delivery unless the issue also contains:

- goal and acceptance criteria;
- dependency state, including blockers, sub-issues, dependencies, and linked
  PRs;
- validation expectations, including primary signal and required checks;
- security impact, even when the answer is `none`;
- UI/design impact, even when the answer is `none`;
- QA requirement or a clear low-risk exemption.

Mark an issue not ready when it is missing readiness fields, depends on an open
blocker, bundles multiple independent PR-sized changes, requires an unapproved
security/dependency/release decision, or cannot be validated locally.

## Branch, Commit, And PR Rules

Use short issue-linked branch names:

- `feat/123-short-slug`
- `fix/123-short-slug`
- `docs/123-short-slug`
- `chore/123-short-slug`
- `test/123-short-slug`
- `refactor/123-short-slug`

PRs must link the GitHub Issue with `Closes #123` or an explicit linked issue
reference. PR bodies must include acceptance evidence, validation, security
notes, design notes when applicable, repo/API grounding, risks, and rollout
notes.

## GitHub Pages Rules

This project deploys as a static Vite app to GitHub Pages.

- Do not add backend-only features, server secrets, SSR-only runtime logic,
  database writes, or server API routes.
- Build static-first: content and layout must work before 3D loads.
- Keep the Vite project-site base path:
  `/agent_workflow_guide_github_solutions/`.
- Use `import.meta.env.BASE_URL` for public asset URLs.
- Respect mobile fallback, reduced motion, accessibility, and performance
  budgets.

## Validation Defaults

Use the existing scripts:

```bash
npm run test
npm run build
npm run check
```

Before reporting completion, verify the production build and the GitHub Pages
base path.
