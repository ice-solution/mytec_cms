import mongoose from 'mongoose'

const memberCardSchema = new mongoose.Schema({
  userId: String,
  qrCode: String,
  level: String
})

const MemberCard = mongoose.model('MemberCard', memberCardSchema)
export default MemberCard 