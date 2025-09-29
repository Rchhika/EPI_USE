import { Response } from 'express';

type JsonBody = Record<string, unknown> | Array<unknown> | null;

export function ok(res: Response, body: JsonBody = null) {
  return res.status(200).json(body ?? { ok: true });
}

export function created(res: Response, body: JsonBody) {
  return res.status(201).json(body);
}

export function badRequest(res: Response, message: string, details?: unknown) {
  return res.status(400).json({ message, details });
}

export function notFound(res: Response, message = 'Not Found') {
  return res.status(404).json({ message });
}

export function serverError(res: Response, message = 'Internal Server Error', details?: unknown) {
  return res.status(500).json({ message, details });
}


