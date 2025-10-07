import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// 認證路由
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify', authController.verifyToken);
router.get('/me', authController.getCurrentUser);

// 重置密碼路由
router.post('/check-user', authController.checkUserExists);
router.post('/reset-password', authController.resetPassword);

export default router;
