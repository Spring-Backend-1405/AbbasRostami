import "dotenv/config";

import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(
    `📚 API Docs: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}/api-docs`,
  );
});

// ─── Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      console.log("HTTP server closed.");
      resolve();
    });
  });

  await prisma.$disconnect();
  console.log("Database disconnected.");

  process.exit(0);
};

process.on("SIGTERM", () => {
  shutdown("SIGTERM").catch((err) => {
    console.error("Shutdown error:", err);
    process.exit(1);
  });
});

process.on("SIGINT", () => {
  shutdown("SIGINT").catch((err) => {
    console.error("Shutdown error:", err);
    process.exit(1);
  });
});
