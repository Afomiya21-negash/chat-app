import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../utils/jwt';

export function withAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
   const authHeader = req.headers.get('authorization');
    console.log('Auth header:', authHeader);
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
  const decoded = verifyToken(token);
  return await handler(req, decoded, ...args);
} catch (err: any) {
  console.error('JWT Error:', err.message);
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}

  };
}