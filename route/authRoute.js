import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// 認證路由
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify', authController.verifyToken);
router.get('/me', authController.getCurrentUser);

export default router;
