const mongoose = require("mongoose");

const nomineeSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    relationship: { type: String, default: "" },
    // optional access code (demo) - in real life use email verification
    accessCode: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

nomineeSchema.index({ ownerId: 1, email: 1 }, { unique: true });

const Nominee = mongoose.model("Nominee", nomineeSchema);

module.exports = { Nominee };

