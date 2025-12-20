import { Router } from 'express';
import { signup, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);

export default router;