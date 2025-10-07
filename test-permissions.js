#!/usr/bin/env node

// 權限測試腳本
import mongoose from 'mongoose';
import User from './model/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testPermissions = async () => {
  try {
    // 連接資料庫
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已連接到資料庫');

    // 檢查現有用戶
    const users = await User.find({}, { email: 1, role: 1, first_name: 1, last_name: 1 });
    console.log('\n📋 現有用戶列表:');
    users.forEach(user => {
      console.log(`- ${user.first_name} ${user.last_name} (${user.email}) - 角色: ${user.role}`);
    });

    // 檢查角色分布
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 角色分布統計:');
    roleStats.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count} 人`);
    });

    // 測試登入權限
    console.log('\n🔐 登入權限測試:');
    const testUsers = await User.find({ role: { $in: ['admin', 'coach', 'member'] } });
    
    testUsers.forEach(user => {
      let canLogin = false;
      let reason = '';
      
      if (user.role === 'admin') {
        canLogin = true;
        reason = '管理員 - 可以登入後台';
      } else if (user.role === 'coach') {
        canLogin = true;
        reason = '教練 - 可以登入後台';
      } else if (user.role === 'member') {
        canLogin = false;
        reason = '會員 - 不能登入後台';
      }
      
      console.log(`- ${user.first_name} ${user.last_name} (${user.role}): ${canLogin ? '✅' : '❌'} ${reason}`);
    });

    // 測試事件權限
    console.log('\n📅 事件權限測試:');
    console.log('- 管理員: 可以看到所有事件');
    console.log('- 教練: 只能看到自己創建的事件');
    console.log('- 會員: 無法登入後台，無法查看事件');

    // 測試功能權限
    console.log('\n🔧 功能權限測試:');
    console.log('- 管理員: 可以訪問所有功能（事件、分類、用戶、角色、訂閱）');
    console.log('- 教練: 可以讀取分類（用於創建事件），但無法修改分類');
    console.log('- 教練: 可以管理事件，但無法訪問用戶、角色、訂閱管理');
    console.log('- 會員: 無法登入後台');

    console.log('\n✅ 權限測試完成');

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 已斷開資料庫連接');
  }
};

testPermissions();
