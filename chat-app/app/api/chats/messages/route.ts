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

        // The GET request should not return fileData to the client to avoid bloat.
        // The frontend will use the new download endpoint for files.
        const messagesWithoutFileData = messages.map(m => {
            const { fileData, ...rest } = m;
            return rest;
        });

        return NextResponse.json(messagesWithoutFileData);
    }

    if (req.method === 'POST') {
        // Handle both JSON and FormData
        const contentType = req.headers.get('content-type');
        let data;

        if (contentType?.includes('multipart/form-data')) {
            const formData = await req.formData();
            data = {
                chatId: Number(formData.get('chatId')),
                content: formData.get('content') as string,
                file: formData.get('file') as Blob | null,
                // The crucial change: get the 'type' directly from the FormData
                type: formData.get('type') as string,
            };
        } else {
            data = await req.json();
        }

        const { chatId, content, file, type } = data;

        if (!chatId || (!content && !file)) {
            return NextResponse.json({ error: 'Missing chatId or content/file' }, { status: 400 });
        }

        let messageData: any;

        if (file) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            const fileName = file.name;
            messageData = {
                chatId,
                senderId: user.id,
                type,
                fileData: fileBuffer,
                fileName,
            };
        } else {
            messageData = {
                chatId,
                senderId: user.id,
                content,
                type: 'text',
            };
        }

        const message = await prisma.message.create({
            data: messageData,
            include: { sender: { select: { id: true, username: true } } },
        });

        await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
        });

        const { fileData, ...messageWithoutFileData } = message;
        return NextResponse.json(messageWithoutFileData);
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
