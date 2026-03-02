import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';

const router = Router();

/** GET /api/health — Server health check */
router.get('/health', healthCheck);

export default router;
