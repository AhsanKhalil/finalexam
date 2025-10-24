import connectToDatabase from "@/lib/mongodb";
import UserInformation from "@/models/UserInformation";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { NextResponse } from "next/server";

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

// GET: Fetch user's additional info
export async function GET(req) {
  const userPayload = await verifyTokenFromRequest(req);
  if (!userPayload) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectToDatabase();

  try {
    const userInfo = await UserInformation.findOne({ userId: userPayload.sub });
    return NextResponse.json({ userInfo });
  } catch (err) {
    return NextResponse.json({ message: "Failed to fetch user info" }, { status: 500 });
  }
}

// PATCH: Update user's additional info
export async function PATCH(req) {
  const userPayload = await verifyTokenFromRequest(req);
  if (!userPayload) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const body = await req.json();
  const { cnic, mobileNumber, whatsapp, facebookUrl, instagramUrl, about } = body;

  try {
    let userInfo = await UserInformation.findOne({ userId: userPayload.sub });
    if (!userInfo) {
      // Create new if not exists
      userInfo = new UserInformation({ userId: userPayload.sub });
    }

    userInfo.cnic = cnic;
    userInfo.mobileNumber = mobileNumber;
    userInfo.whatsapp = whatsapp;
    userInfo.facebookUrl = facebookUrl;
    userInfo.instagramUrl = instagramUrl;
    userInfo.about = about;

    await userInfo.save();

    return NextResponse.json({ message: "User information updated", userInfo });
  } catch (err) {
    return NextResponse.json({ message: "Failed to update user info" }, { status: 500 });
  }
}
