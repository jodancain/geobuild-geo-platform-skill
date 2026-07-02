# GeoBuild GEO Platform Skill

Portable Codex/Claude skill for operating, auditing, or recreating GeoBuild-style Generative Engine Optimization workflows.

The skill covers material intake, evidence verification, AI-platform reach analysis, recommendations, content generation, launch packages, retest, strategy feedback, Convex realtime parity, Agent run traces, ContextDrive, external skill import preview, visual artifact repair, and the 91-tool GeoBuild Agent registry.

## Install In Codex

Clone this repository directly into a Codex skill folder:

```bash
mkdir -p .agents/skills
git clone https://github.com/jodancain/geobuild-geo-platform-skill .agents/skills/geobuild-geo-platform
```

Then start a new Codex session in that workspace and ask it to use `geobuild-geo-platform`.

If the target workspace also uses Claude-compatible skill discovery:

```bash
mkdir -p .claude/skills
git clone https://github.com/jodancain/geobuild-geo-platform-skill .claude/skills/geobuild-geo-platform
```

## Quick Live Check

```bash
node .agents/skills/geobuild-geo-platform/scripts/live-smoke.mjs --base-url https://geo.youngtuo.win/build --json
```

If this repository is cloned as the current directory:

```bash
node scripts/live-smoke.mjs --base-url https://geo.youngtuo.win/build --json
```

For production parity checks:

```bash
node scripts/live-smoke.mjs --base-url https://geo.youngtuo.win/build --require-convex --json
```

## Contents

- `SKILL.md` - Codex skill entrypoint.
- `references/architecture.md` - GeoBuild architecture and runtime layers.
- `references/workflows.md` - API and operational workflow runbook.
- `references/tool-map.md` - 91-tool Agent registry map.
- `references/implementation-blueprint.md` - build-from-scratch implementation plan.
- `scripts/live-smoke.mjs` - dependency-free production smoke test.

## Safety

This repository contains no secret values. It names required environment variables such as `ADMIN_CONTROL_KEY` and `CLIENT_INTAKE_TOKEN`, but never stores their values.

Writes to a GeoBuild instance require an admin or intake token. Real social publishing, production routing changes, deletion, spending, and public posting still require explicit human approval.
