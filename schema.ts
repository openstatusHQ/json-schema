import { z } from "zod/v4";

export const schema = z.object({
  name: z.string(),
}).meta({
  description: "OpenStatus Synthetic Monitoring Schema",
  version: "1.0.0",
});

const httpRequestSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]),
  url: z.url().meta({
    description: "URL to request",
    examples: ["https://openstat.us", "https://www.openstatus.dev"],
  }),
  headers: z.record(z.string(), z.string()),
  body: z.string().optional(),
});

const tcpRequestSchema = z.object({
  host: z.string().meta({
    examples: ["example.com", "localhost"],
    description: "Host to connect to",
  }),
  port: z.number().meta({
    description: "Port to connect to",
    examples: [80, 443, 1337],
  }),
});

const baseRequest = z.object({
  name: z.string(),
  retry: z.number().max(10),
  kind: z.literal("tcp"),
  frequency: z.enum(["30s", "1m", "5m", "10m", "30m", "1h"]),
});

const itemSchema = z.discriminatedUnion("kind", [
baseRequest.extend({
    kind: z.literal("http"),
    request: httpRequestSchema,
  }),
baseRequest.extend({
    kind: z.literal("tcp"),
    request: tcpRequestSchema,
  }).meta({
    description: "TCP Request Schema",
  }),
]);

export const fullSchema = z.record(z.string(), itemSchema);
