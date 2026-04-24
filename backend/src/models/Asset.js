const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["document", "credential", "media", "note"], required: true },
    description: { type: String, default: "" },
    // For "credential" type, store encrypted in real life; for college demo we store plaintext with a warning flag.
    credential: {
      username: { type: String },
      password: { type: String },
      url: { type: String }
    },
    file: {
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      path: { type: String }, // relative path under /uploads
      uploadedAt: { type: Date }
    },
    visibility: {
      type: String,
      enum: ["private", "nominee_on_verified_death"],
      default: "nominee_on_verified_death"
    }
  },
  { timestamps: true }
);

const Asset = mongoose.model("Asset", assetSchema);

module.exports = { Asset };

