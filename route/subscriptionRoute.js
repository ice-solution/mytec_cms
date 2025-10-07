import express from 'express';
import subscriptionController from '../controllers/subscriptionController.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = express.Router();

// 公開路由 - 用戶訂閱/取消訂閱
router.post('/subscribe', subscriptionController.subscribe);
router.post('/unsubscribe', subscriptionController.unsubscribe);

// 管理員路由 - 只有管理員可以訪問
router.get('/admin/subscriptions', requireAdmin, subscriptionController.getAllSubscriptions);
router.get('/admin/stats', requireAdmin, subscriptionController.getSubscriptionStats);
router.post('/admin/send-edm', requireAdmin, subscriptionController.sendEDM);
router.post('/admin/test-edm', requireAdmin, subscriptionController.testEDM);
router.put('/admin/subscriptions/:id', requireAdmin, subscriptionController.updateSubscriptionStatus);
router.delete('/admin/subscriptions/:id', requireAdmin, subscriptionController.deleteSubscription);

export default router;
