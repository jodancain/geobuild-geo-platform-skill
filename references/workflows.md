# GeoBuild Workflow Reference

Use this reference to operate an existing GeoBuild instance or to implement the same workflow in another repo.

Set a base URL:

```bash
BASE="${GEOBUILD_BASE_URL:-https://geo.youngtuo.win/build}"
```

For writes, use:

```bash
ADMIN_HEADER=(-H "x-geo-admin-key: $ADMIN_CONTROL_KEY")
INTAKE_HEADER=(-H "x-geobuild-intake-token: $CLIENT_INTAKE_TOKEN")
```

## 0. Readiness

Read-only production checks:

```bash
curl -sS "$BASE/api/healthz"
curl -sS "$BASE/api/workspace/convex-doctor"
curl -sS "$BASE/api/workspace/convex-sync?probe=1"
curl -sS "$BASE/api/workspace/state?source=auto"
curl -sS "$BASE/api/workspace/material-intake-summary?source=auto"
curl -sS "$BASE/api/workspace/reach-summary?source=auto"
curl -sS "$BASE/workspace/agent" -o /tmp/geobuild-agent.html
```

Portable skill smoke:

```bash
node .agents/skills/geobuild-geo-platform/scripts/live-smoke.mjs --base-url "$BASE" --json
```

Original repo smoke:

```bash
npm run convex:api-smoke -- --json
npm run convex:api-smoke -- --require-convex
```

## 1. Material Intake

Start with routing when the customer gives several links or a Drive folder:

```bash
curl -sS -X POST "$BASE/api/workspace/material-router" \
  "${INTAKE_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"message":"客户发来的官网/Drive/资料链接","maxFiles":40,"maxDepth":3}'
```

Direct source APIs:

```text
POST /api/workspace/intake
POST /api/workspace/intake/chat
POST /api/workspace/intake/url
POST /api/workspace/source-assets
POST /api/workspace/source-assets/upload
POST /api/workspace/material-router
GET  /api/workspace/google-drive-material-diagnostic/markdown
```

After intake, verify material quality:

```bash
curl -sS "$BASE/api/workspace/material-route-fulfillment/markdown"
curl -sS "$BASE/api/workspace/material-readiness/markdown"
curl -sS "$BASE/api/workspace/material-evidence-brief/markdown"
curl -sS "$BASE/api/workspace/evidence-reconcile/markdown"
```

Do not run reach analysis until materials are readable enough or the user explicitly accepts a partial-material analysis.

### 1.1 Visual Artifact Storage

Check PDF page images, uploaded images, Office embedded images, and archive child images before long-running retests or public reports:

```bash
curl -sS "$BASE/api/workspace/visual-artifact-storage-plan"
curl -sS "$BASE/api/workspace/visual-artifact-storage-plan/markdown"
```

Preview repair for older artifacts that are filesystem-only, missing DB fallback, or need object copies:

```bash
curl -sS -X POST "$BASE/api/workspace/visual-artifact-storage-plan/repair" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"dryRun":true,"limit":50}'
```

Only after previewing, execute with `dryRun:false`. The repair endpoint appends DB embedded fallback, DB blob fallback, and S3/R2/COS object-copy metadata; it does not delete old local files, old fallback data, or `relativePath`. When a filesystem-only Google Drive artifact lost its local file, repair tries to re-download the original Drive file from stored metadata before marking it missing. If no object bucket exists, `GOOGLE_DRIVE_VISUAL_ARTIFACT_DB_BLOB_ENABLED=true` with `GOOGLE_DRIVE_VISUAL_ARTIFACT_DB_BLOB_MAX_MB=32` stores large recovered artifacts in Postgres `VisualArtifactBlob`.

## 1.5 Keyword Intelligence

Build the AiDSO-style keyword loop before or immediately after reach analysis:

```bash
curl -sS "$BASE/api/workspace/keyword-intelligence"
curl -sS "$BASE/api/workspace/keyword-intelligence/markdown"
```

Import external search/trend signals with admin auth when an industry keyword export is available:

```bash
curl -sS -X POST "$BASE/api/workspace/keyword-intelligence/signals" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"provider":"baidu-index-export","observedAt":"2026-07-01","keywords":[{"keyword":"免浆牛蛙","group":"core","searchVolume":3200,"trend":"rising","competition":"medium","relatedTerms":["免浆切块牛蛙"]}]}'
```

This is not a traditional SEO keyword report. The loop must be:

```text
core term -> AI expansion -> category filtering -> question set -> content matrix -> AI-platform retest -> next keyword round
```

Traffic values are internal signals until an external search/trend connector is attached. Use material hits, question coverage, content coverage, and retest coverage as the default basis.

Optional external search/trend signals can also be imported through `GEOBUILD_KEYWORD_EXTERNAL_SIGNALS_JSON`. The value may be a JSON array or an object with `provider`, `observedAt`, and `keywords` / `terms` / `items` / `data` / `rows`. Supported per-keyword fields include `keyword` / `term` / `word`, `group`, `searchVolume` / `volume` / `monthlySearches` / `heat`, `trend`, `competition`, `cpc`, `relatedTerms`, and `note`. GeoBuild treats API/env imports as configured external evidence and still uses internal question/content/retest coverage to decide whether the keyword has entered the AI-platform reach loop.

## 2. Reach Analysis

Run analysis:

```bash
curl -sS -X POST "$BASE/api/workspace/analysis" "${ADMIN_HEADER[@]}"
```

Read analysis and summaries:

```bash
curl -sS "$BASE/api/workspace/analysis?source=auto"
curl -sS "$BASE/api/workspace/reach-summary?source=auto"
curl -sS "$BASE/api/workspace/surface-plan/markdown"
```

