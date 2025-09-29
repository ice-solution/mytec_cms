import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  country_code: String,
  phone: String,
  email: String,
  gender: { type: String, enum: ['M', 'F'] },
  birth: Date,
  password: String,
  avatar: String,
  role: { 
    type: String, 
    enum: ['user', 'organizer', 'admin'], 
    default: 'user' 
  },
  userFavourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
})

const User = mongoose.model('User', userSchema)
export default User 