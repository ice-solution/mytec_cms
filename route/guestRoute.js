import express from 'express'
import guestController from '../controllers/guestController.js'

const router = express.Router()

router.get('/', guestController.getAllGuests)
router.get('/:id', guestController.getGuestById)
router.post('/', guestController.createGuest)
router.put('/:id', guestController.updateGuest)
router.delete('/:id', guestController.deleteGuest)

export default router 