import app from './app';
import { PORT } from './config/env';
import { connectToDatabase } from './db/mongoose';


async function bootstrap() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`[server] Listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[server] Failed to start application', err);
    process.exit(1);
  }
}

bootstrap();
