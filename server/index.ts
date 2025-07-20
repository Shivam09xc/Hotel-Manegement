import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Healthcheck route (required by Railway)

app.get("/", (_req, res) => {
  res.status(200).send("✅ Server is running!");
});

let setupVite, serveStatic, log;

if (process.env.NODE_ENV === "development") {
  const vite = await import("./vite");
  setupVite = vite.setupVite;
  log = vite.log;
} else {
  const vite = await import("./vite");
  serveStatic = vite.serveStatic;
  log = vite.log;
}

app.get("/", (_req, res) => {
  res.status(200).send("✅ Server is running!");
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // ✅ Database seed
    await seedDatabase();

    // ✅ Register routes
    const server = await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // ✅ Serve Vite in dev, static in prod
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ✅ Start server — required for Railway: host must be 0.0.0.0
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(
      {
        port,
        host: "0.0.0.0",
      },
      () => {
        log(`🚀 Server running on port ${port}`);
      }
    );
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1); // important for Railway to detect failure
  }
})();
