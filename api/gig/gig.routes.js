const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getGigs, getGigById, addGig, updateGig, removeGig, addGigMsg, removeGigMsg } = require('./gig.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getGigs)
router.get('/:id', getGigById)
router.post('/',requireAuth, addGig)
router.put('/:id', updateGig)
router.delete('/:id', removeGig)
// router.delete('/:id', requireAuth, requireAdmin, removeGig)

router.post('/:id/msg', addGigMsg)
router.delete('/:id/msg/:msgId', removeGigMsg)

module.exports = router