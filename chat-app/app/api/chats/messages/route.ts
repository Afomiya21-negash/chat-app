import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { withAuth } from '../../../middlewares/auth';

async function handler(req: NextRequest, user: any) {
  if (req.method === 'GET') {
    const chatId = Number(req.nextUrl.searchParams.get('chatId'));
    if (!chatId) {
      return NextResponse.json({ error: 'Missing chatId' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: { sender: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  }

  if (req.method === 'POST') {
    const { chatId, content } = await req.json();
    if (!chatId || !content) {
      return NextResponse.json({ error: 'Missing chatId or content' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: user.id,
        content,
      },
      include: { sender: { select: { id: true, username: true } } },
    });

    // optionally update chat timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
