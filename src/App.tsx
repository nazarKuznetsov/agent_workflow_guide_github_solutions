import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { supportsWebGL } from "./three/webglSupport";

const ThreeHeroCanvas = lazy(() => import("./three/ThreeHeroCanvas"));

type Card = {
  title: string;
  copy: string;
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
          <a href="#gate">Gate</a>
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
            <a className="button primary" href="#model">
              View system
            </a>
            <a
              className="button secondary"
              href="https://github.com/nazarKuznetsov/agent_workflow_guide_github_solutions/blob/main/docs/github-agent-workflow.md"
            >
              Read guide
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

      <section className="final-cta section-band">
        <p className="eyebrow">Migration checklist</p>
        <h2>Move the queue into GitHub, then make the guide visible.</h2>
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
