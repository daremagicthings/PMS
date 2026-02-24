import { Router } from 'express';
import {
    getCommentsController,
    addCommentController,
} from '../controllers/commentController';

/**
 * Comment routes — mounted as sub-router under /api/tickets/:id/comments.
 * Uses mergeParams to access :id from parent router.
 */
const router = Router({ mergeParams: true });

/** GET /api/tickets/:id/comments — List comments for a ticket */
router.get('/', getCommentsController);

/** POST /api/tickets/:id/comments — Add a comment to a ticket */
router.post('/', addCommentController);

export default router;
