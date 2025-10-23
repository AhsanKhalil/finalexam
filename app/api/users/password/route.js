// app/api/users/password/route.js
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { NextResponse } from "next/server";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;

function getTokenFromReq(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const parsed = cookie.parse(cookieHeader || "");
  return parsed.auth_token || null;
}

async function verifyTokenFromRequest(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function PATCH(req) {
  const userPayload = await verifyTokenFromRequest(req);
  if (!userPayload) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { current, newPass } = await req.json();
  if (!current || !newPass) return NextResponse.json({ message: "All fields are required" }, { status: 400 });

  await connectToDatabase();
  try {
    const user = await User.findById(userPayload.sub);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Compare SHA-256 hash
    const currentHash = crypto.createHash("sha256").update(current).digest("hex");
    if (currentHash !== user.passwordHash) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    // Update password
    const newHash = crypto.createHash("sha256").update(newPass).digest("hex");
    user.passwordHash = newHash;
    await user.save();

    return NextResponse.json({ message: "Password changed successfully" });
  } catch {
    return NextResponse.json({ message: "Failed to change password" }, { status: 500 });
  }
}
