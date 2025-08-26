
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../lib/db";
import { withAuth } from "../../middlewares/auth";


export async function POST(req: NextRequest) {
  const { username } = await req.json()

  if (typeof username !== 'string' || !username.trim()) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { username: username.trim() },
    select: { id: true, username: true, email: true }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

async function handler(req: NextRequest, user: any) {
  // `user` comes from your withAuth middleware (decoded from token)

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }, // use id from token payload
    select: { id: true, username: true, email: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(dbUser);
}

// Protect GET with auth
export const GET = withAuth(handler);
