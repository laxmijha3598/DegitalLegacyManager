const dotenv = require("dotenv");

dotenv.config();

function required(name, value) {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const env = {
  PORT: Number(process.env.PORT || 4000),
  MONGODB_URI: required("MONGODB_URI", process.env.MONGODB_URI),
  JWT_SECRET: required("JWT_SECRET", process.env.JWT_SECRET),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || "admin@dlm.local",
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || "Admin@12345"
};

module.exports = { env };

