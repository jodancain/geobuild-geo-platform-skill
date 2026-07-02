# GeoBuild Implementation Blueprint

Use this when a Codex needs to recreate GeoBuild/GEO in another repo instead of only operating the current production instance.

The target is feature parity with the GeoBuild workflow, not visual similarity. A partial clone should state exactly which layers are missing.

## Phase 1. App Shell

Implement a real app surface, not a landing page.

Required routes:

```text
/build
/build/workspace
/build/workspace/agent
/build/workspace/agent?panel=dashboard
/build/workspace/agent?panel=sources
/build/workspace/agent?panel=analysis
/build/workspace/agent?panel=recommendations
/build/workspace/agent?panel=content
/build/workspace/agent?panel=publish
/build/workspace/agent?panel=monitor
/build/workspace/agent?panel=traces
/build/workspace/agent?panel=settings
```

Original code map:

```text
src/app/workspace/*
src/app/workspace/agent/page.tsx
src/components/GeoBuildCustomerChat.tsx
src/components/CustomerAgentWorkspace.tsx
src/components/CustomerOperationRunsPanel.tsx
src/components/GeoTaskNodeStateMachine.tsx
src/components/MaterialIntakeSummaryPanel.tsx
```

## Phase 2. Persistence

Start with Prisma/Postgres. Keep Convex as realtime mirror unless the target architecture explicitly replaces Prisma.

Core model groups:

```text
Workspace, AgentSetting, BrandFact, Competitor, SourceAsset, QuestionSet, AnswerSample,
ContentAsset, Report, SocialAccount, AnalyticsConfig, WorkspaceApiToken, GeoLesson,
ResearchNote, ResearchLink, GeoKnowledgeIndex, GeoStrategyVersion, GeoSkillDefinition,
GeoRunTrace, GeoTaskNodeState, GeoContextFile, GeoContextCommit, AgentSession,
AgentSessionEntry, CustomerOperationRun-style trace metrics, SocialUploadTask
```

Original code map:

```text
prisma/schema.prisma
src/lib/prisma.ts
src/lib/geobuild-state-source.ts
```

## Phase 3. API Surface

Expose the same route families or adapters:

```text
health: /api/healthz, /api/ops/health
agent: /api/agent
state: /api/workspace/state
convex: /api/workspace/convex-doctor, /convex-sync, /convex-backfill
intake: /intake, /intake/chat, /intake/url, /source-assets, /source-assets/upload, /material-router
analysis: /analysis, /reach-summary, /surface-plan
recommendations: /recommendations, /recommendations/proof-drift
content: /generated-content, /content-fact-guard
publish: /launch-package, /launch-package/delivery-gate, /repurpose-matrix, /social-upload-tasks
retest: /retest, /retest-batches, /retest-batch-quality, /retest-placeholder-repair
ops: /customer-operations, /customer-operations/worker, /run-package, /operator-review-queue
foundation: /agent-foundation, /agent-task-nodes, /context-drive, /skill-proposals
```

Every write route needs admin/client-intake authorization equivalent to:

```text
x-geo-admin-key: $ADMIN_CONTROL_KEY
x-geobuild-intake-token: $CLIENT_INTAKE_TOKEN
```

## Phase 4. Service Layer

Port or recreate `src/lib/geobuild-service.ts` as the domain boundary. It must own:

- material intake and parsing orchestration
- source asset normalization and diagnostics
- evidence brief and reconciliation
- reach analysis and question set generation
- recommendations and generated content
- launch packages and delivery gates
- retest batches and strategy feedback
- customer operation runs
- run trace and task node updates
- ContextDrive projection
- skill registry and strategy versions

Do not scatter business logic across route handlers.

## Phase 5. Agent Runtime

This is the core of "GeoBuild as a skill".

Original code map:

```text
src/lib/agent-runtime/workspace-tools.ts
src/lib/agent-runtime/tool-registry.ts
src/lib/agent-runtime/planner.ts
src/lib/agent-runtime/prompt-assembler.ts
src/lib/agent-runtime/session-store.ts
src/lib/agent-runtime/loop.ts
src/lib/agent-kernel/index.ts
src/lib/agent-kernel/claude.ts
src/lib/agent-kernel/status.ts
```

Required behavior:

- `GET /api/agent?compact=1` exposes compact tool names/descriptions.
- `POST /api/agent` supports compact and full turns.
- Customer scope blocks unsafe writes unless the client token route allows them.
- Internal/admin scope can execute the full registry with admin key.
- Deterministic planner handles obvious workflows before model planning.
- Every mutating turn writes run trace, session entry, task state, and Convex mirror when enabled.

## Phase 6. Material Pipeline

Minimum supported inputs:

- structured brand/product fields
- public URLs
- Google Drive folder/file links
- uploads for PDF, Office, ZIP/TAR/TGZ/RAR/7z, text, image/video/audio metadata
- visual captions and rollback

Minimum gates:

```text
material-route-fulfillment
material-readiness
material-evidence-brief
evidence-reconcile
source-lint
content-fact-guard
```

## Phase 7. Convex Realtime Layer

Implement Convex only after Prisma/source routes work.

Original code map:

```text
convex/schema.ts
convex/geobuild.ts
src/lib/convex-sync.ts
src/lib/convex-derived-summaries.ts
scripts/convex-local-smoke.mjs
scripts/convex-api-smoke.mjs
scripts/convex-production-bootstrap.mjs
scripts/convex-production-cutover.mjs
scripts/convex-history-backfill.mjs
scripts/convex-production-doctor.mjs
```

Required proof:

- local smoke writes and reads workspace overview
- production doctor shows no gaps
- `convex-sync?probe=1` returns `status=in_sync`
- `source=auto` resolves to Convex for state, material summary, reach summary, and customer operations

## Phase 8. Workers

Implement background runners:

```text
scripts/customer-operation-runner.mjs
scripts/geobuild-worker.mjs
scripts/social-upload-runner.mjs
```

Customer operations must provide immediate `runId`, progress, cancel, retry, and failure recovery.

Social upload must stay disabled by default. It can prepare tasks and assets, but real upload requires explicit runner configuration and human approval.

## Phase 9. Verification

A clone is not complete until these pass or equivalent checks exist:

```bash
npm exec -- tsc --noEmit
npm run lint
npm run build
npm run convex:local-smoke
npm run convex:api-smoke -- --json
npm run convex:api-smoke -- --require-convex
node .agents/skills/geobuild-geo-platform/scripts/live-smoke.mjs --base-url <target>/build --require-convex
```

If Convex is not part of the target, replace the last two checks with explicit realtime/read-model parity tests and document the deviation.

## Completion Definition

Claim "GeoBuild/GEO all functions implemented" only when:

- all workflow stages from material intake through retest and strategy feedback are usable
- all mutating routes have auth and dry-run/confirmation boundaries
- all generated content passes fact guard before publish-ready status
- customer operations expose runId/progress/cancel/retry
- Agent registry covers the 93 canonical tool names from `src/lib/agent-runtime/workspace-tools.ts` or the target has a documented equivalent map
- live smoke or local equivalent proves runtime readiness
- deployment/release metadata identifies the exact code version

Otherwise say "partial GeoBuild implementation" and list missing layers.
