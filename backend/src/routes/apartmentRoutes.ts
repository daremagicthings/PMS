import { Router } from 'express';
import {
    createApartmentController,
    getAllApartmentsController,
    updateApartmentController,
    getMyApartmentsController
} from '../controllers/apartmentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/** GET /api/apartments/my-apartments — List all apartments linked to user */
router.get('/my-apartments', authMiddleware, getMyApartmentsController);

/** POST /api/apartments — Create a new apartment */
router.post('/', createApartmentController);

/** GET /api/apartments — List all apartments with residents */
router.get('/', getAllApartmentsController);

/** PUT /api/apartments/:id — Update apartment (lease, owner, tenant, etc) */
router.put('/:id', updateApartmentController);

export default router;
