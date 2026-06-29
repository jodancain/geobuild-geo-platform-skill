#!/usr/bin/env node

const defaults = {
  baseUrl: "https://geo.youngtuo.win/build",
  timeoutMs: 45000,
};

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

function parseArgs(argv) {
  const parsed = {
    baseUrl: process.env.GEOBUILD_BASE_URL || defaults.baseUrl,
    timeoutMs: Number(process.env.GEOBUILD_SMOKE_TIMEOUT_MS || defaults.timeoutMs),
    json: false,
    requireConvex: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--base-url") parsed.baseUrl = takeValue(argv, (index += 1), arg);
    else if (arg === "--timeout-ms") parsed.timeoutMs = Number(takeValue(argv, (index += 1), arg));
    else if (arg === "--json") parsed.json = true;
    else if (arg === "--require-convex") parsed.requireConvex = true;
    else if (arg === "--help" || arg === "-h") parsed.help = true;
    else throw new Error(`Unknown option: ${arg}`);
  }

  parsed.baseUrl = normalizeBaseUrl(parsed.baseUrl);
  if (!Number.isFinite(parsed.timeoutMs) || parsed.timeoutMs < 1000) {
    parsed.timeoutMs = defaults.timeoutMs;
  }
  return parsed;
}

function printHelp() {
  console.log(`GeoBuild portable live smoke

Usage:
  node .agents/skills/geobuild-geo-platform/scripts/live-smoke.mjs
  node .agents/skills/geobuild-geo-platform/scripts/live-smoke.mjs --base-url https://geo.youngtuo.win/build --json
  node .agents/skills/geobuild-geo-platform/scripts/live-smoke.mjs --require-convex

Checks:
  - GET /api/healthz
  - GET /api/workspace/convex-doctor
  - GET /api/workspace/convex-sync?probe=1
  - GET /api/workspace/state?source=auto
  - GET /api/workspace/material-intake-summary?source=auto
  - GET /api/workspace/reach-summary?source=auto
  - GET /workspace/agent
`);
}

async function main() {
  const checks = await Promise.all([
    checkJson("health", "/api/healthz"),
    checkJson("doctor", "/api/workspace/convex-doctor"),
    checkJson("probe", "/api/workspace/convex-sync?probe=1"),
    checkJson("state", "/api/workspace/state?source=auto"),
    checkJson("materialSummary", "/api/workspace/material-intake-summary?source=auto"),
    checkJson("reachSummary", "/api/workspace/reach-summary?source=auto"),
    checkText("agentPage", "/workspace/agent"),
  ]);

  const byName = Object.fromEntries(checks.map((item) => [item.name, item]));
  const health = byName.health?.data;
  const doctor = byName.doctor?.data;
  const probe = byName.probe?.data;
  const state = byName.state?.data;
  const material = byName.materialSummary?.data;
  const reach = byName.reachSummary?.data;

  const convexReady =
    health?.checks?.convex?.enabled === true &&
    health?.checks?.convex?.status === "ready" &&
    doctor?.ok === true &&
    Array.isArray(doctor?.gaps) &&
    doctor.gaps.length === 0 &&
    probe?.ok === true &&
    probe?.status === "in_sync";

  const output = {
    ok:
      checks.every((item) => item.ok) &&
      health?.ok === true &&
      byName.agentPage?.textLength > 500 &&
      (!args.requireConvex || convexReady),
    generatedAt: new Date().toISOString(),
    baseUrl: args.baseUrl,
    release: {
      buildCommit: health?.release?.buildCommit ?? null,
      buildRef: health?.release?.buildRef ?? null,
      source: health?.release?.source ?? null,
    },
    core: {
      healthOk: health?.ok === true,
      database: health?.checks?.database?.ok === true,
      redis: health?.checks?.redis?.ok === true,
      agentKernel: health?.checks?.agentKernel?.ready === true,
      readyReachPlatforms: Array.isArray(health?.checks?.reachPlatforms)
        ? health.checks.reachPlatforms.filter((platform) => platform?.ready === true).map((platform) => platform.platform)
        : [],
    },
    convex: {
      ready: convexReady,
      healthStatus: health?.checks?.convex?.status ?? null,
      enabled: health?.checks?.convex?.enabled === true,
      mutationTokenConfigured: health?.checks?.convex?.mutationTokenConfigured === true,
      doctorOk: doctor?.ok === true,
      doctorGaps: Array.isArray(doctor?.gaps) ? doctor.gaps : null,
      probeOk: probe?.ok === true,
      probeStatus: probe?.status ?? null,
    },
    reads: {
      stateSource: state?.source ?? state?.protocol?.source ?? null,
      stateStage: state?.stats?.currentStage ?? state?.workspace?.currentStage ?? null,
      materialSource: material?.source ?? material?.protocol?.source ?? null,
      materialAssets: material?.stats?.assets ?? material?.stats?.totalAssets ?? material?.totalAssets ?? null,
      materialReadinessScore: material?.stats?.readinessScore ?? null,
      reachSource: reach?.source ?? reach?.protocol?.source ?? null,
      reachScore: reach?.latestAnalysis?.reachScore ?? reach?.summary?.reachScore ?? reach?.stats?.reachScore ?? null,
    },
    checks: checks.map(({ name, ok, httpStatus, latencyMs, error, textLength }) => ({
      name,
      ok,
      httpStatus,
      latencyMs,
      textLength,
      error,
    })),
  };

  if (args.json) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    printText(output);
  }

  process.exit(output.ok ? 0 : args.requireConvex && !convexReady ? 2 : 1);
}

