import Subscription from '../model/Subscription.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 創建郵件傳輸器
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // 或其他郵件服務
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const subscriptionController = {
  // 用戶訂閱
  subscribe: async (req, res) => {
    try {
      const { email, source = 'website', tags = [], metadata = {} } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // 檢查是否已經訂閱
      const existingSubscription = await Subscription.findOne({ email: email.toLowerCase() });
      
      if (existingSubscription) {
        if (existingSubscription.status === 'active') {
          return res.status(400).json({ 
            error: 'Email already subscribed',
            message: '此郵箱已經訂閱了我們的資訊'
          });
        } else {
          // 重新激活訂閱
          existingSubscription.status = 'active';
          existingSubscription.subscribed_at = new Date();
          existingSubscription.unsubscribed_at = null;
          await existingSubscription.save();
          
          return res.json({ 
            success: true, 
            message: '歡迎回來！您的訂閱已重新激活',
            subscription: existingSubscription
          });
        }
      }

      // 創建新訂閱
      const subscription = new Subscription({
        email: email.toLowerCase(),
        source,
        tags,
        metadata
      });

      await subscription.save();

      res.status(201).json({ 
        success: true, 
        message: '訂閱成功！感謝您的關注',
        subscription: {
          email: subscription.email,
          subscribed_at: subscription.subscribed_at
        }
      });
    } catch (err) {
      console.error('Subscription error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // 取消訂閱
  unsubscribe: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const subscription = await Subscription.findOne({ email: email.toLowerCase() });
      
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      subscription.status = 'unsubscribed';
      subscription.unsubscribed_at = new Date();
      await subscription.save();

      res.json({ 
        success: true, 
        message: '已成功取消訂閱'
      });
    } catch (err) {
      console.error('Unsubscribe error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // 獲取所有訂閱者 (管理員用)
  getAllSubscriptions: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      
      const filter = {};
      if (status) {
        filter.status = status;
      }
      if (search) {
        filter.email = { $regex: search, $options: 'i' };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Subscription.countDocuments(filter);
      
      const subscriptions = await Subscription.find(filter)
        .sort({ subscribed_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      res.json({
        subscriptions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (err) {
      console.error('Get subscriptions error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // 獲取訂閱統計
  getSubscriptionStats: async (req, res) => {
    try {
      const stats = await Subscription.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalSubscriptions = await Subscription.countDocuments();
      const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
      const unsubscribedCount = await Subscription.countDocuments({ status: 'unsubscribed' });
      const bouncedCount = await Subscription.countDocuments({ status: 'bounced' });

      // 最近30天的新訂閱
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentSubscriptions = await Subscription.countDocuments({
        subscribed_at: { $gte: thirtyDaysAgo }
      });

      res.json({
        total: totalSubscriptions,
        active: activeSubscriptions,
        unsubscribed: unsubscribedCount,
        bounced: bouncedCount,
        recent_30_days: recentSubscriptions,
        stats: stats
      });
    } catch (err) {
      console.error('Get stats error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // 發送 EDM
  sendEDM: async (req, res) => {
    try {
      const { subject, content, htmlContent, targetStatus = 'active', tags = [] } = req.body;

      if (!subject || !content) {
        return res.status(400).json({ error: 'Subject and content are required' });
      }

      // 建立查詢條件
      const filter = { status: targetStatus };
      if (tags.length > 0) {
        filter.tags = { $in: tags };
      }

      // 獲取目標訂閱者
      const subscribers = await Subscription.find(filter);
      
      if (subscribers.length === 0) {
        return res.status(400).json({ error: 'No subscribers found' });
      }

      const transporter = createTransporter();
      const results = {
        total: subscribers.length,
        sent: 0,
        failed: 0,
        errors: []
      };

      // 發送郵件
      for (const subscriber of subscribers) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: subscriber.email,
            subject: subject,
            text: content,
            html: htmlContent || content
          };

          await transporter.sendMail(mailOptions);
          
          // 更新最後發送時間
          subscriber.last_email_sent = new Date();
          await subscriber.save();
          
          results.sent++;
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
          results.failed++;
          results.errors.push({
            email: subscriber.email,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: `EDM 發送完成！成功: ${results.sent}, 失敗: ${results.failed}`,
        results
      });
    } catch (err) {
      console.error('Send EDM error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // 測試發送 EDM (只發送給管理員)
  testEDM: async (req, res) => {
    try {
      const { subject, content, htmlContent, testEmail } = req.body;

      if (!subject || !content || !testEmail) {
        return res.status(400).json({ error: 'Subject, content and test email are required' });
      }

      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: testEmail,
        subject: `[測試] ${subject}`,
        text: content,
        html: htmlContent || content
      };

      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: '測試郵件發送成功！'
      });
    } catch (err) {
      console.error('Test EDM error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // 更新訂閱者狀態
  updateSubscriptionStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, tags, metadata } = req.body;

      const subscription = await Subscription.findById(id);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      if (status) {
        subscription.status = status;
        if (status === 'unsubscribed') {
          subscription.unsubscribed_at = new Date();
        }
      }
      
      if (tags) {
        subscription.tags = tags;
      }
      
      if (metadata) {
        subscription.metadata = { ...subscription.metadata, ...metadata };
      }

      await subscription.save();

      res.json({
        success: true,
        message: '訂閱者資訊已更新',
        subscription
      });
    } catch (err) {
      console.error('Update subscription error:', err);
      res.status(500).json({ error: err.message });
    }
  },

  // 刪除訂閱者
  deleteSubscription: async (req, res) => {
    try {
      const { id } = req.params;

      const subscription = await Subscription.findByIdAndDelete(id);
      if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      res.json({
        success: true,
        message: '訂閱者已刪除'
      });
    } catch (err) {
      console.error('Delete subscription error:', err);
      res.status(500).json({ error: err.message });
    }
  }
};

export default subscriptionController;
