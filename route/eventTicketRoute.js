import express from 'express'
import eventTicketController from '../controllers/eventTicketController.js'

const router = express.Router()

// 新增票券
router.post('/', eventTicketController.createTicket)
// 查詢某活動所有票券
router.get('/event/:eventId', eventTicketController.getTicketsByEvent)
// 獲取用戶在特定事件的票券資訊
router.get('/user/:userId/event/:eventId', eventTicketController.getUserEventTickets)
// 查詢單一票券
router.get('/:id', eventTicketController.getTicketById)
// 更新票券
router.put('/:id', eventTicketController.updateTicket)
// 刪除票券
router.delete('/:id', eventTicketController.deleteTicket)

export default router 