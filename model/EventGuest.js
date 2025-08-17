import mongoose from 'mongoose'

const eventGuestSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joined_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['joined', 'cancelled', 'checked_in'], default: 'joined' },
  checkin_at: { type: Date, default: null },
  event_ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'EventTicket', default: null }
})

const EventGuest = mongoose.model('EventGuest', eventGuestSchema)
export default EventGuest 