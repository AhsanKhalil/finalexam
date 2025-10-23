// app/api/items/route.js
import connectToDatabase from "@/lib/mongodb";
import Item from "@/models/Item";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { NextResponse } from "next/server";

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
  } catch (err) {
    return null;
  }
}

export async function GET(req) {
  // Returns items for the authenticated user
  const user = await verifyTokenFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const items = await Item.find({ userId: user.sub }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items }, { status: 200 });
}

export async function POST(req) {
  // Create a new item for the authenticated user
  const user = await verifyTokenFromRequest(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description } = body;
  if (!title || !description) return NextResponse.json({ message: "Missing fields" }, { status: 400 });

  await connectToDatabase();
  const item = new Item({
    userId: user.sub,
    title: title.trim(),
    description: description.trim(),
  });

  await item.save();
  return NextResponse.json({ message: "Item created", item }, { status: 201 });
}
