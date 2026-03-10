import { Router } from 'express';
import { submitRatingController, getRatingSummaryController } from '../controllers/ratingController';

const router = Router();

router.post('/', submitRatingController);
router.get('/summary', getRatingSummaryController);

export default router;
