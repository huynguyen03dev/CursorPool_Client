const bcrypt = require('bcrypt')
const db = require('../config/database')
const { sendSuccess, sendError } = require('../utils/response')
const { signToken } = require('../services/tokenService')
const { sendVerificationCode, verifyCode } = require('../services/emailService')

async function checkUser(req, res) {
  try {
    const { email } = req.body

    const user = await db.get('SELECT id FROM users WHERE email = ?', [email])

    return sendSuccess(res, { exists: !!user })
  } catch (error) {
    console.error('Check user error:', error)
    return sendError(res, 'Failed to check user')
  }
}

async function sendEmailCode(req, res) {
  try {
    const { email, type = 'register' } = req.body

    if (type === 'register') {
      const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email])
      if (existingUser) {
        return sendError(res, 'Email already registered', 400)
      }
    } else if (type === 'reset') {
      const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email])
      if (!existingUser) {
        return sendError(res, 'Email not found', 404)
      }
    }

    await sendVerificationCode(email, type)

    return sendSuccess(res, null, 'Verification code sent successfully')
  } catch (error) {
    console.error('Send email code error:', error)
    return sendError(res, 'Failed to send verification code')
  }
}

async function register(req, res) {
  try {
    const { email, username, password, code } = req.body

    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser) {
      return sendError(res, 'Email already registered', 400)
    }

    const existingUsername = await db.get('SELECT id FROM users WHERE username = ?', [username])
    if (existingUsername) {
      return sendError(res, 'Username already taken', 400)
    }

    const verification = await verifyCode(email, code, 'register')
    if (!verification.valid) {
      return sendError(res, verification.error, 400)
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await db.run(
      `INSERT INTO users (email, username, password_hash, level, total_count, used_count, expire_time, created_at, updated_at)
       VALUES (?, ?, ?, 0, 0, 0, datetime('now'), datetime('now'), datetime('now'))`,
      [email, username, passwordHash],
    )

    const userId = result.lastID

    const token = signToken({
      id: userId,
      email,
      username,
      level: 0,
    })

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: userId,
          email,
          username,
          level: 0,
          total_count: 0,
          used_count: 0,
        },
      },
      'Registration successful',
    )
  } catch (error) {
    console.error('Register error:', error)
    return sendError(res, 'Registration failed')
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400)
    }

    const user = await db.get(
      'SELECT id, email, username, password_hash, level, total_count, used_count, expire_time FROM users WHERE email = ?',
      [email],
    )

    if (!user) {
      return sendError(res, 'Invalid email or password', 401)
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401)
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
      level: user.level,
    })

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          level: user.level,
          total_count: user.total_count,
          used_count: user.used_count,
          expire_time: user.expire_time,
        },
      },
      'Login successful',
    )
  } catch (error) {
    console.error('Login error:', error)
    return sendError(res, 'Login failed')
  }
}

async function resetPassword(req, res) {
  try {
    const { email, code, newPassword } = req.body

    if (!email || !code || !newPassword) {
      return sendError(res, 'Email, code, and new password are required', 400)
    }

    if (newPassword.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400)
    }

    const user = await db.get('SELECT id FROM users WHERE email = ?', [email])
    if (!user) {
      return sendError(res, 'Email not found', 404)
    }

    const verification = await verifyCode(email, code, 'reset')
    if (!verification.valid) {
      return sendError(res, verification.error, 400)
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await db.run(
      "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE email = ?",
      [passwordHash, email],
    )

    return sendSuccess(res, null, 'Password reset successful')
  } catch (error) {
    console.error('Reset password error:', error)
    return sendError(res, 'Password reset failed')
  }
}

module.exports = {
  checkUser,
  sendEmailCode,
  register,
  login,
  resetPassword,
}
