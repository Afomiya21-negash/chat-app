import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { withAuth } from '../../../middlewares/auth';

async function handler(req: NextRequest, user: any) {
  if (req.method !== 'PUT') return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

  const { chatId, userId } = await req.json();
  if (!chatId || !userId) return NextResponse.json({ error: 'Missing chatId or userId' }, { status: 400 });

  const chat = await prisma.chat.update({
    where: { id: chatId },
    data: { users: { connect: { id: userId } } },
    include: { users: true },
  });

  return NextResponse.json(chat);
}

export const PUT = withAuth(handler);
