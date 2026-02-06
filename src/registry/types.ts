import { z } from "zod";

export const AgentDefSchema = z.object({
  cmd: z.string().min(1),
  displayName: z.string().optional(),
  lines: z.array(z.string().min(1)).min(1),
  cmdAliases: z.array(z.string().min(1)).optional(),
});

export type AgentDef = z.infer<typeof AgentDefSchema>;

export const CustomAgentDefSchema = AgentDefSchema;

export type CustomAgentDef = z.infer<typeof CustomAgentDefSchema>;

export const CustomAgentsFileSchema = z.array(CustomAgentDefSchema);
