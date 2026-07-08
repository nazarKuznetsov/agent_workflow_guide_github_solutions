# GitHub-Native Agent Workflow

This guide replaces a Linear-centered agent workflow with a GitHub-native
operating model. GitHub Issues, GitHub Projects, labels, Issue Forms, pull
request templates, GitHub Actions, and the GitHub API become the durable source
of truth.

GitHub Pages can publish this guide as a static presentation site. It should not
be treated as the orchestration runtime. The real workflow state remains in
GitHub.

## 1. System Of Record

Use this mapping when migrating from Linear:

| Linear concept | GitHub-native replacement |
| --- | --- |
| Linear issue | GitHub Issue |
| Linear status | GitHub Projects `Status` field |
| Linear label | GitHub label |
| Linear blocker | GitHub issue dependency, sub-issue, or explicit blocker link |
| Linear linked PR | GitHub linked pull request with `Closes #123` |
| Linear project view | GitHub Projects saved view |
| Linear automation | GitHub Actions, GitHub API, `gh`, or project automations |

For a personal repository, prefer GitHub Projects custom fields and labels. If
the repository later moves into a GitHub Organization, the team can add
organization-level issue types and issue fields without changing the core
delivery loop.

## 2. Roles

### Planner Chat

Planner Chat owns the operating system:

- edits this workflow guide and `AGENTS.md`;
- maintains Issue Forms, PR templates, labels, and Project schema;
- defines readiness and acceptance standards;
- splits large initiatives into issue-sized work;
- decides when GitHub-native automation should be added.

Planner Chat does not silently execute delivery work. It prepares the queue so
Orchestrator and Worker chats can operate without guessing.

### Orchestrator Chat

Orchestrator Chat owns queue execution:

- reads the GitHub Project ready queue;
- filters by `Project Status = Ready` and label `agent-ready`;
- checks issue dependencies, blockers, sub-issues, and linked PRs;
- starts workers only for issues that pass the readiness gate;
- maintains a state ledger in issue comments or project updates;
- moves issues between Ready, In Progress, Review, Blocked, and Done.

Orchestrator Chat must not start from memory. It should inspect the issue,
project fields, labels, linked pull requests, Actions status, and repository
state before assigning work.

### Worker Chat

Worker Chat owns exactly one delivery unit:

- one GitHub Issue;
- one isolated workspace or worktree;
- one branch;
- one pull request;
- one validation package.

Worker Chat implements only the issue scope. It links the PR back with
`Closes #123`, provides evidence in the PR template, and does not bundle
unrelated work.

## 3. GitHub Readiness Gate

The default ready filter is:

```text
Project Status = Ready
label = agent-ready
no open blockers
```

An issue is ready only when the issue body includes:

- Goal;
- Acceptance Criteria;
- Dependency / Blocker State;
- Validation Expectations;
- Security Impact;
- UI / Design Impact;
- QA Requirement.

An issue is not ready if it is missing readiness fields, has an unresolved
dependency, bundles multiple independent PR-sized changes, requires an
unapproved security/dependency/release decision, or cannot be validated with the
available repository tooling.

## 4. Project Schema

Create a GitHub Project with these fields:

```text
Status: Intake, Ready, In Progress, Review, Blocked, Done
Work Type: Guide, Template, Automation, Site, Docs
Risk: Low, Medium, High
QA Required: Yes, No
```

Recommended views:

- `Ready Queue`: `Status = Ready` and `label:agent-ready`;
- `Blocked`: `Status = Blocked` or `label:blocked`;
- `In Review`: `Status = Review`;
- `Automation`: `Work Type = Automation`;
- `Site`: `Work Type = Site`.

## 5. Labels

Recommended labels:

```text
agent-ready
blocked
qa-required
security-review
design-review
docs
automation
github-pages
workflow
```

Labels should not replace the issue body. They are routing signals. The issue
body remains the contract.

## 6. Issue Form Contract

Use `.github/ISSUE_TEMPLATE/agent-task.yml` for all agent-ready work. The form
collects the fields that Orchestrator Chat must inspect before starting a
Worker Chat.

