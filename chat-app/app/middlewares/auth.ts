import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../utils/jwt';

type HandlerFunction = (req: NextRequest, user: unknown, ...args: unknown[]) => Promise<NextResponse>;

export function withAuth(handler: HandlerFunction) {
  return async (req: NextRequest, ...args: unknown[]) => {
   const authHeader = req.headers.get('authorization');
    console.log('Auth header:', authHeader);
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
  const decoded = verifyToken(token);
  return await handler(req, decoded, ...args);
} catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  console.error('JWT Error:', errorMessage);
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}

  };
}
