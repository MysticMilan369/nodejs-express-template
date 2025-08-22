import { Router } from 'express';
import { HealthController } from '@/controllers/health.controller';

const router: Router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get('/', HealthController.healthCheck);

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Detailed health check including database
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All systems operational
 *       503:
 *         description: Some systems are experiencing issues
 */
router.get('/detailed', HealthController.detailedHealthCheck);

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness check for Kubernetes/Docker
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', HealthController.readinessCheck);

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness check for Kubernetes/Docker
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', HealthController.livenessCheck);

export { router as healthRouter };
