import { Router } from 'express';
import {
    createApartmentController,
    getAllApartmentsController,
} from '../controllers/apartmentController';

const router = Router();

/** POST /api/apartments — Create a new apartment */
router.post('/', createApartmentController);

/** GET /api/apartments — List all apartments with residents */
router.get('/', getAllApartmentsController);

export default router;
