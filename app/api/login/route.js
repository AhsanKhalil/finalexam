// app/api/login/route.js
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    if (passwordHash !== user.passwordHash) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRE_SECONDS }
    );

    // Set cookie header
    const res = NextResponse.json({ message: "Login successful" }, { status: 200 });
    const secure = process.env.NODE_ENV === "production";
    res.headers.set(
      "Set-Cookie",
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=${TOKEN_EXPIRE_SECONDS}; SameSite=Lax${secure ? "; Secure" : ""}`
    );

    return res;
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
