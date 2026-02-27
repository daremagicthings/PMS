import { Router } from 'express';
import {
  createTransactionController,
  getTransactionsByReportController,
  deleteTransactionController,
} from '../controllers/financialTransactionController';

const router = Router();

// Public / Resident access to view transactions for a report
router.get('/report/:reportId', getTransactionsByReportController);

// Admin only routes
router.post('/', createTransactionController);
router.delete('/:id', deleteTransactionController);

export default router;
