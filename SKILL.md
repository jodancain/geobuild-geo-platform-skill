---
name: geobuild-geo-platform
description: Use when operating, auditing, cloning, or implementing GeoBuild/GEO features: material intake, Drive/web/upload evidence, AI-platform reach analysis, recommendations, content generation, launch packages, retest, strategy feedback, Convex realtime, Agent tool registry, production cutover, and GeoBuild-style customer workflow automation.
argument-hint: "[mode: operate|implement|audit] [repo-path-or-base-url]"
user-invocable: true
allowed-tools:
  - Read
  - Grep
  - Bash
  - Edit
---

# GeoBuild GEO Platform Skill

This skill turns the GeoBuild project into a portable Codex operating and implementation playbook. Use it whenever the user asks to "do GEO", "复刻 GeoBuild", "导入 GeoBuild skill", "实现 GEO 所有功能", "检查 GeoBuild 当前状态", or build a product workflow that matches `geo.youngtuo.win/build`.

## First Decision

Decide the mode before acting:

1. `operate`: use an existing GeoBuild instance. Prefer read-only checks first, then run authenticated write APIs only with a valid `ADMIN_CONTROL_KEY` or `CLIENT_INTAKE_TOKEN`.
2. `implement`: recreate GeoBuild capabilities in another repo. Implement the same layers, data contracts, tool registry, workflow gates, and verification suite. Do not settle for a marketing page or a prompt-only wrapper.
3. `audit`: verify current production or a cloned deployment. Treat live health, Convex parity, release commit, DB/Redis, Agent kernel, and AI-platform readiness as separate evidence.

If mode is unclear, default to `audit` plus a short plan, then continue with `operate` or `implement` after the target is clear.

## Required Context

Read these files from this skill before substantial work:

- `references/architecture.md`
- `references/workflows.md`
- `references/tool-map.md`
- `references/implementation-blueprint.md`

If you are inside the original GeoBuild repo, also read:

- `README.md`
- `package.json`
- `src/lib/agent-runtime/workspace-tools.ts`
- `src/lib/agent-runtime/planner.ts`
- `src/lib/agent-runtime/prompt-assembler.ts`
- `src/lib/geobuild-service.ts`
- `src/lib/convex-sync.ts`
- `prisma/schema.prisma`
- `convex/schema.ts`
- `convex/geobuild.ts`
- `docs/agent-kernel/CONVEX_MIGRATION.md`

## Canonical Workflow

Run the customer GEO workflow in this order:

1. Intake: collect brand/product facts, public URLs, Google Drive folders/files, uploads, visual captions, and forbidden claims.
2. Material verification: route materials, check readability, build evidence brief, reconcile facts, and identify source conflicts.
3. Reach analysis: measure recognition, understanding, citation, recommendation, and repetition across Doubao, DeepSeek, Claude, ChatGPT, and Gemini.
4. Strategy: create recommendations only for improving AI-platform reach.
5. Content: generate website drafts, FAQ, comparison pages, case pages, brand fact pages, and social content.
6. Guardrails: run content fact guard and launch-package delivery gate before anything is treated as publish-ready.
7. Launch package: assemble website, Xiaohongshu, WeChat, Douyin, Q&A, and long-video reuse assets. Do not auto-publish external accounts without explicit approval.
8. Retest: run or prepare AI-platform retest, audit batch quality, and feed results into strategy evolution.
9. Memory: sync GeoContextDrive, run package, task nodes, skill registry, and Convex realtime state so the next Codex can resume.

## Safety Rules

- Never print or persist secrets. Reference secret locations or env var names only.
- Writes require `x-geo-admin-key: $ADMIN_CONTROL_KEY` unless the route explicitly allows `x-geobuild-intake-token`.
- Default mutating tools to `dryRun=true` unless the user clearly authorizes execution.
- Real social publishing, production routing, deletion, spending, or public posting requires an explicit human checkpoint.
- Treat Convex as the realtime/read-first layer, but keep Prisma/Postgres as source-of-record compatibility unless the target implementation has intentionally changed that contract.
- Do not claim the project is healthy from code alone. Verify live or local runtime evidence.

## Verification Baseline

For the original production target, current verified baseline as of 2026-06-29:

- Base URL: `https://geo.youngtuo.win/build`
- Release commit: `024a6242eb34f3adee38875eeb63f3be15c8173d`
- Release source: `github-actions-zeabur-upload`
- Health: DB true, Redis true, Agent kernel true
- Reach platforms ready: Doubao, DeepSeek, Claude, ChatGPT, Gemini
- Convex: enabled, mutation token configured, doctor `ok=true`, probe `status=in_sync`, gaps empty
- Workspace reads: `source=auto` resolves to Convex for state, material summary, reach summary, and customer operations

Always refresh this before answering "latest", "current", "ready", or "is it working".

Use the portable smoke script after importing the skill:

```bash
node .agents/skills/geobuild-geo-platform/scripts/live-smoke.mjs --base-url https://geo.youngtuo.win/build --json
```

Inside the original repo, prefer the full smoke:

```bash
npm run convex:api-smoke -- --json
npm run convex:api-smoke -- --require-convex
```

## Implementation Minimum

When implementing GeoBuild elsewhere, completion requires all of these surfaces:

- Next.js app under `/build` with workspace, Agent, source, analysis, recommendations, content, publish, monitor, reports, and settings surfaces.
- Prisma/Postgres models for workspace, source assets, question sets, answer samples, content assets, reports, social upload tasks, Agent sessions, run traces, task nodes, context files, skill definitions, and strategy versions.
- Convex schema/functions for realtime workspace overview, summaries, operation runs, messages, traces, task nodes, product profiles, question sets, context files, and parity probes.
- Agent runtime with tool registry, deterministic planner, prompt assembler, customer/internal scope separation, run trace logging, and ContextDrive sync.
- Material ingestion for public web, Drive, uploads, PDF/Office/ZIP/OCR/visual captions, plus repair/rollback lifecycle.
- Reach analysis, recommendations, content generation, launch package, fact guard, public-page smoke, retest, strategy evolution, and run package.
- Customer operation runs with immediate runId, background worker, progress, cancel/retry, and Convex-first frontend status.
- Production gates: healthz, ops health, Convex doctor, Convex sync probe, API smoke, local Convex smoke, lint, typecheck, build.

If any of these are missing, report it as partial implementation rather than "all GEO functions".

## Import

To install from the public repository into another Codex-managed repo:

```bash
mkdir -p /path/to/target/.agents/skills
git clone https://github.com/jodancain/geobuild-geo-platform-skill /path/to/target/.agents/skills/geobuild-geo-platform
```

Then start a new Codex session in the target repo so the skill is discovered. If the target repo also supports Claude skills, clone the same repository to `.claude/skills/geobuild-geo-platform`.

## Reporting

When closing work, report:

- Mode used: `operate`, `implement`, or `audit`
- Exact base URL or repo path
- Commands run and pass/fail result
- Release commit or local git commit checked
- Which workflow stages are complete
- Remaining missing layers or open loops
