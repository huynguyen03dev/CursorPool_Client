const express = require('express')
const router = express.Router()
const {
  checkUser,
  sendEmailCode,
  register,
  login,
  resetPassword,
} = require('../controllers/authController')
const {
  validateEmailMiddleware,
  validateRegistrationMiddleware,
} = require('../middleware/validator')

router.post('/check-user', validateEmailMiddleware, checkUser)

router.post('/send-email-code', validateEmailMiddleware, sendEmailCode)

router.post('/register', validateRegistrationMiddleware, register)

router.post('/login', login)

router.post('/reset-password', resetPassword)

module.exports = router
