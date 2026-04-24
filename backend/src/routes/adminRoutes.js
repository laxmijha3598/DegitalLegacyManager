const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { User } = require("../models/User");
const { Asset } = require("../models/Asset");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));

router.get("/dashboard", async (_req, res, next) => {
  try {
    const [users, assets, pending, verified] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Asset.countDocuments({}),
      User.countDocuments({ deathStatus: "pending_verification" }),
      User.countDocuments({ deathStatus: "verified_deceased" })
    ]);
    res.json({ ok: true, data: { counts: { users, assets, pendingVerifications: pending, verifiedDeceased: verified } } });
  } catch (err) {
    next(err);
  }
});

router.get("/death-requests", async (_req, res, next) => {
  try {
    const requests = await User.find({ deathStatus: { $in: ["pending_verification", "verified_deceased"] }, role: "user" })
      .select("name email deathStatus createdAt updatedAt")
      .sort({ updatedAt: -1 });
    res.json({ ok: true, data: { requests } });
  } catch (err) {
    next(err);
  }
});

router.post("/verify-death/:userId", async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, role: "user" });
    if (!user) return res.status(404).json({ ok: false, error: { message: "User not found" } });
    user.deathStatus = "verified_deceased";
    await user.save();
    res.json({ ok: true, data: { user: { id: user._id, email: user.email, deathStatus: user.deathStatus } } });
  } catch (err) {
    next(err);
  }
});

router.post("/reject-death/:userId", async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, role: "user" });
    if (!user) return res.status(404).json({ ok: false, error: { message: "User not found" } });
    user.deathStatus = "alive";
    await user.save();
    res.json({ ok: true, data: { user: { id: user._id, email: user.email, deathStatus: user.deathStatus } } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

