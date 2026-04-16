import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser, getStats } from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { validateRole } from '../middleware/validate.js';

const router = Router();

router.use(verifyToken, requireRole('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/role', validateRole, updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);

export default router;
