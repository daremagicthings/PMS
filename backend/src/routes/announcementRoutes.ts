import { Router } from 'express';
import {
    createAnnouncementController,
    getAllAnnouncementsController,
    updateAnnouncementController,
    deleteAnnouncementController,
} from '../controllers/announcementController';

const router = Router();

/** POST /api/announcements — Admin creates announcement */
router.post('/', createAnnouncementController);

/** GET /api/announcements — List all announcements */
router.get('/', getAllAnnouncementsController);

/** PUT /api/announcements/:id — Admin updates announcement */
router.put('/:id', updateAnnouncementController);

/** DELETE /api/announcements/:id — Admin deletes announcement */
router.delete('/:id', deleteAnnouncementController);

export default router;

