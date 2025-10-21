const db = require('../config/database')
const { sendSuccess, sendError } = require('../utils/response')

// Simple API key authentication middleware for admin routes
const authenticateAdmin = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key

  if (!apiKey) {
    return sendError(res, 'API key required', 401)
  }

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return sendError(res, 'Invalid API key', 401)
  }

  next()
}

const createAccount = async (req, res) => {
  try {
    const { account, password, token, notes } = req.body

    if (!account || !password) {
      return sendError(res, 'Account and password are required', 400)
    }

    // Check if account already exists
    const existingAccount = await db.get('SELECT id FROM accounts_pool WHERE account = ?', [
      account,
    ])

    if (existingAccount) {
      return sendError(res, 'Account already exists', 409)
    }

    // Insert new account
    const result = await db.run(
      `INSERT INTO accounts_pool (account, password, token, notes, status)
       VALUES (?, ?, ?, ?, 1)`,
      [account, password, token || null, notes || null],
    )

    sendSuccess(res, {
      id: result.lastID,
      account,
      status: 1,
      created_at: new Date().toISOString(),
      message: 'Account created successfully',
    })
  } catch (error) {
    console.error('Create account error:', error)
    sendError(res, 'Failed to create account', 500)
  }
}

const createActivationCode = async (req, res) => {
  try {
    const { code, type, name, level = 0, duration = 0, max_uses = 1, notes } = req.body

    if (!code || !type) {
      return sendError(res, 'Code and type are required', 400)
    }

    // Generate unique code if not provided
    let activationCode = code
    if (!activationCode) {
      // Generate a random 12-character alphanumeric code
      activationCode = Math.random().toString(36).substring(2, 15).toUpperCase()
    }

    // Check if code already exists
    const existingCode = await db.get('SELECT id FROM activation_codes WHERE code = ?', [
      activationCode,
    ])

    if (existingCode) {
      return sendError(res, 'Activation code already exists', 409)
    }

    // Calculate expiry date if duration is provided
    let expired_at = null
    if (duration > 0) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + duration)
      expired_at = expiryDate.toISOString()
    }

    // Insert new activation code
    const result = await db.run(
      `INSERT INTO activation_codes
       (code, type, name, level, duration, max_uses, notes, status, expired_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [activationCode, type, name || null, level, duration, max_uses, notes || null, expired_at],
    )

    sendSuccess(res, {
      id: result.lastID,
      code: activationCode,
      type,
      level,
      duration,
      max_uses,
      status: 1,
      expired_at,
      created_at: new Date().toISOString(),
      message: 'Activation code created successfully',
    })
  } catch (error) {
    console.error('Create activation code error:', error)
    sendError(res, 'Failed to create activation code', 500)
  }
}

module.exports = {
  authenticateAdmin,
  createAccount,
  createActivationCode,
}
