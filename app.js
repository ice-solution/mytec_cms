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
import helmet from 'helmet';

dotenv.config();
console.log('Stripe key:', process.env.STRIPE_SECRET_KEY);
const app = express()

// 安全標頭
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json())
// CORS 配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允許的域名列表
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
      'https://mytec-api.sth-tech.com', // 替換為你的實際域名
      'https://mytec-cms.sth-tech.com'
    ];
    
    // 允許沒有 origin 的請求（例如同源請求）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

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

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`Server URL: ${NODE_ENV === 'production' ? 'https://' : 'http://'}localhost:${PORT}`);
})

export default app
