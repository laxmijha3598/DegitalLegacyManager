const express = require("express");
const crypto = require("crypto");

const { requireAuth } = require("../middleware/auth");
const { Nominee } = require("../models/Nominee");
const { User } = require("../models/User");
const { Asset } = require("../models/Asset");
const { createNomineeSchema } = require("../utils/validators");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const nominees = await Nominee.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ ok: true, data: { nominees } });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const parsed = createNomineeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: { message: "Invalid input", details: parsed.error.flatten() } });
    }

    const accessCode = crypto.randomBytes(3).toString("hex").toUpperCase(); // demo code like "A1B2C3"
    const nominee = await Nominee.create({
      ownerId: req.user._id,
      ...parsed.data,
      accessCode
    });

    res.status(201).json({ ok: true, data: { nominee } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ ok: false, error: { message: "Nominee email already exists" } });
    }
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const nominee = await Nominee.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!nominee) return res.status(404).json({ ok: false, error: { message: "Not found" } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Nominee access: nominee provides owner email + their accessCode.
// Access granted ONLY when owner's deathStatus is verified_deceased.
router.post("/access", async (req, res, next) => {
  try {
    const { ownerEmail, nomineeEmail, accessCode } = req.body || {};
    if (!ownerEmail || !nomineeEmail || !accessCode) {
      return res.status(400).json({ ok: false, error: { message: "ownerEmail, nomineeEmail, accessCode required" } });
    }

    const owner = await User.findOne({ email: String(ownerEmail).toLowerCase().trim() });
    if (!owner) return res.status(404).json({ ok: false, error: { message: "Owner not found" } });

    if (owner.deathStatus !== "verified_deceased") {
      return res.status(403).json({ ok: false, error: { message: "Access not allowed until death is verified (simulation)" } });
    }

    const nominee = await Nominee.findOne({
      ownerId: owner._id,
      email: String(nomineeEmail).toLowerCase().trim(),
      accessCode: String(accessCode).trim().toUpperCase(),
      isActive: true
    });
    if (!nominee) return res.status(401).json({ ok: false, error: { message: "Invalid nominee credentials" } });

    const assets = await Asset.find({
      ownerId: owner._id,
      visibility: "nominee_on_verified_death"
    }).sort({ createdAt: -1 });

    res.json({
      ok: true,
      data: {
        owner: { name: owner.name, email: owner.email },
        nominee: { name: nominee.name, email: nominee.email, relationship: nominee.relationship },
        assets
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

