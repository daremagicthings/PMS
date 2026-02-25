import { Router } from 'express';
import {
    createApartmentController,
    getAllApartmentsController,
    updateApartmentController,
} from '../controllers/apartmentController';

const router = Router();

/** POST /api/apartments — Create a new apartment */
router.post('/', createApartmentController);

/** GET /api/apartments — List all apartments with residents */
router.get('/', getAllApartmentsController);

/** PUT /api/apartments/:id — Update apartment (lease, owner, tenant, etc) */
router.put('/:id', updateApartmentController);

export default router;
