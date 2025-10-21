const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { getUserInfo, updatePassword, activate } = require('../controllers/userController')

router.get('/', authenticate, getUserInfo)
router.post('/updatePassword', authenticate, updatePassword)
router.post('/activate', authenticate, activate)

module.exports = router
