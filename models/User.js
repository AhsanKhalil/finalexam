import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "user" },
}, { timestamps: true });

// Prevent model overwrite on hot reload
export default mongoose.models.User || mongoose.model("User", userSchema);
