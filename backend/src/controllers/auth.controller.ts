import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET, SESSION_MAX_AGE_DAYS } from '../config/env';

const isProd = process.env.NODE_ENV === 'production';

function signToken() {
  const expiresInSec = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;
  const token = jwt.sign({ sub: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: expiresInSec });
  return { token, maxAgeMs: expiresInSec * 1000 };
}

function authCookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd,
    maxAge: maxAgeMs,
    path: '/',
  };
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return res.status(401).json({ message: 'Invalid credentials' });
  const { token, maxAgeMs } = signToken();
  res.cookie('auth_token', token, authCookieOptions(maxAgeMs));
  return res.status(200).json({ email: ADMIN_EMAIL });
}

export async function me(req: Request, res: Response) {
  const token = req.cookies?.auth_token as string | undefined;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ email: ADMIN_EMAIL });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('auth_token', { httpOnly: true, sameSite: 'lax', secure: isProd, path: '/' });
  return res.status(204).send();
}


