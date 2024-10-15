import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const proccessEnv = EnvSchema.parse(process.env);

const queryClient = postgres(proccessEnv.DATABASE_URL);
const db = drizzle(queryClient);

export default db;
