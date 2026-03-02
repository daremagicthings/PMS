import { Router } from 'express';
import {
    uploadBankStatementsController,
    getPendingStatementsController,
    autoMatchController,
    manualMatchController
} from '../controllers/bankStatementController';
import { uploadSingle } from '../middlewares/uploadMiddleware';

const router = Router();

router.get('/pending', getPendingStatementsController);
router.post('/upload', uploadSingle, uploadBankStatementsController);
router.post('/auto-match', autoMatchController);
router.post('/:id/match', manualMatchController);

export default router;