When a task is prepared:

1. Fill every required readiness section.
2. Add dependencies with GitHub issue links, dependency relationships, or
   sub-issues.
3. Add `agent-ready` only when the task can start.
4. Set Project `Status` to `Ready`.

If a field does not apply, write `none` and explain why.

## Automated idea-to-issue pipeline

Use this flow when the team wants the same level of repeatability that a
Linear-centered process gave to Planner and Orchestrator chats.

```text
Brainstorm idea
-> idea summary
-> One canonical package
-> Planner Chat
-> Planner output YAML
-> Orchestrator intake prompt
-> GitHub Issue and Project Ready Queue
-> Worker Chat
```

The rule is simple: do not hand Planner or Orchestrator loose notes. Every
handoff uses the same canonical package so the idea, prompt, normalized YAML,
and GitHub issue payload stay together.

### One canonical package

Create one Markdown package after brainstorming and summary. Keep it as the
portable source that is pasted into Planner Chat and then forwarded to
Orchestrator Chat.

```markdown
# Canonical Agent Work Package

## idea_summary
Short summary of the brainstormed idea, user goal, audience, and why now.

## canonical_markdown
### Goal
...

### User / Team Value
...

### Acceptance Criteria
- [ ] ...
- [ ] ...

### Dependencies And Blockers
- none

### Validation Expectations
Primary signal:
Required checks:
Manual verification:

### Security Impact
none / reviewed / security-sensitive

### UI / Design Impact
none / UI copy / visual state / full UI flow

### QA Requirement
required / low-risk exemption

## planner_prompt
Paste the Planner normalization prompt here.

## planner_expected_yaml
Planner must return valid YAML that matches the Planner output YAML contract.

## orchestrator_prompt
Paste the Orchestrator intake prompt here.

## github_issue_payload
Title:
Labels:
Project fields:
Issue body:

## readiness_gate
Project Status = Ready
label = agent-ready
no open blockers
```

### Planner output YAML

Planner Chat returns this normalized YAML. Orchestrator Chat treats it as the
machine-readable handoff, but GitHub Issue text remains the source of truth
after the issue is created.

```yaml
title: "Short issue title"
goal: "Outcome the issue must produce"
acceptance_criteria:
  - "Observable pass/fail criterion"
dependencies:
  - "none"
blockers:
  - "none"
validation_expectations:
  primary_signal: "What proves the work is correct"
  required_checks:
    - "npm run check"
  manual_verification:
    - "Open the Pages URL and confirm the new section is readable"
security_impact:
  level: "none"
  notes: "No secrets, auth, permissions, or private data affected"
design_impact:
  level: "UI copy"
  notes: "Static documentation section only"
qa_requirement: "required"
labels:
  - "workflow"
  - "agent-ready"
project_fields:
  Status: "Ready"
  Work Type: "Docs"
  Risk: "Low"
  QA Required: "Yes"
worker_brief: "Implement exactly this issue and open one PR with Closes #<issue>."
orchestrator_notes: "Create or update the GitHub Issue, then verify readiness before starting Worker Chat."
```

Required Planner YAML rules:

- `title`, `goal`, `acceptance_criteria`, `validation_expectations`,
  `security_impact`, `design_impact`, `qa_requirement`, `labels`,
  `project_fields`, `worker_brief`, and `orchestrator_notes` must be present.
- `labels` may include `agent-ready` only if the readiness gate is already
  satisfied.
- `project_fields.Status` may be `Ready` only when there are no open blockers.
- The YAML must describe one PR-sized issue, not an initiative.

### GitHub Issue creation path

Use the Issue Form path for humans and the `gh` path for agents or power users.
Both paths must produce the same issue body.

Manual path:

```text
1. Open Issues -> New issue -> Agent task.
2. Paste the canonical markdown into the matching form sections.
3. Add labels from Planner output YAML.
4. Add the issue to the GitHub Project.
5. Set Project fields from Planner output YAML.
```