The analysis must cover recognition, understanding, citation, recommendation, and repetition. Do not present a simple SEO keyword report as GeoBuild parity.

## 3. Recommendations

Generate strategy recommendations:

```bash
curl -sS -X POST "$BASE/api/workspace/recommendations" "${ADMIN_HEADER[@]}"
```

Audit proof drift before content:

```bash
curl -sS "$BASE/api/workspace/recommendations/proof-drift/markdown"
curl -sS "$BASE/api/workspace/source-lint/markdown"
```

## 4. Content

Generate content synchronously:

```bash
curl -sS -X POST "$BASE/api/workspace/generated-content" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"type":"品牌事实页"}'
```

Generate content as a background customer operation:

```bash
curl -sS -X POST "$BASE/api/workspace/generated-content" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"type":"FAQ","background":true}'
```

Before treating content as publishable:

```bash
curl -sS "$BASE/api/workspace/content-fact-guard/markdown"
curl -sS "$BASE/api/workspace/public-page-smoke/markdown"
```

## 5. Launch Package

Prepare package:

```bash
curl -sS -X POST "$BASE/api/workspace/launch-package" "${ADMIN_HEADER[@]}"
```

Or queue background package:

```bash
curl -sS -X POST "$BASE/api/workspace/launch-package" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"background":true}'
```

Delivery gate:

```bash
curl -sS "$BASE/api/workspace/launch-package/delivery-gate/markdown"
curl -sS "$BASE/api/workspace/repurpose-matrix/markdown"
curl -sS "$BASE/api/workspace/social-upload-tasks/readiness"
```

Safe social upload dry-run smoke. This may create missing upload tasks from the latest launch package, then processes one queued task without posting to any external account:

```bash
curl -sS -X POST "$BASE/api/workspace/social-upload-tasks/smoke" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"createIfMissing":true,"repairAssetBackups":true}'
```

The smoke route remains dry-run only. `repairAssetBackups=true` also writes or refreshes the task-level database backup for `cover.png`, `caption.md`, and `payload.json`, so a Zeabur restart can restore local files even before an external S3/R2/COS bucket is configured.

Execute exactly one reviewed platform task only after readiness says the runner is in execute mode, `sau` is installed, assets are available, and the platform account is logged in:

```bash
curl -sS -X POST "$BASE/api/workspace/social-upload-tasks/execute" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"taskId":"<social-upload-task-id>","confirmationPhrase":"确认发布"}'
```

The execute route refuses bulk execution and returns `blocked` instead of posting when `SOCIAL_UPLOAD_RUNNER_ENABLED`, `SOCIAL_UPLOAD_RUNNER_MODE=execute`, `SOCIAL_UPLOAD_TOOL_DIR`, or account login/session readiness is missing.

Mark platform status only after real human confirmation:

```bash
curl -sS -X PATCH "$BASE/api/workspace/launch-package" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"id":"<launchPackageId>","platform":"website","platformStatus":"published"}'
```

## 6. Retest And Strategy Feedback

DeepSeek web-search plugin smoke:

```bash
curl -sS "$BASE/api/workspace/deepseek-web-search-smoke"
curl -sS "$BASE/api/workspace/connector-readiness"
```

Queue retest:

```bash
curl -sS -X POST "$BASE/api/workspace/retest" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"background":true}'
```

Manual answer retest:

```bash
curl -sS -X POST "$BASE/api/workspace/retest" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"platform":"Doubao","question":"...","answer":"..."}]}'
```

Quality gates:

```bash
curl -sS "$BASE/api/workspace/retest-batch-quality/markdown"
curl -sS "$BASE/api/workspace/strategy-feedback/markdown"
curl -sS "$BASE/api/workspace/strategy-evolution-plan/markdown"
```

Do not write a new strategy version from weak retest batches.

## 7. Customer Operations

List operation runs:

```bash
curl -sS "$BASE/api/workspace/customer-operations?source=auto&limit=10"
```

Start a custom operation:

```bash
curl -sS -X POST "$BASE/api/workspace/customer-operations" \
  "${INTAKE_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"laneId":"material-collection","title":"资料采集","trigger":"客户发来资料包","requestedTool":"route_customer_material"}'
```

Worker one-shot:

```bash
GEOBUILD_WORKER_BASE_URL="$BASE" ADMIN_CONTROL_KEY="$ADMIN_CONTROL_KEY" npm run customer-operation:runner -- --once
```

Worker loop:

```bash
CUSTOMER_OPERATION_RUNNER_ENABLED=true npm run customer-operation:runner
```

## 8. Agent Chat

Inspect available tools:

```bash
curl -sS "$BASE/api/agent?compact=1"
```

Read-only compact question:

```bash
curl -sS -X POST "$BASE/api/agent" \
  -H "Content-Type: application/json" \
  -d '{"message":"现在资料够不够分析？","compact":true}'
```

Authenticated write-capable turn:

```bash
curl -sS -X POST "$BASE/api/agent" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"message":"确认生成品牌事实页并做事实门禁","compact":true,"confirmed":true}'
```

## 9. Closeout

For every substantial run:

```bash
curl -sS "$BASE/api/workspace/customer-flow-regression/markdown"
curl -sS "$BASE/api/workspace/connector-readiness"
curl -sS "$BASE/api/workspace/deepseek-web-search-smoke"
curl -sS "$BASE/api/workspace/social-upload-tasks/readiness"
curl -sS "$BASE/api/workspace/run-package/markdown"
curl -sS "$BASE/api/workspace/context-drive"
curl -sS "$BASE/api/workspace/convex-sync?probe=1"
```

Report what is complete, what is partial, and which exact proof supports each claim.
