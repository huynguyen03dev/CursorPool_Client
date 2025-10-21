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
const { sendEmailCodeLimiter, authLimiter } = require('../middleware/rateLimiter')

router.post('/checkUser', authLimiter, validateEmailMiddleware, checkUser)
router.post('/register/sendEmailCode', sendEmailCodeLimiter, validateEmailMiddleware, sendEmailCode)
router.post('/emailRegister', authLimiter, validateRegistrationMiddleware, register)
router.post('/login', authLimiter, login)
router.post('/emailResetPassword', authLimiter, resetPassword)

module.exports = router
