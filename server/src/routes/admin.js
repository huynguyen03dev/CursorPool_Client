const express = require('express')
const router = express.Router()
const {
  authenticateAdmin,
  createAccount,
  createActivationCode,
} = require('../controllers/adminController')

// POST /api/admin/create-account - Create a new account in the pool
router.post('/create-account', authenticateAdmin, createAccount)

// POST /api/admin/create-activation-code - Create a new activation code
router.post('/create-activation-code', authenticateAdmin, createActivationCode)

module.exports = router
