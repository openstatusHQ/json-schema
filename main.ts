import { z } from "zod/v4";

import { fullSchema } from "./schema.ts";

const jsonSchema = z.toJSONSchema(fullSchema, {
  target: "draft-7",
});

await Deno.writeTextFile("schema.json", JSON.stringify(jsonSchema, null, 2));
