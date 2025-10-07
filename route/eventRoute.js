import express from 'express'
import eventController from '../controllers/eventController.js'
import { requireAuth } from '../middleware/roleAuth.js'
import multer from 'multer'
import path from 'path'

const router = express.Router()

// Multer 設定 for event_img
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/event_imgs')
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const name = file.fieldname + '-' + Date.now() + ext
    cb(null, name)
  }
})
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Only jpg and png allowed'), false)
}
const upload = multer({ storage, fileFilter })

// GET 方法不需要認證，其他方法需要認證
router.get('/', eventController.getAllEvents)
router.get('/search', eventController.searchEvents)
router.get('/me', requireAuth, eventController.getMyEvents)
// 獲取特定事件的訂單列表
router.get('/:eventId/orders', requireAuth, eventController.getEventOrders)
// SEO-friendly route: /events/:categorySlug/:eventSlug
router.get('/:categorySlug/:eventSlug', eventController.getEventBySlug)
router.get('/:id', eventController.getEventById)
router.post('/', requireAuth, eventController.createEvent)
router.put('/:id', requireAuth, eventController.updateEvent)
router.delete('/:id', requireAuth, eventController.deleteEvent)

// 上傳 event_img 圖片
router.post('/upload-event-img', requireAuth, upload.single('event_img'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const url = `/uploads/event_imgs/${req.file.filename}`
  res.json({ url })
})

export default router 