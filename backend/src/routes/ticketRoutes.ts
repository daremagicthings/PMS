import { Router } from 'express';
import {
    createTicketController,
    getAllTicketsController,
    updateTicketStatusController,
} from '../controllers/ticketController';
import { uploadSingle } from '../middlewares/uploadMiddleware';
import commentRoutes from './commentRoutes';

const router = Router();

/** POST /api/tickets — Resident creates a ticket (with optional image upload) */
router.post('/', uploadSingle, createTicketController);

/** GET /api/tickets — List all tickets */
router.get('/', getAllTicketsController);

/** PUT /api/tickets/:id/status — Admin updates ticket status */
router.put('/:id/status', updateTicketStatusController);

/** /api/tickets/:id/comments — Comment sub-routes */
router.use('/:id/comments', commentRoutes);

export default router;
