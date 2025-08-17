import mongoose from 'mongoose'

const eventTicketSchema = new mongoose.Schema({
  ticket_name: { type: String, required: true },
  cost: { type: Number, required: true },
  ticket_available_date: { type: Date, required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  created_at: { type: Date, default: Date.now },
  modified_at: { type: Date, default: Date.now }
})

eventTicketSchema.pre('save', function(next) {
  this.modified_at = new Date();
  next();
});
eventTicketSchema.pre('findOneAndUpdate', function(next) {
  this.set({ modified_at: new Date() });
  next();
});

const EventTicket = mongoose.model('EventTicket', eventTicketSchema)
export default EventTicket 