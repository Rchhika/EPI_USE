import app from './app';
import { PORT } from './config/env';
import { connectToDatabase } from './db/mongoose';

async function bootstrap() {
  await connectToDatabase();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] Failed to start application', err);
  process.exit(1);
});


