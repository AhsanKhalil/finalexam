// models/User.js (Mongoose model)
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }, // SHA-256 hex
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
