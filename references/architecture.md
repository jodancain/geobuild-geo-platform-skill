# GeoBuild Architecture Reference

GeoBuild is a Next.js, Prisma/Postgres, Redis, Convex, and Agent-runtime product for Generative Engine Optimization. Its public production entry is:

```text
https://geo.youngtuo.win/build
```

The original private/local GeoBuild implementation repo used to extract this skill is:

```text
ai/geobuild
```

## Product Boundary

GeoBuild is not a generic SEO dashboard. Its narrow job is to improve whether new companies and products are recognized, understood, cited, recommended, and repeated by AI platforms such as Doubao, DeepSeek, Claude, ChatGPT, and Gemini.

Core loop:

```text
materials -> evidence -> reach analysis -> recommendations -> content -> launch package -> public smoke -> retest -> strategy feedback -> memory
```

## Runtime Layers

1. UI layer: `src/app/workspace/*` and `src/components/*`.
2. API layer: `src/app/api/workspace/*`, `src/app/api/agent/route.ts`, `src/app/api/healthz/route.ts`.
3. Service layer: `src/lib/geobuild-service.ts`.
4. Agent runtime: `src/lib/agent-runtime/workspace-tools.ts`, `planner.ts`, `prompt-assembler.ts`, `loop.ts`, `session-store.ts`.
5. Agent kernel: `src/lib/agent-kernel/*`, default local planner with optional Claude Agent SDK.
6. Realtime layer: `convex/schema.ts`, `convex/geobuild.ts`, `src/lib/convex-sync.ts`.
7. Persistence: `prisma/schema.prisma` with PostgreSQL as the compatibility source of record.
8. Workers: `scripts/customer-operation-runner.mjs`, `scripts/geobuild-worker.mjs`, `scripts/social-upload-runner.mjs`.
9. Ops scripts: `scripts/convex-api-smoke.mjs`, `convex-production-doctor.mjs`, `convex-production-cutover.mjs`, `convex-history-backfill.mjs`, `zeabur-upload-deploy.mjs`.

## Production Baseline

Last verified on 2026-06-29:

```text
baseUrl=https://geo.youngtuo.win/build
buildCommit=024a6242eb34f3adee38875eeb63f3be15c8173d
buildRef=main
releaseSource=github-actions-zeabur-upload
convexProject=geobuild-youngtuo-win
convexDeployment=giant-antelope-146
convexUrl=https://giant-antelope-146.convex.cloud
convexProbe.status=in_sync
convexDoctor.gaps=[]
```

Treat this as a baseline, not permanent truth. Refresh live state before current-state answers.

## Data Model Groups

Minimum Prisma groups to preserve:

- Workspace and Agent settings: `Workspace`, `AgentSetting`, `WorkspaceApiToken`.
- Materials and evidence: `BrandFact`, `Competitor`, `SourceAsset`, `ResearchNote`, `ResearchLink`, `GeoKnowledgeIndex`.
- Reach and retest: `QuestionSet`, `AnswerSample`, retest batch metadata in service models.
- Content and publish: `ContentAsset`, `Report`, launch packages, social upload tasks.
- Agent memory: `AgentSession`, session entries, `GeoRunTrace`, `GeoTaskNodeState`, `GeoContextFile`, `GeoContextCommit`.
- Skill/strategy: `GeoSkillDefinition`, `GeoStrategyVersion`, `GeoLesson`.

Convex mirrors the user-facing realtime windows: workspace overview, summaries, operation runs, messages, traces, task nodes, product profiles, question sets, content/publish/retest summaries, context files, commits, knowledge cards, skills, and strategy versions.

## Read Path Contract

APIs that expose workspace state support `source=auto|prisma|convex`.

- `source=auto` should use Convex when Convex overview is available and in sync.
- `source=prisma` forces compatibility/source-of-record reads.
- `source=convex` proves the realtime layer independently works.
- Responses should include `source`, `backingStore`, or `fallbackReason` so a Codex can distinguish success from fallback.

Important read APIs:

```text
GET /build/api/workspace/state?source=auto
GET /build/api/workspace/material-intake-summary?source=auto
GET /build/api/workspace/reach-summary?source=auto
GET /build/api/workspace/customer-operations?source=auto
GET /build/api/workspace/convex-sync?probe=1
GET /build/api/workspace/convex-doctor
GET /build/api/healthz
```

## Authentication Contract

Admin writes:

```text
x-geo-admin-key: $ADMIN_CONTROL_KEY
```

Client intake writes where allowed:

```text
x-geobuild-intake-token: $CLIENT_INTAKE_TOKEN
```

Read-only diagnostics and public health should not require secrets.

Never store real keys in the skill, docs, git, or chat.

## Deployment Contract

The reliable deployment line is GitHub Actions plus Zeabur Upload API. The production release metadata must expose the exact git commit through `/build/api/healthz`.

Current relevant commands:

```bash
npm run lint
npm run build
npm run convex:local-smoke
npm run convex:api-smoke -- --json
npm run convex:api-smoke -- --require-convex
npm run convex:doctor
npm run convex:cutover
npm run deploy:zeabur
```

If the user environment has npm shim problems, use a known-good local Node/npm binary instead of the broken shim. In the original extraction environment this was:

```bash
/Users/qiuxuanmai/.local/node-v22.14.0-darwin-arm64/bin/npm
```

## Human Gates

Do not automate these without explicit project approval:

- production routing changes
- deleting customer data
- real social account publishing
- public posting
- spending money
- replacing secrets
- cron or unattended mutations
- force-running a business write when fact guard or launch gate fails
