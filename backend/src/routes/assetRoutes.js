const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { Asset } = require("../models/Asset");
const { createAssetSchema } = require("../utils/validators");
const { upload } = require("../utils/upload");

const router = express.Router();

// List my assets
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const assets = await Asset.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ ok: true, data: { assets } });
  } catch (err) {
    next(err);
  }
});

// Create asset (optional file upload)
router.post("/", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    const body = req.body.asset ? JSON.parse(req.body.asset) : req.body;
    const parsed = createAssetSchema.safeParse(body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: { message: "Invalid input", details: parsed.error.flatten() } });
    }

    const file = req.file
      ? {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: `/uploads/${req.file.filename}`,
          uploadedAt: new Date()
        }
      : undefined;

    const asset = await Asset.create({
      ownerId: req.user._id,
      ...parsed.data,
      file
    });

    res.status(201).json({ ok: true, data: { asset } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const asset = await Asset.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!asset) return res.status(404).json({ ok: false, error: { message: "Not found" } });
    res.json({ ok: true, data: { asset } });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!asset) return res.status(404).json({ ok: false, error: { message: "Not found" } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

