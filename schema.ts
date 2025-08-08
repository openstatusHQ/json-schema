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
  version: "1.0.2",
});

const httpRequestSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]),
  url: z.url().meta({
    description: "URL to request",
    examples: ["https://openstat.us", "https://www.openstatus.dev"],
  }),
  headers: z.record(z.string(), z.string()).optional().meta({
    description: "Headers to send with the request",
    examples: [{ "Content-Type": "application/json" }, { "Authorization": "Bearer token" }],
  }),
  body: z.string().optional().meta({
    description: "Body to send with the request",
    examples: ['{ "key": "value" }', "Hello World"],
  }),
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
    compare: numberCompare.meta({
      description: "Comparison operator",
      examples: ["eq", "not_eq", "gt", "gte", "lt", "lte"],
    }),
    target: z.number().meta({
      description: "Status code to assert",
      examples: [200, 404, 418, 500],
    }),
  }).meta({
    examples: [
      {
        kind: "statusCode",
        compare: "eq",
        target: 200,
      },
      {
        kind: "statusCode",
        compare: "not_eq",
        target: 404,
      },
      {
        kind: "statusCode",
        compare: "gt",
        target: 300,
      },
    ],
  });

const headerAssertion = z
  .object({
    kind: z.literal("header"),
    compare: stringCompare.meta({
      description: "Comparison operator",
      examples: ["eq", "not_eq", "contains", "not_contains"],
    }),
    key: z.string().meta({
      description: "Header key to assert",
      examples: ["Content-Type", "X-Request-ID"],
    }),
    target: z.string().meta({
      description: "Header value to assert",
      examples: ["application/json", "text/html"],
    }),
  });

const textBodyAssertion = z
  .object({
    kind: z.literal("textBody"),
    compare: stringCompare.meta({
      description: "Comparison operator",
      examples: ["eq", "not_eq", "contains", "not_contains"],
    }),
    target: z.string().meta({
      description: "Text body to assert",
      examples: ["Hello, world!", "404 Not Found"],
    }),
  });

const assertionsSchema = z.discriminatedUnion("kind", [
  statusCodeAssertion,
  headerAssertion,
  textBodyAssertion,
]);

const baseRequest = z.object({
  name: z.string().meta({
    description: "Name of the monitor",
  }),
  description: z.string().optional().meta({
    description: "Description of the monitor",
    examples: ["Monitor for homepage", "Monitor for API endpoint"],
  }),
  retry: z.number().max(10).min(1).optional().meta({
    description: "Number of retries to attempt",
    examples: [1, 3, 5],
    default: 3,
  }),
  degradedAfter: z.number().min(0).optional().meta({
    description:
      "Time in milliseconds to wait before marking the request as degraded",
    examples: [30000],
    default: 30000,
  }),
  timeout: z.number().min(0).optional().meta({
    description:
      "Time in milliseconds to wait before marking the request as timed out",
    examples: [45000],
    default: 45000,
  }),
  frequency: z.enum(["30s", "1m", "5m", "10m", "30m", "1h"]),
  active: z.boolean().optional().meta({
    description: "Whether the monitor is active",
    default: false,
  }),
  public: z.boolean().optional().meta({
    description: "Whether the monitor is public",
    default: false,
  }),
  regions: z.array(z.enum(regions).or(z.literal("private"))).meta({
    description: "Regions to run the request in",
  }),
  openTelemetry: z.object({
    endpoint: z.url().optional().meta({
      description: "Endpoint to send telemetry data to",
    }),
    headers: z.record(z.string(), z.string()).optional().meta({
      description: "Headers to send with telemetry data",
    }),
  }).optional().meta({
    description: "The OpenTelemetry Configuration",
  }),
});

const itemSchema = z.discriminatedUnion("kind", [
  baseRequest.extend({
    kind: z.literal("http"),
    assertions: z.array(assertionsSchema).optional().meta({
      description: "Assertions to run on the response",
    }),
    request: httpRequestSchema.meta({
      description: "The HTTP Request we are sending",
    }),
  }).meta({
    description: "HTTP Request Schema",
  }),
  baseRequest.extend({
    kind: z.literal("tcp"),
    request: tcpRequestSchema,
  }).meta({
    description: "TCP Request Schema",
  }),
]);

export const fullSchema = z.record(z.string(), itemSchema);
