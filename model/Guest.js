import mongoose from 'mongoose'

const guestSchema = new mongoose.Schema({
  name: String,
  isVIP: Boolean,
  checkedIn: Boolean
})

const Guest = mongoose.model('Guest', guestSchema)
export default Guest 