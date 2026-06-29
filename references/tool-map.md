# GeoBuild Tool Map

The canonical in-repo registry is `src/lib/agent-runtime/workspace-tools.ts`.

Last extracted count: 88 tools.

## Intake And Evidence

- `normalize_brand_intake`: structure customer brand/product materials into workspace fields.
- `collect_web_evidence`: collect public website, shop, product, news, or social links into SourceAsset evidence.
- `route_customer_material`: route multiple Drive/web/material links into background collection or URL-to-intake runs.
- `advise_material_routes`: read-only advice for how to submit PDF, Drive, ZIP/TAR/TGZ/RAR/7z, Office, legacy Office, image/video/audio/design, or text materials.
- `audit_material_route_fulfillment`: verify which submitted materials are readable enough for analysis.
- `build_material_evidence_brief`: produce a traceable factual evidence brief from materials and intake fields.
- `build_url_to_intake`: turn a website/shop/product/Drive link into a draft brand/product intake.
- `collect_google_drive_evidence`: collect Google Drive folders/files, including Docs, Sheets, Slides, PDF, Office, and media metadata.
- `diagnose_google_drive_material`: read-only Drive permission/parser/download diagnosis.
- `upload_material_asset`: parse uploaded files into SourceAsset records.
- `build_web_evidence_package`: search and collect multiple public webpages into an evidence package.
- `visual_material_search`: search OCR/rendered visual artifacts.
- `add_visual_material_caption`: add customer-provided captions/transcripts for image/video/audio/certificate material.
- `remove_visual_material_caption`: dry-run or confirmed rollback of visual captions.

## Analysis, Strategy, Content, Publish

- `analyze_product_materials`: generate AI-platform reach baseline, coverage, evidence gaps, and competitor risk.
- `suggest_reach_strategy`: generate recommendations for recognition, understanding, citation, recommendation, and repetition.
- `generate_reach_content`: generate website drafts, FAQ, comparison, case, brand fact, or social content.
- `prepare_launch_package`: build website, Xiaohongshu, WeChat, Douyin publish package.
- `audit_launch_package_delivery`: check package publish/retest/audit readiness.
- `audit_source_hygiene`: check source binding, link health, forbidden claims, high-risk claims, and fact conflicts.
- `audit_web_route_backlog`: aggregate public web/Drive route backlog and crawler/fallback needs.
- `reconcile_evidence_sources`: rank sources, extract key facts, and identify conflicts.
- `audit_public_page_smoke`: check public URLs for reachability and extractable text.
- `audit_surface_plan`: map question demand to website, shop, social/community, and AI-answer evidence surfaces.
- `audit_intake_field_impact`: verify accepted/ignored fields reached content, launch packages, and retest answers.
- `audit_content_fact_guard`: check generated content and launch packages for unsupported claims and forbidden claims.
- `verify_geo_output`: publication quality gate for unsupported high-certainty claims.
- `build_geo_repurpose_matrix`: convert confirmed facts/content/package into multi-platform reuse matrix.

## Material Repair And Parser Lifecycle

- `audit_material_readiness`: audit Drive, web, PDF, ZIP/TAR/TGZ/RAR/7z, Office, OCR, and visual artifact readability.
- `audit_omni_material_intake`: overall material-ingestion capability audit.
- `plan_material_ingest_repair`: P0/P1/P2 repair queue for material gaps.
- `prioritize_material_upgrades`: prioritize next repair/parser/backfill work.
- `plan_material_parser_spike`: decide whether to test OpenDataLoader PDF, LiteParse, OCR HTTP, or visual layout parser.
- `build_material_parser_evaluation_pack`: turn parser spike into A/B sample pack and decision matrix.
- `build_material_sample_request_pack`: create customer sample request pack.
- `audit_material_sample_request_fulfillment`: verify whether requested samples/captions/access are satisfied.
- `audit_material_sample_next_step_gate`: decide whether to analyze now or wait for more samples.
- `audit_visual_artifact_storage_plan`: check visual artifact storage and migration risks.
- `run_material_upgrade_batch`: queue safe automatic repair steps, default dry-run.
- `backfill_material_ingest_diagnostics`: metadata-only backfill for old SourceAssets.
- `execute_material_ingest_repair`: execute safe recrawls while preserving superseded assets.
- `rollback_material_repair_run`: dry-run or confirmed rollback of repair runs.
- `audit_material_repair_lifecycle`: audit repair plan/run/rollback traceability.

## Customer Operations

- `build_customer_next_action_playbook`: produce one-screen customer next action.
- `run_customer_next_action`: dry-run or confirmed current main action.
- `audit_customer_next_action_outcome`: verify whether the next-action run completed.
- `audit_customer_journey_timeline`: build current customer progress timeline.
- `audit_customer_flow_regression`: full customer flow regression report.
- `run_customer_delivery_closure`: dry-run or confirmed closure of incomplete delivery segments.
- `audit_customer_operation_readiness`: verify long-running operations have receipts, progress, cancel, retry, and recovery.
- `manage_customer_operation_run`: list/start/get/update/cancel/retry operation runs.
- `process_customer_operation_run`: claim and execute queued operation runs.

