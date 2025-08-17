import MemberCard from '../model/MemberCard.js'

const memberCardController = {
  getAllMemberCards: async (req, res) => {
    try {
      const memberCards = await MemberCard.find()
      res.json(memberCards)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  getMemberCardById: async (req, res) => {
    try {
      const memberCard = await MemberCard.findById(req.params.id)
      if (!memberCard) return res.status(404).json({ error: 'MemberCard not found' })
      res.json(memberCard)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },
  createMemberCard: async (req, res) => {
    try {
      const memberCard = new MemberCard(req.body)
      await memberCard.save()
      res.status(201).json(memberCard)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  updateMemberCard: async (req, res) => {
    try {
      const memberCard = await MemberCard.findByIdAndUpdate(req.params.id, req.body, { new: true })
      if (!memberCard) return res.status(404).json({ error: 'MemberCard not found' })
      res.json(memberCard)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  },
  deleteMemberCard: async (req, res) => {
    try {
      const memberCard = await MemberCard.findByIdAndDelete(req.params.id)
      if (!memberCard) return res.status(404).json({ error: 'MemberCard not found' })
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

export default memberCardController 