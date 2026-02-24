import { Router } from 'express';
import {
    createWorkPlanController,
    getAllWorkPlansController,
    updateWorkPlanController,
    deleteWorkPlanController,
} from '../controllers/workPlanController';
import { uploadSingle } from '../middlewares/uploadMiddleware';

const router = Router();

/** POST /api/work-plans — Admin creates a work plan (with optional image) */
router.post('/', uploadSingle, createWorkPlanController);

/** GET /api/work-plans — List all work plans */
router.get('/', getAllWorkPlansController);

/** PUT /api/work-plans/:id — Admin updates a work plan (with optional image) */
router.put('/:id', uploadSingle, updateWorkPlanController);

/** DELETE /api/work-plans/:id — Admin deletes a work plan */
router.delete('/:id', deleteWorkPlanController);

export default router;
