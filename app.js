import express from 'express'
import mongoose from 'mongoose'
import eventRoute from './route/eventRoute.js'
import categoryRoute from './route/categoryRoute.js'
import userRoute from './route/userRoute.js'
import memberCardRoute from './route/memberCardRoute.js'
import notificationRoute from './route/notificationRoute.js'
import guestRoute from './route/guestRoute.js'
import eventGuestRoute from './route/eventGuestRoute.js'
import eventTicketRoute from './route/eventTicketRoute.js'
import checkoutRoute from './route/checkoutRoute.js'
import favoriteRoute from './route/favoriteRoute.js'
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
console.log('Stripe key:', process.env.STRIPE_SECRET_KEY);
const app = express()
app.use(express.json())
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}))

// 提供 uploads 靜態檔案
app.use('/uploads', express.static('uploads'))

mongoose.connect(process.env.MONGODB_URI)

app.use('/api/events', eventRoute)
app.use('/api/categories', categoryRoute)
app.use('/api/users', userRoute)
app.use('/api/membercards', memberCardRoute)
app.use('/api/notifications', notificationRoute)
app.use('/api/guests', guestRoute)
app.use('/api/event-guests', eventGuestRoute)
app.use('/api/event-tickets', eventTicketRoute)
app.use('/api/favorites', favoriteRoute)
app.use('/api', checkoutRoute)

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000')
})

export default app
