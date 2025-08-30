import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/db';
import { withAuth } from '../../../../middlewares/auth';

async function handler(req: NextRequest, user: any) {
    const messageId = Number(req.nextUrl.searchParams.get('messageId'));
    if (!messageId) {
        return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
    }

    // Find the message and its associated chat
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
            chat: {
                select: {
                    users: {
                        select: { id: true }
                    }
                }
            }
        }
    });

    if (!message || !message.fileData) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Security: Check if the current user is a member of the chat
    const isMember = message.chat.users.some(u => u.id === user.id);
    if (!isMember) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const headers = new Headers();
    headers.set('Content-Type', message.type === 'image' ? `image/${message.fileName?.split('.').pop()}` : 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${message.fileName}"`);

    return new NextResponse(Buffer.from(message.fileData), { status: 200, headers });
}

export const GET = withAuth(handler);