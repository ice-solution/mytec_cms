import Guest from '../model/Guest.js'

const guestController = {
  getAllGuests: async (req, res) => {
    try {
      const guests = await Guest.find()
      res.json(guests)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  getGuestById: async (req, res) => {
    try {
      const guest = await Guest.findById(req.params.id)
      if (!guest) return res.status(404).json({ error: 'Guest not found' })
      res.json(guest)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  createGuest: async (req, res) => {
    try {
      const guest = new Guest(req.body)
      await guest.save()
      res.status(201).json(guest)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  updateGuest: async (req, res) => {
    try {
      const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!guest) return res.status(404).json({ error: 'Guest not found' })
      res.json(guest)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  deleteGuest: async (req, res) => {
    try {
      const guest = await Guest.findByIdAndDelete(req.params.id)
      if (!guest) return res.status(404).json({ error: 'Guest not found' })
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

export default guestController 