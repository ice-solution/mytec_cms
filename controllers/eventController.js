import Event from '../model/Event.js'
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const eventController = {
  getAllEvents: async (req, res) => {
    try {
      const { categories, page = 1, limit = 10, list, date } = req.query;
      const filter = {};
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
        .sort({ date: 1 })
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
      const event = new Event(req.body)
      await event.save()
      res.status(201).json(event)
    } catch (err) {
      res.status(400).json({ error: err.message })
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
        .sort({ date: 1 })
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
  // 取得用戶自己創立的活動
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
      const allEvents = await Event.find({ owner: userId }).sort({ date: 1 });
      const upcoming = allEvents.filter(e => e.date.slice(0, 10) >= today);
      const past = allEvents.filter(e => e.date.slice(0, 10) < today);
      res.json({ upcoming, past });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default eventController 