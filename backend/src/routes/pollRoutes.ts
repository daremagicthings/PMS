import { Router } from 'express';
import {
    createPollController,
    getAllPollsController,
    castVoteController,
    closePollController,
} from '../controllers/pollController';

const router = Router();

/** POST /api/polls — Create a new poll (Admin) */
router.post('/', createPollController);

/** GET /api/polls — List all polls with vote counts */
router.get('/', getAllPollsController);

/** POST /api/polls/:id/vote — Cast a vote */
router.post('/:id/vote', castVoteController);

/** PUT /api/polls/:id/close — Close a poll (Admin) */
router.put('/:id/close', closePollController);

export default router;