async function checkJson(name, path) {
  const startedAt = Date.now();
  try {
    const response = await fetchWithTimeout(`${args.baseUrl}${path}`, { headers: { accept: "application/json" } });
    const text = await response.text();
    const data = parseJson(text);
    return {
      name,
      ok: response.ok,
      httpStatus: response.status,
      latencyMs: Date.now() - startedAt,
      data,
      textLength: text.length,
      error: response.ok ? null : compact(data) || text.slice(0, 300),
    };
  } catch (error) {
    return {
      name,
      ok: false,
      httpStatus: null,
      latencyMs: Date.now() - startedAt,
      data: null,
      textLength: 0,
      error: compactError(error),
    };
  }
}

async function checkText(name, path) {
  const startedAt = Date.now();
  try {
    const response = await fetchWithTimeout(`${args.baseUrl}${path}`, { headers: { accept: "text/html,*/*" } });
    const text = await response.text();
    return {
      name,
      ok: response.ok && text.length > 500,
      httpStatus: response.status,
      latencyMs: Date.now() - startedAt,
      data: null,
      textLength: text.length,
      error: response.ok ? null : text.slice(0, 300),
    };
  } catch (error) {
    return {
      name,
      ok: false,
      httpStatus: null,
      latencyMs: Date.now() - startedAt,
      data: null,
      textLength: 0,
      error: compactError(error),
    };
  }
}

async function fetchWithTimeout(url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), args.timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function compact(value) {
  if (!value || typeof value !== "object") return "";
  if (typeof value.error === "string") return value.error;
  if (typeof value.reason === "string") return value.reason;
  return "";
}

function compactError(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function normalizeBaseUrl(value) {
  const trimmed = String(value || "").trim().replace(/\/+$/, "");
  if (!trimmed) return defaults.baseUrl;
  return trimmed.endsWith("/build") ? trimmed : `${trimmed}/build`;
}

function takeValue(argv, index, option) {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new Error(`${option} requires a value.`);
  return value;
}

function printText(output) {
  console.log(`GeoBuild live smoke ${output.ok ? "PASS" : "FAIL"}`);
  console.log(`baseUrl=${output.baseUrl}`);
  console.log(`buildCommit=${output.release.buildCommit || "-"}`);
  console.log(`core database=${output.core.database} redis=${output.core.redis} agentKernel=${output.core.agentKernel}`);
  console.log(`reachPlatforms=${output.core.readyReachPlatforms.join(",") || "-"}`);
  console.log(`convex ready=${output.convex.ready} status=${output.convex.probeStatus || output.convex.healthStatus || "-"}`);
  console.log(`reads state=${output.reads.stateSource || "-"} material=${output.reads.materialSource || "-"} reach=${output.reads.reachSource || "-"}`);
  for (const check of output.checks) {
    console.log(`${check.ok ? "ok" : "fail"} ${check.name} http=${check.httpStatus ?? "-"} latencyMs=${check.latencyMs}`);
    if (check.error) console.log(`  error=${check.error}`);
  }
}
