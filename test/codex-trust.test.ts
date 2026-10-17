import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

vi.mock("node:os", async (original) => ({ ...(await original<typeof import("node:os")>()), homedir: () => process.env.BANKAI_TEST_HOME! }));
import { ensureCodexTrust } from "../src/commands/run.js";
const roots: string[] = [];
const before = { CODEX_HOME: process.env.CODEX_HOME, BANKAI_TEST_HOME: process.env.BANKAI_TEST_HOME };
afterEach(() => {
  for (const p of roots.splice(0)) rmSync(p, { recursive: true, force: true });
  for (const [k, v] of Object.entries(before)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
});
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "bankai-codex-trust-")); roots.push(root);
  process.env.BANKAI_TEST_HOME = root;
  return root;
}
describe("Codex trust home", () => {
  it("uses inherited CODEX_HOME without touching the default home, idempotently", () => {
    const root = fixture(); process.env.CODEX_HOME = join(root, "custom account");
    ensureCodexTrust();
    const file = join(process.env.CODEX_HOME, "config.toml"), first = readFileSync(file, "utf8");
    expect(first).toContain('trust_level = "trusted"');
    ensureCodexTrust(); expect(readFileSync(file, "utf8")).toBe(first);
    expect(existsSync(join(root, ".codex"))).toBe(false);
  });
  it("falls back to ~/.codex when CODEX_HOME is unset", () => {
    const root = fixture(); delete process.env.CODEX_HOME;
    ensureCodexTrust(); expect(readFileSync(join(root, ".codex/config.toml"), "utf8")).toContain('trust_level = "trusted"');
  });
  it("uses the resolved agent-specific home in preference to inherited env", () => {
    const root = fixture(); process.env.CODEX_HOME = join(root, "parent");
    ensureCodexTrust(join(root, "agent"));
    expect(existsSync(join(root, "agent/config.toml"))).toBe(true);
    expect(existsSync(process.env.CODEX_HOME)).toBe(false);
  });
});
