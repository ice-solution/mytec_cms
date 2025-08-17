import express from 'express'
import eventGuestController from '../controllers/eventGuestController.js'

const router = express.Router()

// 用戶參加活動
router.post('/join', eventGuestController.joinEvent)
// 用戶簽到
router.post('/:userId/checkin/:eventId', eventGuestController.checkin)
// 獲取當前用戶已訂閱的活動列表
router.get('/my-subscriptions', eventGuestController.getMySubscriptions)
// 檢查用戶是否已參加特定活動
router.get('/check-status/:eventId', eventGuestController.checkUserEventStatus)
// 查詢某活動的所有參加者
router.get('/event/:eventId', eventGuestController.getEventGuests)
// 查詢某用戶參加過的所有活動
router.get('/user/:userId', eventGuestController.getUserEvents)
// 獲取用戶已參加的活動列表（只返回活動資訊）
router.get('/user/:userId/events', eventGuestController.getUserJoinedEvents)
// 更新參加者狀態
router.put('/:id', eventGuestController.updateGuestStatus)
// 刪除參加者
router.delete('/:id', eventGuestController.deleteGuest)
// 取消參加
router.post('/cancel', eventGuestController.cancelJoin)

export default router 