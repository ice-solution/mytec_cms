import Notification from '../model/Notification.js'

const notificationController = {
  getAllNotifications: async (req, res) => {
    try {
      const notifications = await Notification.find()
      res.json(notifications)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  getNotificationById: async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id)
      if (!notification) return res.status(404).json({ error: 'Notification not found' })
      res.json(notification)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  createNotification: async (req, res) => {
    try {
      const notification = new Notification(req.body)
      await notification.save()
      res.status(201).json(notification)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  updateNotification: async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!notification) return res.status(404).json({ error: 'Notification not found' })
      res.json(notification)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  deleteNotification: async (req, res) => {
    try {
      const notification = await Notification.findByIdAndDelete(req.params.id)
      if (!notification) return res.status(404).json({ error: 'Notification not found' })
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

export default notificationController 