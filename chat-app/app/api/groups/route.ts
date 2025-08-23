import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../lib/db';
import { withAuth } from '../../middlewares/auth';

async function handler(req: NextRequest, user: any) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { name, memberIds } = await req.json();

    if (!name || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: 'Missing group name or members' }, { status: 400 });
    }

    // ensure creator is included in members
    const uniqueMemberIds = Array.from(new Set([...memberIds, user.id]));

    const group = await prisma.chat.create({
      data: {
        type: 'group',
        name,
        users: {
          connect: uniqueMemberIds.map((id) => ({ id })),
        },
        creator: {
          connect: { id: user.id },
        },
      },
      include: {
        users: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json(group);
  } catch (err: any) {
    console.error('Failed to create group:', err);
    return NextResponse.json({ error: 'Failed to create group', details: err.message }, { status: 500 });
  }
}

export const POST = withAuth(handler);

