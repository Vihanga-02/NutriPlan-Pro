import express from 'express';
import { signup, login, logout, getCurrentUser, getAllUsers, createAdmin, createAdminByAdmin, updateProfile } from '../controllers/authController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateUser, getCurrentUser);
router.put('/profile', authenticateUser, updateProfile);
router.get('/users', authenticateUser, requireAdmin, getAllUsers);
// Public endpoint for creating admin account (no auth required - for initial setup)
router.post('/create-admin', createAdmin);
// Admin-only endpoint for creating admins from admin panel
router.post('/create-admin-secure', authenticateUser, requireAdmin, createAdminByAdmin);

export default router;
