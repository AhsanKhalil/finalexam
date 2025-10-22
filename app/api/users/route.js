import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const sampleUsers = [
      { name: "Ali Khan", email: "ali@example.com", role: "admin" },
      { name: "Sara Ahmed", email: "sara@example.com", role: "user" },
      { name: "Bilal Sheikh", email: "bilal@example.com", role: "user" },
    ];

    const result = await User.insertMany(sampleUsers, { ordered: false });
    return NextResponse.json({ success: true, inserted: result.length });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const users = await User.find();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}