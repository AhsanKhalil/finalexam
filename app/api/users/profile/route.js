// app/api/users/profile/route.js
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

// Extract token from cookies
function getTokenFromReq(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const parsed = cookie.parse(cookieHeader || "");
  return parsed.auth_token || null;
}

// Verify JWT token
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

  await connectToDatabase();
  const body = await req.json();
  const { fullName, email } = body;

  if (!fullName || !email) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  try {
    const user = await User.findById(userPayload.sub);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    user.fullName = fullName;
    user.email = email.toLowerCase();
    await user.save();

    return NextResponse.json({ message: "Profile updated", user: { fullName: user.fullName, email: user.email } });
  } catch (err) {
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
