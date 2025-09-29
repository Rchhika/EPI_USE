import { Router } from 'express';
import itemsRouter from './items.routes';
import authRouter from './auth.routes';
import employeesRouter from './employee.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

router.use('/auth', authRouter);
router.use('/items', itemsRouter);
router.use('/employees', employeesRouter);

export default router;


