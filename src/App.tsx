import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { supportsWebGL } from "./three/webglSupport";

const ThreeHeroCanvas = lazy(() => import("./three/ThreeHeroCanvas"));

type Card = {
  title: string;
  copy: string;
};

type Step = {
  title: string;
  copy: string;
};

type PromptBlock = {
  title: string;
  copy: string;
  prompt: string;
};

const capabilities: Card[] = [
  {
    title: "GitHub Issues as the contract",
    copy: "Each task carries goal, acceptance criteria, blockers, validation, security, design, and QA state in one reviewable record.",
  },
  {
    title: "GitHub Projects as the queue",
    copy: "Status, work type, risk, and QA fields replace Linear queue state while labels keep routing simple for agents.",
  },
  {
    title: "GitHub Actions as guardrails",
    copy: "Pages deployment and readiness audit workflows protect the system without turning the static site into a backend.",
  },
  {
    title: "PR evidence as the handoff",
    copy: "Every Worker PR links the issue with Closes #, captures acceptance evidence, and records validation before merge.",
  },
];

const flow = [
  ["01", "Planner", "Define templates, labels, project schema, and issue-sized work."],
  ["02", "Orchestrator", "Select Ready + agent-ready issues, inspect blockers, and start one worker per issue."],
  ["03", "Worker", "Implement one issue in one branch and open one evidence-rich pull request."],
  ["04", "GitHub Pages", "Publish the operating model as a static presentation, not as orchestration state."],
];

const newProjectSteps: Step[] = [
  {
    title: "1. Создай репозиторий и включи GitHub Issues",
    copy: "Создай новый репозиторий, включи Issues, Pull Requests, Actions и Projects. Если это Pages-инструкция, сразу проверь, что репозиторий публичный или что у аккаунта есть Pages для private repo.",
  },
  {
    title: "2. Скопируй workflow-файлы",
    copy: "Добавь AGENTS.md, docs/github-agent-workflow.md, .github/ISSUE_TEMPLATE/agent-task.yml, .github/ISSUE_TEMPLATE/config.yml, .github/pull_request_template.md, .github/workflows/deploy-pages.yml и .github/workflows/readiness-audit.yml.",
  },
  {
    title: "3. Заведи labels и GitHub Project",
    copy: "Создай labels из чеклиста ниже. Затем создай GitHub Project с полями Status, Work Type, Risk и QA Required. Ready Queue должен показывать только Status = Ready и label:agent-ready.",
  },
  {
    title: "4. Настрой GitHub Pages",
    copy: "В Settings -> Pages выбери Source = GitHub Actions. Для Vite-проекта оставь base равным /agent_workflow_guide_github_solutions/ или замени на /repo-name/ в целевом репозитории.",
  },
  {
    title: "5. Открой первый Agent task",
    copy: "Создай issue через Agent task form, заполни Goal, Acceptance Criteria, Dependency / Blocker State, Validation Expectations, Security Impact, UI / Design Impact и QA Requirement.",
  },
  {
    title: "6. Включай delivery только после gate",
    copy: "Добавляй label agent-ready и ставь Project Status = Ready только тогда, когда task можно отдать Worker Chat без догадок и дополнительных решений.",
  },
];

