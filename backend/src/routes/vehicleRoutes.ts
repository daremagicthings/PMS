import { Router } from 'express';
import {
    createVehicleController,
    getAllVehiclesController,
    updateVehicleController,
    deleteVehicleController,
} from '../controllers/vehicleController';

const router = Router();

/** POST /api/vehicles — Admin registers a new vehicle */
router.post('/', createVehicleController);

/** GET /api/vehicles — List all vehicles (optional ?search= for license plate) */
router.get('/', getAllVehiclesController);

/** PUT /api/vehicles/:id — Admin updates a vehicle */
router.put('/:id', updateVehicleController);

/** DELETE /api/vehicles/:id — Admin deletes a vehicle */
router.delete('/:id', deleteVehicleController);

export default router;
