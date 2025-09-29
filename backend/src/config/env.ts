import dotenv from 'dotenv';

dotenv.config();

const getNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const PORT: number = getNumber(process.env.PORT, 5001);

export const MONGODB_URI: string = (() => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim().length === 0) {
    throw new Error('MONGODB_URI is not set. Please set it in your .env file.');
  }
  return uri;
})();

export const CLIENT_ORIGIN: string = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

export const ADMIN_EMAIL: string = (() => {
  const v = process.env.ADMIN_EMAIL;
  if (!v) throw new Error('ADMIN_EMAIL is not set.');
  return v;
})();

export const ADMIN_PASSWORD: string = (() => {
  const v = process.env.ADMIN_PASSWORD;
  if (!v) throw new Error('ADMIN_PASSWORD is not set.');
  return v;
})();

export const JWT_SECRET: string = (() => {
  const v = process.env.JWT_SECRET;
  if (!v) throw new Error('JWT_SECRET is not set.');
  return v;
})();

export const SESSION_MAX_AGE_DAYS: number = getNumber(process.env.SESSION_MAX_AGE_DAYS, 7);


