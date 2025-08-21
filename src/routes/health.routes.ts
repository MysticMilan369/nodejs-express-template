import { Router } from 'express';

const router: Router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export { router as healthRouter };
