import { Router } from 'express';
import { createUserController, getAllUsersController, updatePushTokenController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/** POST /api/users — Create a new user/resident */
router.post('/', createUserController);

/** GET /api/users — List all users (Admin) */
router.get('/', getAllUsersController);

/** PUT /api/users/push-token — Register Expo push token for the logged-in user */
router.put('/push-token', authMiddleware, updatePushTokenController);

/** PUT /api/users/ebarimt-settings — Update user's E-Barimt preferences */
router.put('/ebarimt-settings', authMiddleware, async (req, res, next) => {
    const { updateEbarimtSettingsController } = await import('../controllers/userController');
    updateEbarimtSettingsController(req, res, next);
});

export default router;