Accelerated `gh` path:

```bash
gh issue create \
  --title "Short issue title" \
  --body-file /tmp/canonical-agent-issue.md \
  --label workflow \
  --label agent-ready
```

After `gh issue create`, add Project fields manually or with the GitHub API if
the repository has project automation available. Do not hide missing readiness
state behind automation.

## New project integration

Use this path when the team is starting from a fresh repository.

1. Create the repository and enable GitHub Issues, Pull Requests, Actions, and
   Projects.
2. Copy the workflow files:
   - `AGENTS.md`;
   - `docs/github-agent-workflow.md`;
   - `.github/ISSUE_TEMPLATE/agent-task.yml`;
   - `.github/ISSUE_TEMPLATE/config.yml`;
   - `.github/pull_request_template.md`;
   - `.github/workflows/deploy-pages.yml`;
   - `.github/workflows/readiness-audit.yml`.
3. Create the recommended labels:
   `agent-ready`, `blocked`, `qa-required`, `security-review`,
   `design-review`, `docs`, `automation`, `github-pages`, `workflow`.
4. Create a GitHub Project with the fields from the Project Schema section.
5. Create a `Ready Queue` view with `Status = Ready` and `label:agent-ready`.
6. In repository Settings -> Pages, set the source to GitHub Actions.
7. For a Vite project, set `base` to the Pages project path, for example
   `/agent_workflow_guide_github_solutions/`.
8. Create the first issue through the Agent task form and fill every readiness
   section.
9. Add `agent-ready` and set Project `Status` to `Ready` only after the issue
   can start without extra decisions.

The first pilot should cover the full loop:

```text
GitHub Issue -> Ready Queue -> Worker branch -> Pull Request with Closes #123 -> Review -> Done
```

## Existing project integration

Use this path when the project already has labels, templates, CI, branch
protection, or a backlog.

1. Audit existing repository rules: `README.md`, `AGENTS.md` if present,
   `.github/` templates, Actions, labels, Project views, branch protection, and
   release expectations.
2. Add the GitHub-native guide without deleting existing local rules.
3. If a PR template already exists, merge in the evidence sections instead of
   replacing team-specific security, QA, release, or review requirements.
4. Map current statuses to the agent queue:
   `Intake`, `Ready`, `In Progress`, `Review`, `Blocked`, `Done`.
5. Backfill only a small pilot batch, usually three to five issues.
6. Convert those issues to the Agent task contract by adding Goal, Acceptance
   Criteria, Dependency / Blocker State, Validation Expectations, Security
   Impact, UI / Design Impact, and QA Requirement.
7. Run one Worker PR through the entire loop before migrating the rest of the
   backlog.
8. Record any project-specific exceptions in `AGENTS.md` and the PR template.

Do not mark legacy issues as `agent-ready` merely because they are important.
They are ready only when the readiness gate is complete.

## Copy/Paste Prompts

### Brainstorm-to-summary prompt

Use this after the initial idea conversation.

```text
Ты Brainstorm Summary Chat.

Сожми обсуждение идеи в структурированное summary для GitHub-native agent workflow.

Верни:
- цель идеи;
- для кого это делается;
- почему это важно сейчас;
- что входит в scope;
- что не входит в scope;
- 3-5 acceptance criteria;
- известные blockers/dependencies;
- validation expectations;
- security/design/QA impact.

Не создавай GitHub Issue. Подготовь summary для canonical package.
```

### Canonical package builder prompt

Use this to turn the summary into the single portable package.

```text
Ты Canonical Package Builder для GitHub-native agent workflow.

Возьми brainstorm summary и собери One canonical package.

Package должен содержать:
- idea_summary;
- canonical_markdown;
- planner_prompt;
- planner_expected_yaml;
- orchestrator_prompt;
- github_issue_payload;
- readiness_gate.

Сделай package самодостаточным: Planner и Orchestrator должны понимать задачу без доступа к исходному чату brainstorm.
```

### Planner setup prompt

Use this when creating or updating the process in a repository.

