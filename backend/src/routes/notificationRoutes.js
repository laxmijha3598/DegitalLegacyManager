const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { Notification } = require("../models/Notification");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ ok: true, data: { notifications } });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!n) return res.status(404).json({ ok: false, error: { message: "Not found" } });
    res.json({ ok: true, data: { notification: n } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

