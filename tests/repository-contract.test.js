import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("repository contains the GitHub-native workflow guide and templates", () => {
  const requiredFiles = [
    "AGENTS.md",
    "docs/github-agent-workflow.md",
    ".github/ISSUE_TEMPLATE/agent-task.yml",
    ".github/ISSUE_TEMPLATE/config.yml",
    ".github/pull_request_template.md",
    ".github/workflows/deploy-pages.yml",
    ".github/workflows/readiness-audit.yml",
    "GITHUB_PAGES_3D_AGENT_DESIGN.md",
  ];

  for (const path of requiredFiles) {
    assert.equal(existsSync(path), true, `${path} should exist`);
  }
});

test("workflow guide defines the GitHub-native operating model", () => {
  const guide = read("docs/github-agent-workflow.md");

  const requiredPhrases = [
    "Project Status = Ready",
    "agent-ready",
    "Planner Chat",
    "Orchestrator Chat",
    "Worker Chat",
    "GitHub Issue",
    "GitHub Projects",
    "Closes #",
    "GitHub Pages",
    "New project integration",
    "Existing project integration",
    "Planner setup prompt",
    "Orchestrator queue prompt",
    "Worker delivery prompt",
  ];

  for (const phrase of requiredPhrases) {
    assert.match(guide, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${phrase} should be documented`);
  }
});

test("site source presents the workflow and GitHub Pages answer", () => {
  const app = read("src/App.tsx");

  const requiredPhrases = [
    "GitHub-native agent workflow",
    "Readiness gate",
    "Planner",
    "Orchestrator",
    "Worker",
    "Issue Forms",
    "GitHub Actions",
    "GitHub Pages",
    "New project setup",
    "Existing project integration",
    "Copy/paste prompts",
    "Planner setup prompt",
    "Orchestrator queue prompt",
    "Worker delivery prompt",
  ];

  for (const phrase of requiredPhrases) {
    assert.match(app, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${phrase} should be visible in App.tsx`);
  }
});

test("Vite config uses the GitHub Pages project base path", () => {
  const config = read("vite.config.ts");

  assert.match(config, /base:\s*["']\/agent_workflow_guide_github_solutions\/["']/);
});
