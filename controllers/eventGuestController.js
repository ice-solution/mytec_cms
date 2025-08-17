import EventGuest from '../model/EventGuest.js'
import jwt from 'jsonwebtoken';

const eventGuestController = {
  // 用戶參加活動
  joinEvent: async (req, res) => {
    try {
      const { event, user } = req.body;
      if (!event || !user) return res.status(400).json({ error: 'Missing event or user' });
      // 檢查是否已參加
      const exist = await EventGuest.findOne({ event, user });
      if (exist) return res.status(400).json({ error: 'Already joined' });
      const guest = new EventGuest({ event, user });
      await guest.save();
      res.status(201).json(guest);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // 查詢某活動的所有參加者
  getEventGuests: async (req, res) => {
    try {
      const { eventId } = req.params;
      const guests = await EventGuest.find({ event: eventId }).populate('user');
      res.json(guests);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // 查詢某用戶參加過的所有活動
  getUserEvents: async (req, res) => {
    try {
      const { userId } = req.params;
      const events = await EventGuest.find({ user: userId }).populate('event');
      res.json(events);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // 獲取用戶已參加的活動列表（只返回活動資訊）
  getUserJoinedEvents: async (req, res) => {
    try {
      const { userId } = req.params;
      const eventGuests = await EventGuest.find({ 
        user: userId,
        status: { $ne: 'cancelled' } // 排除已取消的活動
      }).populate({
        path: 'event',
        populate: {
          path: 'category',
          select: 'name'
        }
      });
      
      // 提取活動資訊並添加參加狀態
      const events = eventGuests.map(guest => ({
        ...guest.event.toObject(),
        joined_at: guest.joined_at,
        status: guest.status,
        checkin_at: guest.checkin_at,
        event_ticket: guest.event_ticket
      }));
      
      res.json(events);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // 獲取當前用戶已訂閱的活動列表
  getMySubscriptions: async (req, res) => {
    try {
      // 檢查認證
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

      const eventGuests = await EventGuest.find({ 
        user: userId,
        status: { $ne: 'cancelled' } // 排除已取消的活動
      }).populate({
        path: 'event',
        populate: {
          path: 'category',
          select: 'name'
        }
      });
      
      // 提取活動資訊並添加參加狀態
      const events = eventGuests.map(guest => ({
        ...guest.event.toObject(),
        joined_at: guest.joined_at,
        status: guest.status,
        checkin_at: guest.checkin_at,
        event_ticket: guest.event_ticket
      }));
      
      res.json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (err) {
      console.error('Error in getMySubscriptions:', err);
      res.status(400).json({ error: err.message });
    }
  },
  // 檢查用戶是否已參加特定活動
  checkUserEventStatus: async (req, res) => {
    try {
      const { eventId } = req.params;
      
      // 檢查認證
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

      const eventGuest = await EventGuest.findOne({ 
        event: eventId, 
        user: userId 
      });

      if (!eventGuest) {
        return res.json({
          joined: false,
          status: null,
          joined_at: null,
          checkin_at: null,
          event_ticket: null
        });
      }

      res.json({
        joined: true,
        status: eventGuest.status,
        joined_at: eventGuest.joined_at,
        checkin_at: eventGuest.checkin_at,
        event_ticket: eventGuest.event_ticket
      });
    } catch (err) {
      console.error('Error in checkUserEventStatus:', err);
      res.status(400).json({ error: err.message });
    }
  },
  // 取消參加
  cancelJoin: async (req, res) => {
    try {
      const { event, user } = req.body;
      const guest = await EventGuest.findOneAndUpdate(
        { event, user },
        { status: 'cancelled' },
        { new: true }
      );
      if (!guest) return res.status(404).json({ error: 'Not found' });
      res.json(guest);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // 更新參加者狀態
  updateGuestStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['joined', 'checked_in', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const updateData = { status };
      
      // 如果設為已簽到，自動設置簽到時間
      if (status === 'checked_in') {
        updateData.checkin_at = new Date();
      }
      
      const guest = await EventGuest.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).populate('user');
      
      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' });
      }
      
      res.json(guest);
    } catch (err) {
      console.error('Error in updateGuestStatus:', err);
      res.status(400).json({ error: err.message });
    }
  },
  // 刪除參加者
  deleteGuest: async (req, res) => {
    try {
      const { id } = req.params;
      const guest = await EventGuest.findByIdAndDelete(id);
      
      if (!guest) {
        return res.status(404).json({ error: 'Guest not found' });
      }
      
      res.status(204).send();
    } catch (err) {
      console.error('Error in deleteGuest:', err);
      res.status(400).json({ error: err.message });
    }
  },
  // 用戶簽到
  checkin: async (req, res) => {
    try {
      const { userId, eventId } = req.params;

      // 查找用戶的參加記錄
      const eventGuest = await EventGuest.findOne({ 
        event: eventId, 
        user: userId 
      });

      if (!eventGuest) {
        return res.status(404).json({ error: 'User not found in event participants' });
      }

      // 檢查是否已經簽到
      if (eventGuest.status === 'checked_in') {
        return res.status(400).json({ 
          error: 'Already checked in',
          checkin_at: eventGuest.checkin_at
        });
      }

      // 更新狀態為已簽到並設置簽到時間
      const updatedGuest = await EventGuest.findByIdAndUpdate(
        eventGuest._id,
        {
          status: 'checked_in',
          checkin_at: new Date()
        },
        { new: true }
      ).populate('user');

      res.json({
        success: true,
        message: 'Check-in successful',
        data: {
          user: updatedGuest.user,
          event: eventId,
          status: updatedGuest.status,
          joined_at: updatedGuest.joined_at,
          checkin_at: updatedGuest.checkin_at,
          event_ticket: updatedGuest.event_ticket
        }
      });
    } catch (err) {
      console.error('Error in checkin:', err);
      res.status(400).json({ error: err.message });
    }
  }
}

export default eventGuestController; 