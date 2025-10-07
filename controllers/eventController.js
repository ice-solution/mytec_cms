import Event from '../model/Event.js'
import Transaction from '../model/Transaction.js'
import User from '../model/User.js'
import EventTicket from '../model/EventTickets.js'
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const eventController = {
  getAllEvents: async (req, res) => {
    try {
      const { categories, page = 1, limit = 10, list, date } = req.query;
      const filter = {};
      
      // 權限控制：根據用戶角色過濾事件
      const user = req.user; // 從中間件獲取用戶信息（可能為空）
      if (user && user.role === 'coach') {
        // Coach 只能看到自己創建的事件
        filter.owner = user._id;
      }
      // 如果沒有用戶信息（公開訪問）或 Admin，可以看到所有事件
      
      // 支援 categories=music,game,wine
      if (categories) {
        const arr = categories.split(',').map(s => s.trim());
        filter.category = { $in: arr };
      }
      // upcoming: 只拿未來的 event
      if (list === 'upcoming') {
        filter.date = { $gte: new Date().toISOString().slice(0, 10) };
      }
      // date: 精確查詢某天（忽略時間）
      if (date) {
        // 取得當天 00:00 ~ 23:59:59 的範圍
        const start = date;
        const end = date + 'T23:59:59';
        filter.date = { $gte: start, $lte: end };
      }
      // 分頁
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Event.countDocuments(filter);
      const events = await Event.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      res.json({
        data: events,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  getEventById: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)
        .populate('owner')
        .lean(); // 轉換為普通 JavaScript 物件，提升效能
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // 確保返回所有 SEO 相關欄位
      const eventData = {
        ...event,
        // 確保這些欄位存在，即使為 null
        slug: event.slug || null,
        meta_title: event.meta_title || event.title, // 如果沒有設定，使用標題
        meta_description: event.meta_description || (event.description ? event.description.substring(0, 160) : ''),
        meta_keywords: event.meta_keywords || null,
        og_image: event.og_image || null,
        // 添加 SEO URL 資訊
        seo_url: event.category && event.slug ? 
          `/events/${event.category.toLowerCase().replace(/\s+/g, '-')}/${event.slug}` : 
          null
      };

      res.json(eventData);
    } catch (err) {
      console.error('Error in getEventById:', err);
      res.status(500).json({ error: err.message });
    }
  },
  // 根據 slug 獲取事件詳情
  getEventBySlug: async (req, res) => {
    try {
      const { categorySlug, eventSlug } = req.params;
      const event = await Event.findBySlug(eventSlug)
        .populate('owner')
        .lean();
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      // 檢查分類 slug 是否匹配
      if (categorySlug && event.category) {
        const Category = mongoose.model('Category');
        const category = await Category.findBySlug(categorySlug);
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        
        // 比較分類名稱（忽略大小寫和空格）
        const eventCategoryNormalized = event.category.toLowerCase().trim();
        const categoryNameNormalized = category.name.toLowerCase().trim();
        
        if (eventCategoryNormalized !== categoryNameNormalized) {
          return res.status(404).json({ 
            error: 'Category mismatch', 
            details: {
              eventCategory: event.category,
              categorySlug: categorySlug,
              categoryName: category.name
            }
          });
        }
      }

      // 確保返回所有 SEO 相關欄位
      const eventData = {
        ...event,
        // 確保這些欄位存在，即使為 null
        slug: event.slug || null,
        meta_title: event.meta_title || event.title, // 如果沒有設定，使用標題
        meta_description: event.meta_description || (event.description ? event.description.substring(0, 160) : ''),
        meta_keywords: event.meta_keywords || null,
        og_image: event.og_image || null,
        // 添加 SEO URL 資訊
        seo_url: event.category && event.slug ? 
          `/events/${event.category.toLowerCase().replace(/\s+/g, '-')}/${event.slug}` : 
          null
      };
      
      res.json(eventData);
    } catch (err) {
      console.error('Error in getEventBySlug:', err);
      res.status(500).json({ error: err.message });
    }
  },
  createEvent: async (req, res) => {
    try {
      // 確保事件有 owner 字段，如果沒有則設置為當前用戶
      const eventData = { ...req.body };
      if (!eventData.owner && req.user) {
        eventData.owner = req.user._id;
      }
      
      const event = new Event(eventData);
      await event.save();
      res.status(201).json(event);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  updateEvent: async (req, res) => {
    try {
      const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!event) return res.status(404).json({ error: 'Event not found' })
      res.json(event)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  deleteEvent: async (req, res) => {
    try {
      const event = await Event.findByIdAndDelete(req.params.id)
      if (!event) return res.status(404).json({ error: 'Event not found' })
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  // 搜尋 Event 名稱
  searchEvents: async (req, res) => {
    try {
      const { q = '', page = 1, limit = 10 } = req.query;
      const filter = {};
      if (q) {
        filter.title = { $regex: q, $options: 'i' };
      }
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Event.countDocuments(filter);
      const events = await Event.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      res.json({
        data: events,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  // 取得用戶自己創立的活動 (需要認證 - 個人資料)
  getMyEvents: async (req, res) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      const token = auth.replace('Bearer ', '');
      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET || 'mytec_secret');
      } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      const userId = payload.id;
      // 只比較日期（yyyy-mm-dd），不比時間
      const today = new Date().toISOString().slice(0, 10);
      const allEvents = await Event.find({ owner: userId }).sort({ created_at: -1 });
      const upcoming = allEvents.filter(e => e.date.slice(0, 10) >= today);
      const past = allEvents.filter(e => e.date.slice(0, 10) < today);
      res.json({ upcoming, past });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 獲取特定事件的訂單列表
  getEventOrders: async (req, res) => {
    try {
      const { eventId } = req.params;
      const { page = 1, limit = 20, status } = req.query;

      console.log('Getting orders for event:', eventId);

      // 檢查事件是否存在
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // 建立查詢條件
      const filter = { event: eventId };
      if (status) {
        filter.status = status;
      }

      console.log('Filter:', filter);

      // 分頁設定
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const total = await Transaction.countDocuments(filter);

      console.log('Total transactions:', total);

      // 獲取訂單列表，包含相關資料
      const orders = await Transaction.find(filter)
        .populate('user', 'first_name last_name email avatar')
        .populate('event_ticket', 'ticket_name cost')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      console.log('Orders found:', orders.length);

      // 格式化訂單資料
      const formattedOrders = orders.map(order => ({
        _id: order._id,
        user: {
          _id: order.user._id,
          name: `${order.user.first_name} ${order.user.last_name}`,
          email: order.user.email,
          avatar: order.user.avatar
        },
        ticket: {
          _id: order.event_ticket._id,
          name: order.event_ticket.ticket_name,
          cost: order.event_ticket.cost
        },
        quantity: order.quantity,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        purchase_date: order.purchase_date,
        payment_method: order.payment_method,
        stripe_receipt_url: order.stripe_receipt_url,
        created_at: order.created_at
      }));

      // 計算統計資料
      let stats = [];
      try {
        stats = await Transaction.aggregate([
          { $match: { event: new mongoose.Types.ObjectId(eventId) } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              total_amount: { $sum: '$amount' }
            }
          }
        ]);
        console.log('Stats:', stats);
      } catch (statsError) {
        console.error('Error calculating stats:', statsError);
        // 如果統計計算失敗，使用簡單的查詢
        const paidCount = await Transaction.countDocuments({ event: eventId, status: 'paid' });
        const pendingCount = await Transaction.countDocuments({ event: eventId, status: 'pending' });
        const failedCount = await Transaction.countDocuments({ event: eventId, status: 'failed' });
        const refundCount = await Transaction.countDocuments({ event: eventId, status: 'refund' });
        
        const paidRevenue = await Transaction.aggregate([
          { $match: { event: new mongoose.Types.ObjectId(eventId), status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        stats = [
          { _id: 'paid', count: paidCount, total_amount: paidRevenue[0]?.total || 0 },
          { _id: 'pending', count: pendingCount, total_amount: 0 },
          { _id: 'failed', count: failedCount, total_amount: 0 },
          { _id: 'refund', count: refundCount, total_amount: 0 }
        ];
      }

      const statusStats = {
        total_orders: total,
        total_revenue: 0,
        pending: 0,
        paid: 0,
        failed: 0,
        refund: 0
      };

      stats.forEach(stat => {
        statusStats[stat._id] = stat.count;
        if (stat._id === 'paid') {
          statusStats.total_revenue = stat.total_amount;
        }
      });

      res.json({
        event: {
          _id: event._id,
          title: event.title,
          date: event.date
        },
        orders: formattedOrders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        stats: statusStats
      });
    } catch (err) {
      console.error('Error in getEventOrders:', err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default eventController 