## Agent Foundation And Governance

- `audit_agent_capability_health`: aggregate skill registry, decisions, proof drift, delivery gate, ContextDrive, strategy feedback, run trace, visual artifact, and connector state.
- `audit_production_sync_readiness`: verify production health, release metadata, GitHub commit, skill registry, and ContextDrive sync.
- `audit_connector_readiness`: check Drive, Composio, Ark, Claude Agent kernel, and token readiness.
- `audit_run_trace_quality`: check trace verification summaries, undo notes, tool timeline, and failure review path.
- `audit_agent_harness_linkage`: check task node, run trace, and ContextDrive commit linkage.
- `repair_agent_harness_linkage`: dry-run or confirmed repair of harness linkage gaps.
- `triage_failed_run_traces`: classify failed traces, default dry-run.
- `build_geo_run_package`: create replayable package of recent Agent actions and quality gates.
- `audit_decision_log_quality`: inspect Skill Registry decision log quality.
- `repair_decision_log_quality`: dry-run or confirmed repair of decision log verification/undo notes.
- `audit_operator_review_queue`: produce P0/P1/P2 operator queue.
- `run_operator_actions`: dry-run or confirmed operator actions; business writes require `includeBusinessWrites=true` and confirmation.
- `audit_operator_automation_readiness`: decide whether cron/heartbeat operator automation is safe.
- `build_geo_skill_proposals`: convert external radar and review queue into skill proposals.
- `audit_skill_proposal_sync`: check whether ready proposals are already covered.
- `audit_skill_source_discovery`: discover local/reminder/GitHub skill sources.
- `build_geo_research_signal_brief`: convert external capability and current gaps into research/action brief.
- `build_scheduled_review_snapshot`: save scheduled review snapshot and diff.
- `audit_external_capability_radar`: scan known project/reminder/GitHub capabilities.
- `plan_capability_adoption_backlog`: prioritize capability adoption backlog.

## Retest And Strategy Feedback

- `prepare_reach_retest`: run post-publication AI-platform reach retest.
- `audit_strategy_feedback_loop`: verify retest results entered strategy versions.
- `audit_retest_batch_quality`: check retest sample quality and strategy-readiness.
- `repair_retest_placeholders`: dry-run or confirmed retest placeholder repair.
- `plan_strategy_evolution`: preview strategy evolution before writing.
- `evolve_strategy_from_retest`: generate new strategy version from latest retest batch.

## Memory, Context, Task State

- `run_full_geo_pipeline`: run analysis, recommendations, content, and launch package as a fixed pipeline.
- `build_geo_harness_plan`: generate Agent task graph.
- `link_geo_evidence_graph`: link materials, analysis, questions, recommendations, content, packages, and retests.
- `evolve_geo_knowledge_base`: save reusable GEO knowledge notes.
- `sync_geo_agent_foundation`: sync searchable knowledge index, skill registry, strategy versions, task node states, and recent traces.
- `sync_geo_context_drive`: project current workspace into GeoContextDrive file tree.
- `read_geo_context_file`: read a GeoContextDrive path.
- `search_geo_knowledge`: search GeoBuild knowledge index.
- `record_geo_run_trace`: record Agent run trace.
- `advance_geo_task_node`: start, complete, block, reset, replay, or confirm a task node.

## API Route Groups

Primary route root:

```text
/build/api/workspace
```

Important groups:

- health and readiness: `/api/healthz`, `/api/ops/health`, `/api/workspace/convex-doctor`, `/api/workspace/convex-sync`
- customer state: `/api/workspace/state`, `/api/workspace/customer-operations`, `/api/workspace/customer-operations/worker`
- intake/materials: `/api/workspace/intake`, `/intake/chat`, `/intake/url`, `/source-assets`, `/source-assets/upload`, `/material-router`
- material audits: `/material-readiness`, `/material-evidence-brief`, `/material-route-fulfillment`, `/material-repair-plan`, `/material-repair-lifecycle`
- analysis/strategy: `/analysis`, `/recommendations`, `/surface-plan`, `/strategy-feedback`, `/strategy-evolution-plan`
- content/publish: `/generated-content`, `/content-fact-guard`, `/launch-package`, `/launch-package/delivery-gate`, `/repurpose-matrix`
- retest: `/retest`, `/retest-batches`, `/retest-batch-quality`, `/retest-placeholder-repair`
- Agent memory: `/agent-foundation`, `/agent-task-nodes`, `/context-drive`, `/run-package`, `/run-trace-quality`

When implementing a clone, expose equivalent routes or adapters. If the clone lacks these surfaces, say exactly which GEO functions are not implemented.
