import express from 'express'
import memberCardController from '../controllers/memberCardController.js'

const router = express.Router()

router.get('/', memberCardController.getAllMemberCards)
router.get('/:id', memberCardController.getMemberCardById)
router.post('/', memberCardController.createMemberCard)
router.put('/:id', memberCardController.updateMemberCard)
router.delete('/:id', memberCardController.deleteMemberCard)

export default router 