const existingProjectSteps: Step[] = [
  {
    title: "1. Проведи аудит текущего проекта",
    copy: "Посмотри существующие labels, issue templates, PR template, Actions, GitHub Project views, правила branch protection и текущий формат задач. Не ломай старый процесс в первый день.",
  },
  {
    title: "2. Добавь GitHub-native guide рядом с текущими правилами",
    copy: "Сначала добавь AGENTS.md, docs/github-agent-workflow.md и PR template. Если в проекте уже есть PR template, объедини секции evidence, validation, security, design и rollout без удаления важных локальных правил.",
  },
  {
    title: "3. Сопоставь существующие статусы с новой очередью",
    copy: "Intake, Ready, In Progress, Review, Blocked и Done должны быть единственным языком для агентной очереди. Старые project views можно оставить, но Ready Queue должна быть однозначной.",
  },
  {
    title: "4. Мигрируй issues постепенно",
    copy: "Не переписывай весь backlog. Выбери 3-5 задач, приведи их к Agent task contract, добавь readiness sections и только после этого ставь agent-ready.",
  },
  {
    title: "5. Запусти pilot через один Worker PR",
    copy: "Проверь полный цикл: issue -> Project Status Ready -> Worker branch -> PR with Closes # -> validation evidence -> Review -> Done. После pilot обнови правила, которые оказались неясными.",
  },
  {
    title: "6. Зафиксируй исключения",
    copy: "Если проект имеет обязательные релизные, security или QA правила, добавь их в AGENTS.md и PR template. Orchestrator должен видеть эти правила до запуска Worker.",
  },
];

const setupChecklist = [
  "Issues enabled; blank issues disabled through .github/ISSUE_TEMPLATE/config.yml",
  "Project Status: Intake, Ready, In Progress, Review, Blocked, Done",
  "Project Work Type: Guide, Template, Automation, Site, Docs",
  "Project Risk: Low, Medium, High",
  "Project QA Required: Yes, No",
  "Labels: agent-ready, blocked, qa-required, security-review, design-review, docs, automation, github-pages, workflow",
  "Ready Queue view: Status = Ready + label:agent-ready + no open blockers",
  "Pages source: GitHub Actions; Vite base: /agent_workflow_guide_github_solutions/ or /target-repo-name/",
  "Worker PR rule: one issue, one branch, one PR, linked with Closes #123",
];

const templateFiles: Card[] = [
  {
    title: "AGENTS.md",
    copy: "Project-specific rules for Planner, Orchestrator, Worker, readiness gate, branch naming, PR evidence, Pages limits, and validation.",
  },
  {
    title: "agent-task.yml",
    copy: "Structured Issue Form that captures goal, acceptance criteria, blockers, validation, security, design, and QA requirement.",
  },
  {
    title: "pull_request_template.md",
    copy: "Evidence package for linked issue, acceptance proof, TDD/docs exemption, validation, security, design, grounding, risks, and rollout.",
  },
  {
    title: "readiness-audit.yml",
    copy: "Optional GitHub Action that comments when agent-ready is applied before required readiness sections exist.",
  },
];

const prompts: PromptBlock[] = [
  {
    title: "Planner setup prompt",
    copy: "Используй один раз при создании или обновлении процесса в репозитории.",
    prompt: `Ты Planner Chat для GitHub-native agent workflow.

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
- какие решения должен принять человек.`,
  },
  {
    title: "Orchestrator queue prompt",
    copy: "Используй перед запуском Worker Chat, чтобы выбрать только готовую задачу.",
    prompt: `Ты Orchestrator Chat для GitHub-native agent workflow.

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

Верни одну следующую задачу для Worker Chat и краткий state ledger comment.`,
  },
  {
    title: "Worker delivery prompt",
    copy: "Используй для исполнения ровно одной GitHub Issue.",
    prompt: `Ты Worker Chat для GitHub-native agent workflow.

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

Не закрывай задачу без validation evidence.`,
  },
  {
    title: "Existing project migration prompt",
    copy: "Используй для аккуратного внедрения в проект, где уже есть свои labels, шаблоны и CI.",
    prompt: `Ты Planner Chat. Нужно внедрить GitHub-native agent workflow в существующий проект без поломки текущего процесса.

Сначала прочитай README, AGENTS.md если есть, .github templates, workflows, current labels, Project views и branch protection expectations.

Сделай migration plan:
1. Что можно добавить без риска.
2. Что нужно объединить с текущими шаблонами.
3. Какие старые labels/statuses мапятся на Intake, Ready, In Progress, Review, Blocked, Done.
4. Какие 3-5 issues лучше взять для pilot.
5. Какие team-specific правила нужно добавить в AGENTS.md и PR template.

Не удаляй существующие правила без явного решения человека.`,
  },
];

