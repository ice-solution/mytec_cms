import EventTicket from '../model/EventTickets.js'
import User from '../model/User.js'
import mongoose from 'mongoose';

const eventTicketController = {
  // 新增票券
  createTicket: async (req, res) => {
    try {
      const ticket = new EventTicket(req.body);
      await ticket.save();
      res.status(201).json(ticket);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // 依 event 查詢票券
  getTicketsByEvent: async (req, res) => {
    try {
      const { eventId } = req.params;
      const tickets = await EventTicket.find({ event: eventId });
      res.json(tickets);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // 依 id 查詢票券
  getTicketById: async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await EventTicket.findById(id);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
      res.json(ticket);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // 獲取用戶在特定事件的票券資訊
  getUserEventTickets: async (req, res) => {
    try {
      const { userId, eventId } = req.params;
      
      // 獲取用戶資訊
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // 獲取用戶在該事件的參加記錄
      const EventGuest = mongoose.model('EventGuest');
      const eventGuest = await EventGuest.findOne({ 
        user: userId, 
        event: eventId 
      });
      
      // 獲取用戶購買的票券（如果有 event_ticket 欄位）
      let userTickets = [];
      if (eventGuest && eventGuest.event_ticket) {
        // 如果 EventGuest 有 event_ticket 欄位，獲取票券詳情
        const ticket = await EventTicket.findById(eventGuest.event_ticket);
        if (ticket) {
          userTickets.push(ticket);
        }
      }
      
      // 構建回應資料
      const response = {
        user: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          avatar: user.avatar
        },
        eventParticipation: eventGuest ? {
          joined: true,
          status: eventGuest.status,
          joined_at: eventGuest.joined_at,
          checkin_at: eventGuest.checkin_at,
          event_ticket: eventGuest.event_ticket
        } : {
          joined: false,
          status: null,
          joined_at: null,
          checkin_at: null,
          event_ticket: null
        },
        tickets: userTickets
      };
      
      res.json(response);
    } catch (err) {
      console.error('Error in getUserEventTickets:', err);
      res.status(400).json({ error: err.message });
    }
  },
  // 更新票券
  updateTicket: async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await EventTicket.findByIdAndUpdate(id, req.body, { new: true });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
      res.json(ticket);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  // 刪除票券
  deleteTicket: async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await EventTicket.findByIdAndDelete(id);
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
      res.json({ message: 'Ticket deleted' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

export default eventTicketController 