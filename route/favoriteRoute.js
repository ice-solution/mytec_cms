import express from 'express'
import favoriteController from '../controllers/favoriteController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// 檢查用戶是否已收藏特定活動
router.get('/check/:eventId', auth, favoriteController.checkFavorite)

// 添加收藏
router.post('/:eventId', auth, favoriteController.addFavorite)

// 取消收藏
router.delete('/:eventId', auth, favoriteController.removeFavorite)

// 獲取用戶的所有收藏活動
router.get('/', auth, favoriteController.getUserFavorites)

export default router