```text
Ты Planner Chat для GitHub-native agent workflow.

Открой репозиторий и используй GitHub как source of truth. Проверь AGENTS.md, docs/github-agent-workflow.md, Issue Forms, PR template, labels, GitHub Project fields, Actions и Pages workflow.

Задача:
1. Настрой или обнови workflow так, чтобы он работал без Linear.
2. Проверь, что GitHub Issue является контрактом задачи.
3. Проверь, что Ready gate = Project Status: Ready + label agent-ready + заполненные readiness sections.
4. Создай или обнови задачи так, чтобы каждая имела Goal, Acceptance Criteria, Dependency / Blocker State, Validation Expectations, Security Impact, UI / Design Impact и QA Requirement.
5. Не запускай delivery work.

Верни:
- какие файлы/настройки изменены;
- какие labels и Project fields нужны;
- какие issues готовы к Ready;
- какие issues blocked и почему;
- какие решения должен принять человек.
```

### Planner normalization prompt

Use this when a canonical package is ready and Planner must convert it into a
queue-ready task.

```text
Ты Planner Chat для GitHub-native agent workflow.

Вход:
1. One canonical package.
2. Canonical markdown.
3. Planner expected YAML contract.

Твоя задача:
1. Проверить, что идея помещается в одну GitHub Issue и один Worker PR.
2. Если scope слишком большой, вернуть split recommendation вместо Ready YAML.
3. Если scope нормальный, вернуть Planner output YAML.
4. Запретить agent-ready, если не заполнены acceptance criteria, dependencies/blockers, validation, security, design или QA.

Верни только валидный YAML плюс короткий human note после YAML.
```

### Orchestrator intake prompt

Use this after Planner returns YAML.

```text
Ты Orchestrator Chat для GitHub-native agent workflow.

Вход:
1. One canonical package.
2. Planner output YAML.
3. Canonical markdown.

Твоя задача:
1. Проверить YAML against readiness gate.
2. Создать или обновить GitHub Issue через Issue Form path или gh issue create path.
3. Добавить labels и GitHub Project fields из YAML.
4. Если есть blockers, оставить issue в Intake или Blocked и написать blocker comment.
5. Если gate выполнен, поставить Status = Ready и label agent-ready.
6. Вернуть Worker handoff только после проверки GitHub Issue URL и Project state.

Не запускай Worker Chat, если GitHub Issue не создана или readiness gate не выполнен.
```

### GitHub Issue creation prompt

Use this when the operator wants the agent to create the issue with GitHub CLI.

```text
Ты GitHub Issue Creation Agent.

Вход:
1. Planner output YAML.
2. Canonical markdown.
3. Target repository.

Сделай:
1. Создай issue body file из canonical markdown.
2. Выполни gh issue create с title и labels из YAML.
3. Верни issue URL.
4. Сообщи, какие GitHub Project fields нужно выставить вручную или через API.

Команда должна использовать gh issue create. Не добавляй agent-ready, если YAML не прошел readiness gate.
```

### Orchestrator queue prompt

Use this before starting Worker Chat.

```text
Ты Orchestrator Chat для GitHub-native agent workflow.

Используй только GitHub state: Issues, Project fields, labels, dependencies/sub-issues, linked PRs, comments, Actions и repository files.

Найди задачи, где:
- Project Status = Ready;
- есть label agent-ready;
- нет открытых blockers;
- issue body содержит Goal, Acceptance Criteria, Dependency / Blocker State, Validation Expectations, Security Impact, UI / Design Impact и QA Requirement.

Для каждой candidate issue:
1. Проверь, что задача помещается в один Worker PR.
2. Проверь, что нет незакрытых зависимостей или неутвержденных решений.
3. Если задача готова, опиши worker brief.
4. Если не готова, убери ее из Ready или оставь blocker comment.

Верни одну следующую задачу для Worker Chat и краткий state ledger comment.
```

### Worker delivery prompt

Use this to deliver exactly one GitHub Issue.

