const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { getAccount } = require('../controllers/accountPoolController')

router.get('/get', authenticate, getAccount)

module.exports = router
