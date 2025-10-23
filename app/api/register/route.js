// app/api/register/route.js
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullName, email, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    // SHA-256 hash (hex)
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    const user = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    await user.save();

    return NextResponse.json({ message: "User registered" }, { status: 201 });
  } catch (err) {
    console.error("register error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
