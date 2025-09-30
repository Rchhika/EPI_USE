import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import routes from './routes';
import { CLIENT_ORIGIN } from './config/env';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// --- Middleware ---
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: CLIENT_ORIGIN || 'http://localhost:8080', // single origin is usually cleaner
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// --- API routes ---
app.use('/api', routes);

// --- Error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
