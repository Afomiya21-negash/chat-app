import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../utils/jwt';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.password) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = signToken({ id: user.id, email: user.email });

  return NextResponse.json({ token,user: {
    id: user.id,
    username: user.username,
    email: user.email,
  }, });
}