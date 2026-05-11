import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { runLiveScan, LiveScanError } from "./live-scan.server";
import { LIVE_SCAN_FALLBACK_MESSAGE } from "./live-scan-messages";

const URL_MAP = "https://api.firecrawl.dev/v2/map";
const URL_SCRAPE = "https://api.firecrawl.dev/v2/scrape";
const URL_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";

type Handler = (init?: RequestInit) => Promise<Response> | Response;

function jsonRes(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function installFetch(handlers: Record<string, Handler>) {
  const mock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    for (const [prefix, h] of Object.entries(handlers)) {
      if (url.startsWith(prefix)) return h(init);
    }
    throw new Error(`Unmocked fetch: ${url}`);
  });
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
}

const HOME = "https://example.com";
const LINKS = [
  HOME,
  `${HOME}/about`,
  `${HOME}/services`,
  `${HOME}/contact`,
  `${HOME}/faq`,
];

const RICH_MD = "Welcome to Example Co. ".repeat(60);

beforeEach(() => {
  process.env.LOVABLE_API_KEY = "test-lov";
  process.env.FIRECRAWL_API_KEY = "test-fc";
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function expectFailure(promise: Promise<unknown>): Promise<LiveScanError> {
  try {
    await promise;
  } catch (e) {
    expect(e).toBeInstanceOf(LiveScanError);
    return e as LiveScanError;
  }
  throw new Error("Expected runLiveScan to throw");
}

describe("runLiveScan failure classification", () => {
  it("page_discovery_failed when map returns 4xx", async () => {
    installFetch({
      [URL_MAP]: () => new Response("bad request", { status: 400 }),
    });
    const err = await expectFailure(runLiveScan("example.com", "more_leads"));
    expect(err.code).toBe("page_discovery_failed");
    expect(err.diagnostics.mapSucceeded).toBe(false);
    expect(err.diagnostics.normalizedUrl).toBe("example.com");
    expect(err.diagnostics.rawError).toBeDefined();
  });

  it("firecrawl_unavailable when map returns 5xx", async () => {
    installFetch({
      [URL_MAP]: () => new Response("upstream", { status: 502 }),
    });
    const err = await expectFailure(runLiveScan("example.com", "more_leads"));
    expect(err.code).toBe("firecrawl_unavailable");
    expect(err.diagnostics.mapSucceeded).toBe(false);
  });

  it("page_scrape_failed when every scrape fails", async () => {
    installFetch({
      [URL_MAP]: () => jsonRes({ links: LINKS }),
      [URL_SCRAPE]: () => new Response("nope", { status: 500 }),
    });
    const err = await expectFailure(runLiveScan("example.com", "more_leads"));
    expect(err.code).toBe("page_scrape_failed");
    expect(err.diagnostics.mapSucceeded).toBe(true);
    expect(err.diagnostics.discoveredCount).toBe(LINKS.length);
    expect(err.diagnostics.selectedPages.length).toBeGreaterThan(0);
    expect(err.diagnostics.scrapedCount).toBe(0);
  });

  it("no_content when scrapes succeed but markdown is too short", async () => {
    installFetch({
      [URL_MAP]: () => jsonRes({ links: LINKS }),
      [URL_SCRAPE]: () => jsonRes({ markdown: "hi" }),
    });
    const err = await expectFailure(runLiveScan("example.com", "more_leads"));
    expect(err.code).toBe("no_content");
    expect(err.diagnostics.scrapedCount).toBeGreaterThan(0);
    expect(err.diagnostics.totalChars).toBeLessThan(200);
    expect(err.diagnostics.llmCallStarted).toBe(false);
  });

  it("llm_unavailable when AI gateway errors", async () => {
    installFetch({
      [URL_MAP]: () => jsonRes({ links: LINKS }),
      [URL_SCRAPE]: () => jsonRes({ markdown: RICH_MD }),
      [URL_AI]: () => new Response("ai down", { status: 503 }),
    });
    const err = await expectFailure(runLiveScan("example.com", "more_leads"));
    expect(err.code).toBe("llm_unavailable");
    expect(err.diagnostics.llmCallStarted).toBe(true);
    expect(err.diagnostics.totalChars).toBeGreaterThan(200);
  });

  it("validation_failed when AI returns no tool call", async () => {
    installFetch({
      [URL_MAP]: () => jsonRes({ links: LINKS }),
      [URL_SCRAPE]: () => jsonRes({ markdown: RICH_MD }),
      [URL_AI]: () => jsonRes({ choices: [{ message: { content: "no tool" } }] }),
    });
    const err = await expectFailure(runLiveScan("example.com", "more_leads"));
    expect(err.code).toBe("validation_failed");
    expect(err.diagnostics.llmCallStarted).toBe(true);
    expect(err.diagnostics.validationFailed).toBe(true);
  });

  it("redacts bearer tokens from rawError", async () => {
    installFetch({
      [URL_MAP]: () =>
        new Response("Bearer sk-secret-12345 failed", { status: 400 }),
    });
    const err = await expectFailure(runLiveScan("example.com", "more_leads"));
    expect(err.diagnostics.rawError ?? "").not.toContain("sk-secret-12345");
  });
});

describe("public fallback message", () => {
  it("matches the user-facing copy shown on the analyzing route", () => {
    expect(LIVE_SCAN_FALLBACK_MESSAGE).toBe(
      "We couldn't complete a live scan for this site. You can try another URL or run a prototype recommendation based on business-type patterns.",
    );
  });
});
