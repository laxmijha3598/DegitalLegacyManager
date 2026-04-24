const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const { env } = require("./utils/env");
const { connectDb } = require("./utils/db");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const assetRoutes = require("./routes/assetRoutes");
const nomineeRoutes = require("./routes/nomineeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const deathRoutes = require("./routes/deathRoutes");

const { startReminderJobs } = require("./jobs/reminderJobs");

async function main() {
  await connectDb(env.MONGODB_URI);

  const app = express();
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  // Serve uploaded files (demo)
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "digital-legacy-manager-api" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/assets", assetRoutes);
  app.use("/api/nominees", nomineeRoutes);
  app.use("/api/death", deathRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use(errorHandler);

  startReminderJobs();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

