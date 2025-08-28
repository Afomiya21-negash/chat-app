import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '../../../middlewares/auth';
import prisma from '../../../lib/db';
async function handler(req: NextRequest, user: any) {
  if (req.method !== 'PUT') return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

  const { chatId, userId } = await req.json();
  if (!chatId || !userId) return NextResponse.json({ error: 'Missing chatId or userId' }, { status: 400 });

  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  if (userId === chat.creatorId) return NextResponse.json({ error: 'Cannot remove creator' }, { status: 400 });

  const updated = await prisma.chat.update({
    where: { id: chatId },
    data: { users: { disconnect: { id: userId } } },
    include: { users: true },
  });

  return NextResponse.json(updated);
}

export const PUT = withAuth(handler);
