import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});

// ─── Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log("HTTP server closed.");
  });

  await prisma.$disconnect();
  console.log("Database disconnected.");

  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
