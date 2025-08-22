import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { withAuth } from '../../../middlewares/auth';

async function handler(req: NextRequest, user: any) {
  if (req.method !== 'PUT') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { chatId } = await req.json();
  if (!chatId) {
    return NextResponse.json({ error: 'Missing chatId' }, { status: 400 });
  }

  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  // Prevent creator from leaving
  if (user.id === chat.creatorId) {
    return NextResponse.json({ error: 'Creator cannot leave the group' }, { status: 400 });
  }

  // Remove user from group
  const updated = await prisma.chat.update({
    where: { id: chatId },
    data: { users: { disconnect: { id: user.id } } },
    include: { users: true },
  });

  return NextResponse.json(updated);
}

export const PUT = withAuth(handler);
