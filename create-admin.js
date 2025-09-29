import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './model/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 檢查是否已存在管理員
    const existingAdmin = await User.findOne({ email: 'admin@mytec.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // 創建管理員用戶
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@mytec.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@mytec.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();

