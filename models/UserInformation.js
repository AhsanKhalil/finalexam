// models/UserInformation.js
import mongoose from "mongoose";

const UserInformationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cnic: { type: Number },
  mobileNumber: { type: Number },
  whatsapp: { type: Number },
  facebookUrl: { type: String },
  instagramUrl: { type: String },
  about: { type: String },
}, { timestamps: true });

export default mongoose.models.UserInformation || mongoose.model("UserInformation", UserInformationSchema);
