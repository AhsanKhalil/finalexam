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

// ✅ GET single item
export async function GET(req) {
  const user = await verifyTokenFromRequest(req);
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

  await connectToDatabase();
  const item = await Item.findById(id).lean();

  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (item.userId.toString() !== user.sub.toString())
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  return NextResponse.json({ item }, { status: 200 });
}

// ✅ PATCH - update item
export async function PATCH(req) {
  const user = await verifyTokenFromRequest(req);
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

  const { title, description } = await req.json();

  await connectToDatabase();
  const item = await Item.findById(id);
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (item.userId.toString() !== user.sub.toString())
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  item.title = title ?? item.title;
  item.description = description ?? item.description;
  await item.save();

  return NextResponse.json({ message: "Updated successfully", item }, { status: 200 });
}

// ✅ DELETE - remove item
export async function DELETE(req) {
  const user = await verifyTokenFromRequest(req);
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

  await connectToDatabase();
  const item = await Item.findById(id);
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (item.userId.toString() !== user.sub.toString())
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  await item.deleteOne();

  return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
}
