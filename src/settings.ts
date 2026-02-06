import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import Database from "better-sqlite3";
import type { JsonTarget, SqliteTarget, SettingsTarget } from "./registry/types.js";

// --- Path resolution ---

export function resolveTargetPath(filePath: string): string {
  if (filePath.startsWith("~/")) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return path.resolve(filePath);
}

// --- Deep merge ---

export function deepMerge(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...base };
  for (const key of Object.keys(overlay)) {
    const baseVal = base[key];
    const overVal = overlay[key];
    if (
      typeof baseVal === "object" &&
      baseVal !== null &&
      !Array.isArray(baseVal) &&
      typeof overVal === "object" &&
      overVal !== null &&
      !Array.isArray(overVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overVal as Record<string, unknown>,
      );
    } else {
      result[key] = overVal;
    }
  }
  return result;
}

// --- Deep subset check ---

export function isDeepSubset(
  haystack: unknown,
  needle: unknown,
): boolean {
  if (needle === haystack) return true;

  if (
    typeof needle === "object" &&
    needle !== null &&
    !Array.isArray(needle) &&
    typeof haystack === "object" &&
    haystack !== null &&
    !Array.isArray(haystack)
  ) {
    const h = haystack as Record<string, unknown>;
    const n = needle as Record<string, unknown>;
    return Object.keys(n).every((key) => isDeepSubset(h[key], n[key]));
  }

  if (Array.isArray(needle) && Array.isArray(haystack)) {
    if (needle.length !== haystack.length) return false;
    return needle.every((item, i) => isDeepSubset(haystack[i], item));
  }

  return JSON.stringify(haystack) === JSON.stringify(needle);
}

// --- modes4 patch ---

interface Modes4Entry {
  id: string;
  [key: string]: unknown;
}

export function patchModes4(
  modes4: Modes4Entry[],
  patch: { id: string; set: Record<string, unknown> },
): Modes4Entry[] {
  return modes4.map((entry) => {
    if (entry.id === patch.id) {
      return { ...entry, ...patch.set };
    }
    return entry;
  });
}

export function isModes4PatchApplied(
  modes4: Modes4Entry[],
  patch: { id: string; set: Record<string, unknown> },
): boolean {
  const entry = modes4.find((e) => e.id === patch.id);
  if (!entry) return false;
  return Object.entries(patch.set).every(
    ([key, val]) => entry[key] === val,
  );
}

// --- JSON target ---

export function isJsonAlreadyApplied(target: JsonTarget): boolean {
  const filePath = resolveTargetPath(target.filePath);
  if (!fs.existsSync(filePath)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return isDeepSubset(data, target.merge);
  } catch {
    return false;
  }
}

export function applyJsonSettings(target: JsonTarget): void {
  const filePath = resolveTargetPath(target.filePath);
  let data: Record<string, unknown> = {};
  if (fs.existsSync(filePath)) {
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      // overwrite invalid JSON
    }
  } else {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const merged = deepMerge(data, target.merge);
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n");
}

// --- SQLite target ---

export function isSqliteAlreadyApplied(target: SqliteTarget): boolean {
  const dbPath = resolveTargetPath(target.dbPath);
  if (!fs.existsSync(dbPath)) return false;
  try {
    const db = new Database(dbPath, { readonly: true });
    const row = db
      .prepare(`SELECT value FROM ${target.table} WHERE key = ?`)
      .get(target.key) as { value: string } | undefined;
    db.close();
    if (!row) return false;

    const data = JSON.parse(row.value);
    const sub = getNestedValue(data, target.mergePath);
    if (sub === undefined) return false;

    const mergeApplied = isDeepSubset(sub, target.merge);

    if (target.modes4Patch) {
      const modes4 = (sub as Record<string, unknown>).modes4 as
        | Modes4Entry[]
        | undefined;
      if (!modes4) return false;
      return mergeApplied && isModes4PatchApplied(modes4, target.modes4Patch);
    }

    return mergeApplied;
  } catch {
    return false;
  }
}

export function applySqliteSettings(target: SqliteTarget): void {
  const dbPath = resolveTargetPath(target.dbPath);
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database not found: ${dbPath}`);
  }

  const db = new Database(dbPath);
  const row = db
    .prepare(`SELECT value FROM ${target.table} WHERE key = ?`)
    .get(target.key) as { value: string } | undefined;

  let data: Record<string, unknown> = {};
  if (row) {
    data = JSON.parse(row.value);
  }

  // Get or create the nested object at mergePath
  let sub = getNestedValue(data, target.mergePath) as
    | Record<string, unknown>
    | undefined;
  if (!sub || typeof sub !== "object") {
    sub = {};
  }

  // Deep merge
  const merged = deepMerge(sub, target.merge);

  // Apply modes4 patch if present
  if (target.modes4Patch && Array.isArray(merged.modes4)) {
    merged.modes4 = patchModes4(
      merged.modes4 as Modes4Entry[],
      target.modes4Patch,
    );
  }

  // Set back into data
  setNestedValue(data, target.mergePath, merged);

  const newValue = JSON.stringify(data);

  if (row) {
    db.prepare(`UPDATE ${target.table} SET value = ? WHERE key = ?`).run(
      newValue,
      target.key,
    );
  } else {
    db.prepare(`INSERT INTO ${target.table} (key, value) VALUES (?, ?)`).run(
      target.key,
      newValue,
    );
  }
  db.close();
}

// --- Common dispatch ---

export function isAlreadyApplied(target: SettingsTarget): boolean {
  if (target.kind === "json") return isJsonAlreadyApplied(target);
  return isSqliteAlreadyApplied(target);
}

export function applySettings(target: SettingsTarget): void {
  if (target.kind === "json") {
    applyJsonSettings(target);
  } else {
    applySqliteSettings(target);
  }
}

// --- Helpers ---

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (
      typeof current[keys[i]] !== "object" ||
      current[keys[i]] === null
    ) {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}
