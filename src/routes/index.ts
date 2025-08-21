import { Router } from 'express';
import { userRouter } from '@/routes/user.routes';
import { authRoutes } from '@/routes/auth.routes';
import { healthRouter } from '@/routes/health.routes';

const router: Router = Router();

router.use('/users', userRouter);
router.use('/auth', authRoutes);
router.use('/health', healthRouter);

export { router as routes };
