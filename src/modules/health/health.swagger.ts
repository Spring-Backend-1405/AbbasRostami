export const healthSwagger = {
  paths: {
    "/health": {
      get: {
        tags: ["Health Check"],
        summary: "Full health check (Detailed)",
        description: `Performs a comprehensive health check including:
- Database connectivity
- Memory usage
- Uptime
- Environment info

This endpoint is used by monitoring services to verify the API server is running and all critical services are reachable.

**Status codes:**
- \`200\` → All systems operational
- \`503\` → Service degraded (e.g., database down)`,
        responses: {
          200: {
            description: "All systems operational.",
            content: {
              "application/json": {
                example: {
                  status: "OK",
                  timestamp: "2026-01-15T14:30:00.000Z",
                  uptime: {
                    seconds: 7234,
                    formatted: "2h 0m 34s",
                  },
                  environment: "production",
                  version: "1.0.0",
                  checks: {
                    database: {
                      status: "OK",
                      responseTime: 12,
                    },
                    memory: {
                      status: "OK",
                      heapUsed: "45.23 MB",
                      heapTotal: "78.50 MB",
                      rss: "120.45 MB",
                    },
                    nodeVersion: "v20.10.0",
                    platform: "linux",
                  },
                },
              },
            },
          },
          503: {
            description:
              "Service degraded — one or more critical services are down.",
            content: {
              "application/json": {
                example: {
                  status: "DEGRADED",
                  timestamp: "2026-01-15T14:30:00.000Z",
                  uptime: {
                    seconds: 7234,
                    formatted: "2h 0m 34s",
                  },
                  environment: "production",
                  version: "1.0.0",
                  checks: {
                    database: {
                      status: "FAIL",
                      error: "Connection refused",
                    },
                    memory: {
                      status: "OK",
                      heapUsed: "45.23 MB",
                      heapTotal: "78.50 MB",
                      rss: "120.45 MB",
                    },
                    nodeVersion: "v20.10.0",
                    platform: "linux",
                  },
                },
              },
            },
          },
        },
      },
      head: {
        tags: ["Health Check"],
        summary: "Lightweight health check (HEAD)",
        description:
          "Same as GET /health but returns only status code without body. Ideal for monitoring services (UptimeRobot, Pingdom, etc.) that only need to know if the server is alive.",
        responses: {
          200: { description: "Server is healthy." },
          503: { description: "Server is degraded." },
        },
      },
    },

    "/health/ping": {
      get: {
        tags: ["Health Check"],
        summary: "Simple ping (Plain text)",
        description:
          "Returns just 'OK' as plain text. The simplest and fastest health check. Use this for high-frequency monitoring.",
        responses: {
          200: {
            description: "Server is alive.",
            content: {
              "text/plain": {
                example: "OK",
              },
            },
          },
        },
      },
    },
  },
};
