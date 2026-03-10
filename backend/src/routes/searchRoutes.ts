import { Router } from 'express';
import { searchController } from '../controllers/searchController';

const router = Router();

/**
 * GET /api/search?q=query
 * Universal search across users, apartments, vehicles, and tickets.
 */
router.get('/', searchController);

export default router;
