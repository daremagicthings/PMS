import { Router } from 'express';
import { chatWithAi } from '../controllers/aiController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/chat', authMiddleware, chatWithAi);

export default router;
