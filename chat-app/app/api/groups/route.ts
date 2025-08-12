import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../lib/db';
import { withAuth } from '../../middlewares/auth';

async function handler(req: NextRequest, user: any) {
  if (req.method === 'POST') {
    const { name, memberIds } = await req.json();

    if (!name || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: 'Missing group name or members' }, { status: 400 });
    }

    const group = await prisma.chat.create({
      data: {
        type: 'group',
        name,
        users: {
          connect: [...memberIds.map(id => ({ id })), { id: user.id }]
        },
      },
      include: {
        users: { select: { id: true, username: true } }
      }
    });

    return NextResponse.json(group);
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const POST = withAuth(handler);
