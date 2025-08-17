import Stripe from 'stripe';
import Transaction from '../model/Transaction.js';
import Event from '../model/Event.js';
import EventTicket from '../model/EventTickets.js';
import User from '../model/User.js';
import dotenv from 'dotenv';
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const checkoutController = {
  // 建立 Stripe Checkout Session
  createCheckout: async (req, res) => {
    try {
      const { userId, eventId, ticketId, quantity = 1, success_url, cancel_url } = req.body;
      // 取得票券資料
      const ticket = await EventTicket.findById(ticketId);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });
      // 建立 Stripe Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'hkd',
              product_data: {
                name: `${event.title} - ${ticket.ticket_name}`,
                description: event.description || '',
              },
              unit_amount: Math.round(ticket.cost * 100),
            },
            quantity,
          },
        ],
        mode: 'payment',
        success_url: success_url || 'http://localhost:3000/checkout-success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: cancel_url || 'http://localhost:3000/checkout-cancel',
        metadata: {
          userId,
          eventId,
          ticketId
        }
      });
      // 建立交易記錄（pending）
      await Transaction.create({
        user: userId,
        event: eventId,
        event_ticket: ticketId,
        amount: ticket.cost * quantity,
        currency: 'HKD',
        status: 'pending',
        stripe_session_id: session.id
      });
      res.json({ url: session.url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Stripe webhook 處理付款結果
  handleCheckoutResult: async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // 只處理成功付款
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // 更新交易狀態
      const tx = await Transaction.findOneAndUpdate(
        { stripe_session_id: session.id },
        {
          status: 'paid',
          stripe_payment_intent: session.payment_intent,
          stripe_receipt_url: session.receipt_url || '',
          purchase_date: new Date(),
          payment_method: session.payment_method_types ? session.payment_method_types[0] : ''
        },
        { new: true }
      );
      // 你可以在這裡自動發送 email、建立 EventGuest 等
    }
    res.json({ received: true });
  }
};

export default checkoutController; 