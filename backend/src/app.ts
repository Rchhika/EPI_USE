import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes';
import { CLIENT_ORIGIN } from './config/env';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';
import cookieParser from 'cookie-parser';

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://localhost:8080'].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;


