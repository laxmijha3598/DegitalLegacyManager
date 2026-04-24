const bcrypt = require("bcryptjs");

const { env } = require("../utils/env");
const { connectDb } = require("../utils/db");
const { User } = require("../models/User");

async function seed() {
  await connectDb(env.MONGODB_URI);

  const email = env.SEED_ADMIN_EMAIL.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
  await User.create({
    name: "Admin",
    email,
    passwordHash,
    role: "admin"
  });

  // eslint-disable-next-line no-console
  console.log("Seeded admin:", email);
  process.exit(0);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

