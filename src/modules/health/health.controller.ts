import { RequestHandler } from "express";
import { prisma } from "../../lib/prisma.js";

const checkDatabase = async (): Promise<{
  status: "OK" | "FAIL";
  responseTime?: number;
  error?: string;
}> => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "OK",
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "FAIL",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const formatBytes = (bytes: number): string => {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
};

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

export const healthCheckController: RequestHandler = async (req, res) => {
  const dbCheck = await checkDatabase();
  const memory = process.memoryUsage();

  const isHealthy = dbCheck.status === "OK";

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "OK" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(process.uptime()),
      formatted: formatUptime(process.uptime()),
    },
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    checks: {
      database: dbCheck,
      memory: {
        status: memory.heapUsed < 500 * 1024 * 1024 ? "OK" : "WARNING",
        heapUsed: formatBytes(memory.heapUsed),
        heapTotal: formatBytes(memory.heapTotal),
        rss: formatBytes(memory.rss),
      },
      nodeVersion: process.version,
      platform: process.platform,
    },
  });
};

export const pingController: RequestHandler = (req, res) => {
  return res.status(200).send("OK");
};
