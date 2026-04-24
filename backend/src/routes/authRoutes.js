const express = require("express");
const bcrypt = require("bcryptjs");

const { User } = require("../models/User");
const { registerSchema, loginSchema } = require("../utils/validators");
const { signAccessToken } = require("../utils/tokens");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: { message: "Invalid input", details: parsed.error.flatten() } });
    }

    const { name, email, password } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ ok: false, error: { message: "Email already registered" } });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: "user" });

    const token = signAccessToken(user);
    res.json({ ok: true, data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, deathStatus: user.deathStatus } } });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: { message: "Invalid input", details: parsed.error.flatten() } });
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok: false, error: { message: "Invalid credentials" } });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ ok: false, error: { message: "Invalid credentials" } });

    const token = signAccessToken(user);
    res.json({ ok: true, data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, deathStatus: user.deathStatus } } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ ok: true, data: { user: req.user } });
});

module.exports = router;

