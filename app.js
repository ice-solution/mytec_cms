import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
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
import subscriptionRoute from './route/subscriptionRoute.js'
import authRoute from './route/authRoute.js'
import User from './model/User.js'
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
// CORS 配置 - 允許所有來源
const corsOptions = {
  origin: true, // 允許所有來源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 提供 uploads 靜態檔案
app.use('/uploads', express.static('uploads'))

// 連接資料庫並創建默認管理員
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  // 檢查並創建默認管理員用戶
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      console.log('🔍 未找到管理員用戶，正在創建默認管理員...');
      
      // 從環境變數獲取管理員配置，如果沒有則使用默認值
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@mytec.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
      const adminLastName = process.env.ADMIN_LAST_NAME || 'User';
      
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = new User({
        first_name: adminFirstName,
        last_name: adminLastName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('✅ 默認管理員用戶創建成功！');
      console.log(`📧 管理員帳號: ${adminEmail}`);
      console.log(`🔑 管理員密碼: ${adminPassword}`);
      console.log('⚠️  請在首次登入後立即修改密碼！');
      console.log('💡 提示: 可以通過環境變數 ADMIN_EMAIL, ADMIN_PASSWORD 等來自定義管理員資訊');
    } else {
      console.log('✅ 管理員用戶已存在');
    }
  } catch (error) {
    console.error('❌ 創建管理員用戶時發生錯誤:', error);
  }
}).catch((error) => {
  console.error('❌ 資料庫連接失敗:', error);
  process.exit(1);
});

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
app.use('/api/subscriptions', subscriptionRoute)
app.use('/api/auth', authRoute)

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`Server URL: ${NODE_ENV === 'production' ? 'https://' : 'http://'}localhost:${PORT}`);
})

export default app
