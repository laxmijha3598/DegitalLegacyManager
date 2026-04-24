const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // death verification simulation state
    deathStatus: {
      type: String,
      enum: ["alive", "pending_verification", "verified_deceased"],
      default: "alive"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };

