const jwt = require("jsonwebtoken");
const { env } = require("../utils/env");
const { User } = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
      return res.status(401).json({ ok: false, error: { message: "Unauthorized" } });
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) return res.status(401).json({ ok: false, error: { message: "Unauthorized" } });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: { message: "Unauthorized" } });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, error: { message: "Unauthorized" } });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: { message: "Forbidden" } });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };

