import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const isZod = typeof err === 'object' && err !== null && 'issues' in (err as Record<string, unknown>);
  const status = isZod ? 400 : 500;
  const payload: Record<string, unknown> = {
    message: isZod ? 'Validation error' : 'Internal Server Error',
  };
  if (isZod) {
    payload.details = (err as Record<string, unknown>)['issues'];
  }
  // eslint-disable-next-line no-console
  if (status === 500) console.error('[error]', err);
  res.status(status).json(payload);
}


