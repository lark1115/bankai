import { z } from "zod";

// --- CLI flag type (existing, backward-compatible) ---

export const CliAgentDefSchema = z.object({
  type: z.literal("cli").default("cli"),
  cmd: z.string().min(1),
  displayName: z.string().optional(),
  lines: z.array(z.string().min(1)).min(1),
  cmdAliases: z.array(z.string().min(1)).optional(),
});

export type CliAgentDef = z.infer<typeof CliAgentDefSchema>;

// --- Settings targets ---

export const JsonTargetSchema = z.object({
  kind: z.literal("json"),
  scope: z.enum(["project", "global"]),
  filePath: z.string(),
  merge: z.record(z.unknown()),
  description: z.string().optional(),
});

export type JsonTarget = z.infer<typeof JsonTargetSchema>;

export const SqliteTargetSchema = z.object({
  kind: z.literal("sqlite"),
  scope: z.literal("global"),
  dbPath: z.string(),
  table: z.string(),
  key: z.string(),
  mergePath: z.string(),
  merge: z.record(z.unknown()),
  modes4Patch: z
    .object({
      id: z.string(),
      set: z.record(z.unknown()),
    })
    .optional(),
  description: z.string().optional(),
});

export type SqliteTarget = z.infer<typeof SqliteTargetSchema>;

export const SettingsTargetSchema = z.union([
  JsonTargetSchema,
  SqliteTargetSchema,
]);

export type SettingsTarget = z.infer<typeof SettingsTargetSchema>;

// --- Settings agent type ---

export const SettingsAgentDefSchema = z.object({
  type: z.literal("settings"),
  cmd: z.string().min(1),
  displayName: z.string().optional(),
  cmdAliases: z.array(z.string().min(1)).optional(),
  targets: z.array(SettingsTargetSchema).min(1),
});

export type SettingsAgentDef = z.infer<typeof SettingsAgentDefSchema>;

// --- Discriminated union with backward compatibility ---

export const AgentDefSchema = z.preprocess(
  (val) =>
    typeof val === "object" && val !== null && !("type" in val)
      ? { ...val, type: "cli" }
      : val,
  z.discriminatedUnion("type", [CliAgentDefSchema, SettingsAgentDefSchema]),
);

export type AgentDef = z.infer<typeof AgentDefSchema>;

// --- Custom agents (CLI only, for backward compatibility) ---

export const CustomAgentDefSchema = CliAgentDefSchema;

export type CustomAgentDef = z.infer<typeof CustomAgentDefSchema>;

export const CustomAgentsFileSchema = z.array(CustomAgentDefSchema);