function HeroVisual() {
  const [webgl, setWebgl] = useState(false);
  const posterUrl = useMemo(() => `${import.meta.env.BASE_URL}images/sculpture-poster.png`, []);

  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  return (
    <div className="hero-visual" aria-label="Abstract dark 3D sculpture representing the GitHub-native workflow">
      <img className="hero-poster" src={posterUrl} alt="" loading="eager" />
      {webgl ? (
        <Suspense fallback={null}>
          <div className="three-layer">
            <ThreeHeroCanvas />
          </div>
        </Suspense>
      ) : null}
      <div className="metadata-panel">
        <span>Ready filter</span>
        <strong>Status = Ready + agent-ready</strong>
      </div>
    </div>
  );
}

function App() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="GitHub-native agent workflow home">
          GH Agent OS
        </a>
        <nav aria-label="Primary navigation">
          <a href="#model">Model</a>
          <a href="#setup">Setup</a>
          <a href="#gate">Gate</a>
          <a href="#prompts">Prompts</a>
          <a href="#stack">Stack</a>
          <a href="https://github.com/nazarKuznetsov/agent_workflow_guide_github_solutions">GitHub</a>
        </nav>
      </header>

      <section className="hero section-band" id="top">
        <div className="hero-copy">
          <p className="eyebrow">GitHub-native agent workflow / GitHub Pages ready</p>
          <h1>GitHub-native agent workflow</h1>
          <p className="hero-lede">
            A presentable operating guide for replacing a Linear-centered agent queue with GitHub Issues,
            GitHub Projects, Issue Forms, labels, PR templates, GitHub Actions, API automation, and GitHub Pages.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#setup">
              Start setup
            </a>
            <a className="button secondary" href="#prompts">
              Copy prompts
            </a>
          </div>
          <dl className="status-strip" aria-label="Workflow status summary">
            <div>
              <dt>Source</dt>
              <dd>GitHub Issues</dd>
            </div>
            <div>
              <dt>Queue</dt>
              <dd>GitHub Projects</dd>
            </div>
            <div>
              <dt>Publish</dt>
              <dd>GitHub Pages</dd>
            </div>
          </dl>
        </div>
        <HeroVisual />
      </section>

      <section className="positioning section-band" id="model">
        <h2>One GitHub stack replaces the planning handoff.</h2>
        <p>
          The workflow keeps agent roles explicit. Planner Chat shapes the operating rules, Orchestrator Chat reads
          the GitHub Project queue and blocker state, and Worker Chat delivers exactly one GitHub Issue through one
          branch and one pull request.
        </p>
      </section>

      <section className="section-band" id="gate">
        <div className="section-heading">
          <p className="eyebrow">Readiness gate</p>
          <h2>Ready means observable, not aspirational.</h2>
        </div>
        <div className="gate-grid">
          <article className="gate-card strong">
            <span>Default filter</span>
            <strong>Project Status = Ready</strong>
            <strong>label: agent-ready</strong>
            <p>No open blockers, complete acceptance criteria, validation expectations, and security/design notes.</p>
          </article>
          <article className="gate-card">
            <span>Stop condition</span>
            <p>
              Missing readiness fields, unresolved dependencies, multiple PR-sized changes, or unapproved risky
              decisions move the issue back out of Ready.
            </p>
          </article>
          <article className="gate-card">
            <span>State ledger</span>
            <p>
              Orchestrator records queue moves, blocker decisions, worker starts, PR links, and completion evidence in
              GitHub issue comments or Project updates.
            </p>
          </article>
        </div>
      </section>

      <section className="section-band" id="stack">
        <div className="section-heading">
          <p className="eyebrow">Template stack</p>
          <h2>The workflow is encoded where the team already works.</h2>
        </div>
        <div className="capability-grid">
          {capabilities.map((card) => (
            <article className="capability-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="process section-band">
        <div className="section-heading">
          <p className="eyebrow">Operating flow</p>
          <h2>Planner, Orchestrator, Worker, PR.</h2>
        </div>
        <ol>
          {flow.map(([number, title, copy]) => (
            <li key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="proof section-band">
        <div className="terminal-card" aria-label="Recommended GitHub Project schema">
          <span className="terminal-label">GitHub Project schema</span>
          <pre>{`Status: Intake, Ready, In Progress, Review, Blocked, Done
Work Type: Guide, Template, Automation, Site, Docs
Risk: Low, Medium, High
QA Required: Yes, No

Ready view:
Status = Ready
label:agent-ready
no open blockers`}</pre>
        </div>
        <div className="pages-answer">
          <p className="eyebrow">GitHub Pages answer</p>
          <h2>Yes, publish the instruction on GitHub Pages.</h2>
          <p>
            GitHub Pages can host this presentation because it is static. It should not store secrets, run private
            orchestration, or replace the GitHub Issue and Project state model.
          </p>
        </div>
      </section>

      <section className="setup-playbook section-band" id="setup">
        <div className="section-heading">
          <p className="eyebrow">Self-contained setup guide</p>
          <h2>New project setup / настройка нового проекта.</h2>
          <p>
            Используй этот блок как пошаговую инструкцию: сначала включи GitHub-функции, затем скопируй шаблоны,
            создай Project schema и только после этого запускай агентную очередь.
          </p>
        </div>
        <div className="setup-grid">
          {newProjectSteps.map((step) => (
            <article className="setup-card" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="setup-playbook section-band">
        <div className="section-heading">
          <p className="eyebrow">Migration path</p>
          <h2>Existing project integration / внедрение в готовый проект.</h2>
          <p>
            В существующем проекте задача не в том, чтобы переписать backlog. Сначала вводится единый ready gate,
            затем пилотируется один полный цикл issue to PR to Done.
          </p>
        </div>
        <div className="setup-grid">
          {existingProjectSteps.map((step) => (
            <article className="setup-card" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="checklist section-band">
        <div className="section-heading">
          <p className="eyebrow">Manual GitHub setup</p>
          <h2>Что нужно настроить руками в GitHub.</h2>
        </div>
        <div className="checklist-grid">
          <div className="checklist-panel">
            <h3>Required settings</h3>
            <ul>
              {setupChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="checklist-panel">
            <h3>Files to copy</h3>
            <div className="file-list">
              {templateFiles.map((file) => (
                <div key={file.title}>
                  <strong>{file.title}</strong>
                  <p>{file.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="prompts section-band" id="prompts">
        <div className="section-heading">
          <p className="eyebrow">Copy/paste prompts</p>
          <h2>Готовые промпты для Planner, Orchestrator и Worker.</h2>
          <p>
            Эти тексты можно вставлять в агентные чаты. Они принуждают агента читать GitHub-состояние, не работать по
            памяти и не запускать delivery до прохождения readiness gate.
          </p>
        </div>
        <div className="prompt-grid">
          {prompts.map((prompt) => (
            <article className="prompt-card" key={prompt.title}>
              <div>
                <h3>{prompt.title}</h3>
                <p>{prompt.copy}</p>
              </div>
              <pre>{prompt.prompt}</pre>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta section-band">
        <p className="eyebrow">Migration checklist</p>
        <h2>Открой эту Pages-страницу, настрой GitHub по чеклисту и запускай очередь только через ready gate.</h2>
        <a className="button primary" href="https://github.com/nazarKuznetsov/agent_workflow_guide_github_solutions/issues/new/choose">
          Create structured issue
        </a>
      </section>

      <footer className="site-footer">
        <span>Static-first. GitHub-native. Pages-safe.</span>
        <a href="https://github.com/nazarKuznetsov/agent_workflow_guide_github_solutions">Repository</a>
      </footer>
    </main>
  );
}

export default App;
