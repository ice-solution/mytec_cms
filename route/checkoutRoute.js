import express from 'express';
import checkoutController from '../controllers/checkoutController.js';

const router = express.Router();

// 建立 Stripe Checkout Session
router.post('/checkout', checkoutController.createCheckout);
// Stripe webhook 處理付款結果
router.post('/checkout-result', express.raw({type: 'application/json'}), checkoutController.handleCheckoutResult);

export default router; 