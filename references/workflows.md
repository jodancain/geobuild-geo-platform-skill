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
```

Mark platform status only after real human confirmation:

```bash
curl -sS -X PATCH "$BASE/api/workspace/launch-package" \
  "${ADMIN_HEADER[@]}" \
  -H "Content-Type: application/json" \
  -d '{"id":"<launchPackageId>","platform":"website","platformStatus":"published"}'
```

## 6. Retest And Strategy Feedback

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
curl -sS "$BASE/api/workspace/run-package/markdown"
curl -sS "$BASE/api/workspace/context-drive"
curl -sS "$BASE/api/workspace/convex-sync?probe=1"
```

Report what is complete, what is partial, and which exact proof supports each claim.
