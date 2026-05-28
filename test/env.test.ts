import { describe, it, expect, vi } from "vitest";
import { resolveEnvVars } from "../src/env.js";

describe("resolveEnvVars", () => {
  it("returns undefined when no env is provided", () => {
    expect(resolveEnvVars(undefined)).toBeUndefined();
  });

  it("passes literal values through unchanged", () => {
    const result = resolveEnvVars(
      { ANTHROPIC_BASE_URL: "https://api.z.ai/api/anthropic" },
      {},
    );
    expect(result).toEqual({
      ANTHROPIC_BASE_URL: "https://api.z.ai/api/anthropic",
    });
  });

  it("interpolates ${VAR} from the source environment", () => {
    const result = resolveEnvVars(
      { ANTHROPIC_AUTH_TOKEN: "${ZAI_API_KEY}" },
      { ZAI_API_KEY: "secret-123" },
    );
    expect(result).toEqual({ ANTHROPIC_AUTH_TOKEN: "secret-123" });
  });

  it("interpolates multiple references within one value", () => {
    const result = resolveEnvVars(
      { COMBO: "${A}-${B}" },
      { A: "foo", B: "bar" },
    );
    expect(result).toEqual({ COMBO: "foo-bar" });
  });

  it("resolves a missing reference to empty string and warns", () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = resolveEnvVars({ TOKEN: "${MISSING}" }, {});
    expect(result).toEqual({ TOKEN: "" });
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("does not touch keys, only values", () => {
    const result = resolveEnvVars({ "${NOT_A_VAR}": "literal" }, { X: "y" });
    expect(result).toEqual({ "${NOT_A_VAR}": "literal" });
  });
});
