import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

function getSecret(): string {
  if (!SECRET || typeof SECRET !== 'string') {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return SECRET;
}

export function signToken(payload: Record<string, unknown>) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  console.log('Verifying token:', token);
  console.log('Using secret:', SECRET);
  return jwt.verify(token, getSecret());
}
