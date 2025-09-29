import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ADMIN_EMAIL, JWT_SECRET } from '../config/env';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { email: string };
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth_token as string | undefined;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    if (decoded.sub !== ADMIN_EMAIL) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { email: ADMIN_EMAIL };
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}


