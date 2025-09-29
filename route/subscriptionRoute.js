import express from 'express';
import subscriptionController from '../controllers/subscriptionController.js';

const router = express.Router();

// 公開路由 - 用戶訂閱/取消訂閱
router.post('/subscribe', subscriptionController.subscribe);
router.post('/unsubscribe', subscriptionController.unsubscribe);

// 管理員路由 - 需要認證
router.get('/admin/subscriptions', subscriptionController.getAllSubscriptions);
router.get('/admin/stats', subscriptionController.getSubscriptionStats);
router.post('/admin/send-edm', subscriptionController.sendEDM);
router.post('/admin/test-edm', subscriptionController.testEDM);
router.put('/admin/subscriptions/:id', subscriptionController.updateSubscriptionStatus);
router.delete('/admin/subscriptions/:id', subscriptionController.deleteSubscription);

export default router;
