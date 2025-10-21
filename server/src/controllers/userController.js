const db = require('../config/database')
const { sendSuccess, sendError } = require('../utils/response')
const bcrypt = require('bcrypt')

async function getUserInfo(req, res) {
  try {
    const userId = req.user.id

    const user = await db.get(
      `SELECT id, email, username, level, total_count, used_count, 
       datetime(expire_time) as expire_time 
       FROM users WHERE id = ?`,
      [userId],
    )

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    const now = new Date()
    const expireTime = user.expire_time ? new Date(user.expire_time) : null
    const isExpired = expireTime ? now > expireTime : true

    const models = [
      {
        numRequests: user.used_count || 0,
        numRequestsTotal: user.total_count || 0,
        numTokens: 0,
        maxRequestUsage: user.total_count || 0,
        maxTokenUsage: 0,
      },
    ]

    return sendSuccess(res, { models })
  } catch (error) {
    console.error('Get user info error:', error)
    return sendError(res, 'Failed to get user info', 500)
  }
}

async function updatePassword(req, res) {
  try {
    const userId = req.user.id
    const { old_password, new_password, confirm_password } = req.body

    if (!old_password || !new_password || !confirm_password) {
      return sendError(res, 'All password fields are required', 400)
    }

    if (new_password !== confirm_password) {
      return sendError(res, 'New passwords do not match', 400)
    }

    if (new_password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400)
    }

    const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [userId])

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    const isValidPassword = await bcrypt.compare(old_password, user.password_hash)

    if (!isValidPassword) {
      return sendError(res, 'Old password is incorrect', 400)
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10)

    await db.run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId],
    )

    return sendSuccess(res, null, 'Password updated successfully')
  } catch (error) {
    console.error('Update password error:', error)
    return sendError(res, 'Failed to update password', 500)
  }
}

async function activate(req, res) {
  try {
    const userId = req.user.id
    const { code } = req.body

    if (!code || code.trim() === '') {
      return sendError(res, 'Activation code is required', 400)
    }

    const activationCode = await db.get(
      'SELECT * FROM activation_codes WHERE code = ? AND status = 1',
      [code.trim()],
    )

    if (!activationCode) {
      return sendError(res, 'Invalid or inactive activation code', 400)
    }

    if (activationCode.used_count >= activationCode.max_uses) {
      return sendError(res, 'Activation code has reached maximum usage', 400)
    }

    if (activationCode.expired_at) {
      const expiredAt = new Date(activationCode.expired_at)
      if (new Date() > expiredAt) {
        return sendError(res, 'Activation code has expired', 400)
      }
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId])

    if (!user) {
      return sendError(res, 'User not found', 404)
    }

    const durationDays = activationCode.duration || 30
    const currentExpire = user.expire_time ? new Date(user.expire_time) : new Date()
    const now = new Date()

    let newExpireTime
    if (currentExpire > now) {
      newExpireTime = new Date(currentExpire.getTime() + durationDays * 24 * 60 * 60 * 1000)
    } else {
      newExpireTime = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
    }

    const newLevel = Math.max(user.level, activationCode.level)
    const quotaToAdd = activationCode.quota || 0
    const newTotalCount = user.total_count + quotaToAdd

    await db.run('BEGIN TRANSACTION')

    try {
      await db.run(
        `UPDATE users 
         SET level = ?, expire_time = ?, total_count = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [newLevel, newExpireTime.toISOString(), newTotalCount, userId],
      )

      await db.run(
        `UPDATE activation_codes 
         SET used_count = used_count + 1, activated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [activationCode.id],
      )

      await db.run('COMMIT')

      return sendSuccess(res, null, 'Account activated successfully')
    } catch (error) {
      await db.run('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Activate error:', error)
    return sendError(res, 'Failed to activate account', 500)
  }
}

module.exports = {
  getUserInfo,
  updatePassword,
  activate,
}
