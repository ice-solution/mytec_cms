import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  event_ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'EventTicket', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'HKD' },
  purchase_date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refund'], default: 'pending' },
  stripe_session_id: { type: String },
  stripe_payment_intent: { type: String },
  stripe_receipt_url: { type: String },
  payment_method: { type: String },
  refund_id: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now },
  modified_at: { type: Date, default: Date.now }
});

transactionSchema.pre('save', function(next) {
  this.modified_at = new Date();
  next();
});
transactionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ modified_at: new Date() });
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;