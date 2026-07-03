import "dotenv/config";
import { defineConfig, env } from "prisma/config"; // Import env here

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"), // Replaces process.env.DATABASE_URL
  },
});
