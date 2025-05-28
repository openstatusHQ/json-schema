import { z } from "zod/v4";

 const regions = [
  "ams",
  "arn",
  "atl",
  "bog",
  "bom",
  "bos",
  "cdg",
  "den",
  "dfw",
  "ewr",
  "eze",
  "fra",
  "gdl",
  "gig",
  "gru",
  "hkg",
  "iad",
  "jnb",
  "lax",
  "lhr",
  "mad",
  "mia",
  "nrt",
  "ord",
  "otp",
  "phx",
  "qro",
  "scl",
  "sjc",
  "sea",
  "sin",
  "syd",
  "waw",
  "yul",
  "yyz",
] as const;

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


 const numberCompare = z.enum(["eq", "not_eq", "gt", "gte", "lt", "lte"]);

 const stringCompare = z.enum([
   "contains",
   "not_contains",
   "eq",
   "not_eq",
   "empty",
   "not_empty",
   "gt",
   "gte",
   "lt",
   "lte",
 ]);


const statusCodeAssertion = z
  .object({
    kind: z.literal("statusCode"),
    compare: numberCompare,
    target: z.number(),
  })

const headerAssertion = z
  .object({
    kind: z.literal("header"),
    compare: stringCompare,
    key: z.string(),
    target: z.string(),
  })

const textBodyAssertion = z
  .object({
    kind: z.literal("textBody"),
    compare: stringCompare,
    target: z.string(),
  })

const assertionsSchema = z.discriminatedUnion("kind", [
  statusCodeAssertion,
  headerAssertion,
  textBodyAssertion,
]);

const baseRequest = z.object({
  name: z.string(),
  description: z.string().optional(),
  retry: z.number().max(10).min(1).optional(),
  degradedAfter: z.number().min(0).optional(),
  timeout: z.number().min(0).optional(),
  frequency: z.enum(["30s", "1m", "5m", "10m", "30m", "1h"]),
  active: z.boolean().optional(),
  regions: z.array(z.enum(regions).or(z.literal("private"))).meta({
    description: "Regions to run the request in",
  }),
});

const itemSchema = z.discriminatedUnion("kind", [
baseRequest.extend({
    kind: z.literal("http"),
    assertions: z.array(assertionsSchema).optional(),
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
