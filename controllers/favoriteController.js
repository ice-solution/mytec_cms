import User from '../model/User.js'
import Event from '../model/Event.js'

const favoriteController = {
  // 檢查用戶是否已收藏特定活動
  checkFavorite: async (req, res) => {
    try {
      const { eventId } = req.params
      const userId = req.user.id

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const isFavorited = user.userFavourites.includes(eventId)
      
      res.json({
        isFavorited,
        eventId
      })
    } catch (err) {
      console.error('Error in checkFavorite:', err)
      res.status(400).json({ error: err.message })
    }
  },

  // 添加收藏
  addFavorite: async (req, res) => {
    try {
      const { eventId } = req.params
      const userId = req.user.id

      // 檢查活動是否存在
      const event = await Event.findById(eventId)
      if (!event) {
        return res.status(404).json({ error: 'Event not found' })
      }

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // 檢查是否已經收藏
      if (user.userFavourites.includes(eventId)) {
        return res.status(400).json({ 
          error: 'Event already favorited',
          isFavorited: true
        })
      }

      // 添加收藏
      user.userFavourites.push(eventId)
      await user.save()

      res.json({
        success: true,
        message: 'Event added to favorites',
        isFavorited: true,
        eventId
      })
    } catch (err) {
      console.error('Error in addFavorite:', err)
      res.status(400).json({ error: err.message })
    }
  },

  // 取消收藏
  removeFavorite: async (req, res) => {
    try {
      const { eventId } = req.params
      const userId = req.user.id

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // 檢查是否已經收藏
      if (!user.userFavourites.includes(eventId)) {
        return res.status(400).json({ 
          error: 'Event not in favorites',
          isFavorited: false
        })
      }

      // 移除收藏
      user.userFavourites = user.userFavourites.filter(
        id => id.toString() !== eventId
      )
      await user.save()

      res.json({
        success: true,
        message: 'Event removed from favorites',
        isFavorited: false,
        eventId
      })
    } catch (err) {
      console.error('Error in removeFavorite:', err)
      res.status(400).json({ error: err.message })
    }
  },

  // 獲取用戶的所有收藏活動
  getUserFavorites: async (req, res) => {
    try {
      const userId = req.user.id

      const user = await User.findById(userId)
        .populate({
          path: 'userFavourites',
          populate: {
            path: 'owner',
            select: 'first_name last_name email avatar'
          }
        })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json({
        favorites: user.userFavourites,
        count: user.userFavourites.length
      })
    } catch (err) {
      console.error('Error in getUserFavorites:', err)
      res.status(400).json({ error: err.message })
    }
  }
}

export default favoriteController
