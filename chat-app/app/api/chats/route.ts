import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../lib/db';
import { withAuth } from '../../middlewares/auth';

async function handler(req: NextRequest, user: any) {
  if (req.method === 'GET') {
    // handle GET logic
    const chats = await prisma.chat.findMany({
      where: { users: { some: { id: user.id } } },
      include: {
        users: { select: { id: true, username: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(chats);
  }

  if (req.method === 'POST') {
    const { otherUserId } = await req.json();
    if (!otherUserId) return NextResponse.json({ error: 'Missing otherUserId' }, { status: 400 });

    // find or create chat logic
    const existing = await prisma.chat.findFirst({
      where: {
        type: 'private',
        users: { some: { id: user.id } },
        AND: { users: { some: { id: otherUserId } } },
      },
      include: { users: true, messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (existing) return NextResponse.json(existing);

    const chat = await prisma.chat.create({
      data: {
        type: 'private',
        users: { connect: [{ id: user.id }, { id: otherUserId }] },
      },
      include: { users: true, messages: true },
    });

    return NextResponse.json(chat);
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