```text
Ты Worker Chat для GitHub-native agent workflow.

Возьми только GitHub Issue #<номер>. Не расширяй scope.

Перед кодом:
1. Прочитай issue body, comments, labels, Project fields, blockers, linked PRs, AGENTS.md и релевантные docs.
2. Подтверди, что Ready gate выполнен: Project Status = Ready + label agent-ready + нет blockers.
3. Создай одну branch: feat/<issue>-short-slug, fix/<issue>-short-slug или docs/<issue>-short-slug.

Delivery:
1. Сделай минимальное изменение, которое закрывает acceptance criteria.
2. Запусти validation из issue и ближайшие дешевые проверки проекта.
3. Открой один PR с Closes #<номер>.
4. Заполни PR template evidence: acceptance, validation, security, design, repo/API grounding, risks, rollout.

Не закрывай задачу без validation evidence.
```

### Existing project migration prompt

Use this when adopting the workflow in an established repository.

```text
Ты Planner Chat. Нужно внедрить GitHub-native agent workflow в существующий проект без поломки текущего процесса.

Сначала прочитай README, AGENTS.md если есть, .github templates, workflows, current labels, Project views и branch protection expectations.

Сделай migration plan:
1. Что можно добавить без риска.
2. Что нужно объединить с текущими шаблонами.
3. Какие старые labels/statuses мапятся на Intake, Ready, In Progress, Review, Blocked, Done.
4. Какие 3-5 issues лучше взять для pilot.
5. Какие team-specific правила нужно добавить в AGENTS.md и PR template.

Не удаляй существующие правила без явного решения человека.
```

## 7. Worker Delivery Loop

Worker Chat follows this sequence:

1. Read the issue, comments, labels, project fields, linked PRs, and blockers.
2. Confirm the issue passes `Project Status = Ready` plus `agent-ready`.
3. Create one issue-linked branch, for example `feat/123-short-slug`.
4. Implement the smallest coherent change that satisfies the issue.
5. Run the issue's required validation.
6. Open one PR with `Closes #123`.
7. Fill the PR template with evidence, not summaries alone.
8. Move the issue to Review.
9. After merge and required checks, move the issue to Done.

## 8. Pull Request Evidence

Every worker PR must include:

- linked issue;
- what changed;
- acceptance criteria evidence;
- TDD evidence or a clear docs/config exemption;
- validation commands and results;
- security notes;
- design notes when applicable;
- repository/API grounding;
- risks;
- migration or rollout notes.

If the PR changes the GitHub Pages site, it must also confirm:

- Vite `base` still matches `/agent_workflow_guide_github_solutions/`;
- content remains readable without WebGL;
- mobile fallback works;
- no frontend secrets were added.

## 9. Automation Stack

Use automation only where it protects the workflow:

- GitHub built-in project automations for status transitions;
- GitHub Actions for Pages deployment;
- readiness audit workflow when `agent-ready` is applied;
- `gh` or GitHub API for queue inspection and reporting;
- issue comments for state ledger updates when Project history is not enough.

The included readiness audit workflow comments when `agent-ready` is applied to
an issue that is missing required readiness sections. It is intentionally a
guardrail, not a replacement for Orchestrator judgment.

## 10. GitHub Pages Presentation

The Pages site presents this model to a team. It should answer:

- what replaces Linear;
- how Planner, Orchestrator, and Worker chats divide responsibility;
- what makes a task ready;
- how blockers and PR links are represented;
- how GitHub Actions and API automation fit in;
- why GitHub Pages is only the publication layer.

GitHub Pages is safe for this use case because the site is static. Do not place
private tokens, secret API keys, or orchestration state in frontend code.

## 11. Done Definition

A workflow change is done when:

- docs explain the behavior;
- templates encode the behavior;
- the Pages presentation reflects the behavior;
- local tests and build pass;
- GitHub Pages deployment path is correct;
- no backend-only assumptions were introduced.

A delivery issue is done when:

- the linked PR is merged;
- acceptance criteria evidence is present;
- required checks pass;
- risks and rollout notes are captured;
- the issue is moved to Done.
