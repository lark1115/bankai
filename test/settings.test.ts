import { describe, it, expect } from "vitest";
import { deepMerge, isDeepSubset } from "../src/settings.js";

describe("deepMerge", () => {
  it("merges nested objects", () => {
    const base = { a: { b: 1 } };
    const overlay = { a: { c: 2 } };
    expect(deepMerge(base, overlay)).toEqual({ a: { b: 1, c: 2 } });
  });

  it("union-merges arrays instead of replacing", () => {
    const base = { sandbox: { filesystem: { allowWrite: ["/other"] } } };
    const overlay = { sandbox: { filesystem: { allowWrite: ["/tmp"] } } };
    const result = deepMerge(base, overlay);
    expect(result).toEqual({
      sandbox: { filesystem: { allowWrite: ["/other", "/tmp"] } },
    });
  });

  it("deduplicates array entries on union-merge", () => {
    const base = { sandbox: { filesystem: { allowWrite: ["/tmp", "/other"] } } };
    const overlay = { sandbox: { filesystem: { allowWrite: ["/tmp"] } } };
    const result = deepMerge(base, overlay);
    expect(result).toEqual({
      sandbox: { filesystem: { allowWrite: ["/tmp", "/other"] } },
    });
  });

  it("creates array when base has no existing key", () => {
    const base = { hooks: {} };
    const overlay = { sandbox: { filesystem: { allowWrite: ["/tmp"] } } };
    const result = deepMerge(base, overlay);
    expect(result).toEqual({
      hooks: {},
      sandbox: { filesystem: { allowWrite: ["/tmp"] } },
    });
  });

  it("does not override sandbox.enabled if already set to false", () => {
    const base = { sandbox: { enabled: false, filesystem: { allowWrite: ["/other"] } } };
    const overlay = { sandbox: { filesystem: { allowWrite: ["/tmp"] } } };
    const result = deepMerge(base, overlay);
    expect((result.sandbox as Record<string, unknown>).enabled).toBe(false);
  });

  it("replaces scalar values", () => {
    const base = { a: 1 };
    const overlay = { a: 2 };
    expect(deepMerge(base, overlay)).toEqual({ a: 2 });
  });
});

describe("isDeepSubset", () => {
  it("returns true for exact match", () => {
    expect(isDeepSubset({ a: 1 }, { a: 1 })).toBe(true);
  });

  it("returns true when haystack is superset of needle (objects)", () => {
    expect(isDeepSubset({ a: 1, b: 2 }, { a: 1 })).toBe(true);
  });

  it("returns true when haystack array contains all needle elements", () => {
    expect(isDeepSubset(["/tmp", "/other"], ["/tmp"])).toBe(true);
  });

  it("returns true when haystack array equals needle array", () => {
    expect(isDeepSubset(["/tmp"], ["/tmp"])).toBe(true);
  });

  it("returns false when haystack array is missing needle element", () => {
    expect(isDeepSubset(["/other"], ["/tmp"])).toBe(false);
  });

  it("returns true for nested sandbox config already applied", () => {
    const haystack = {
      sandbox: { filesystem: { allowWrite: ["/tmp", "/other", "/home"] } },
    };
    const needle = {
      sandbox: { filesystem: { allowWrite: ["/tmp"] } },
    };
    expect(isDeepSubset(haystack, needle)).toBe(true);
  });

  it("returns false when nested sandbox config is missing required path", () => {
    const haystack = {
      sandbox: { filesystem: { allowWrite: ["/other"] } },
    };
    const needle = {
      sandbox: { filesystem: { allowWrite: ["/tmp"] } },
    };
    expect(isDeepSubset(haystack, needle)).toBe(false);
  });
});
