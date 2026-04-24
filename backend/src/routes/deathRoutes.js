const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { User } = require("../models/User");

const router = express.Router();

// User triggers a "death verification request" (simulation)
router.post("/request", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ ok: false, error: { message: "User not found" } });

    if (user.deathStatus === "verified_deceased") {
      return res.status(400).json({ ok: false, error: { message: "Already verified deceased" } });
    }

    user.deathStatus = "pending_verification";
    await user.save();
    res.json({ ok: true, data: { deathStatus: user.deathStatus } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

