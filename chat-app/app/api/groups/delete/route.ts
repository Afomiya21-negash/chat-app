import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { withAuth } from '../../../middlewares/auth';

async function handler(req: NextRequest, user: any) {
  if (req.method !== 'PUT') return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

  const { chatId } = await req.json();
  if (!chatId) return NextResponse.json({ error: 'Missing chatId' }, { status: 400 });

  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  if (Number(chat.creatorId) !== Number(user.id)) return NextResponse.json({ error: 'Only creator can delete this group' }, { status: 403 });

  // Delete messages first
  await prisma.message.deleteMany({ where: { chatId } });

  // Delete chat
  await prisma.chat.delete({ where: { id: chatId } });

  return NextResponse.json({ success: true, message: 'Group deleted successfully' });
}


export const PUT = withAuth(handler);
