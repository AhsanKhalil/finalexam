// app/api/items/[id]/route.js
import connectToDatabase from "@/lib/mongodb";
import Item from "@/models/Item";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

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

export async function GET(req) {
  const user = await verifyTokenFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // Extract id from URL
  const url = new URL(req.url);
  const paths = url.pathname.split("/");
  const id = paths[paths.length - 1]; // last segment is the id

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

  await connectToDatabase();
  const item = await Item.findById(id).lean();
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (item.userId.toString() !== user.sub.toString())
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  return NextResponse.json({ item }, { status: 200 });
}
