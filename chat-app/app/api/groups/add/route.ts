import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { withAuth } from '../../../middlewares/auth';

async function handler(req: NextRequest, user: any) {
  if (req.method !== 'PUT') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { chatId, userId } = await req.json();
  if (!chatId || !userId) {
    return NextResponse.json({ error: 'Missing chatId or userId' }, { status: 400 });
  }

  // Check if user already exists in group
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { users: true },
  });

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  const alreadyInGroup = chat.users.some((u) => u.id === userId);

  if (alreadyInGroup) {
    return NextResponse.json({ message: 'User is already in the group' }, { status: 400 });
  }

  // Add user if not already in group
  const updatedChat = await prisma.chat.update({
    where: { id: chatId },
    data: { users: { connect: { id: userId } } },
    include: { users: true },
  });

  return NextResponse.json({ message: 'User added to group successfully', chat: updatedChat });
}

export const PUT = withAuth(handler);
