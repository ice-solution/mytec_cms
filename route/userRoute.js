import express from 'express'
import userController from '../controllers/userController.js'
import multer from 'multer'
import path from 'path'

const router = express.Router()

// Multer 設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars')
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

router.get('/', userController.getAllUsers)
router.get('/profile', userController.getProfile)
router.get('/:id', userController.getUserById)
router.post('/', userController.createUser)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)

// 上傳 avatar 圖片
router.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const url = `/uploads/avatars/${req.file.filename}`
  res.json({ url })
})

// 前台註冊
router.post('/auth/register', userController.registerUser)
// 登入
router.post('/login', userController.loginUser)
// 登出
router.post('/logout', userController.logoutUser)

// 收藏活動
router.post('/favourites/:event_id', userController.addFavourite)
// 取消收藏活動
router.delete('/favourites/:event_id', userController.removeFavourite)

export default router 