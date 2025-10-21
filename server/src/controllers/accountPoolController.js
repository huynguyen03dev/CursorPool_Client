const db = require('../config/database')
const { sendSuccess, sendError } = require('../utils/response')

async function getAccount(req, res) {
  try {
    const userId = req.user.id
    const { account: requestedAccount, usage_count } = req.query

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

    if (isExpired) {
      return sendError(res, 'Account expired', 403)
    }

    if (user.used_count >= user.total_count) {
      return sendError(res, 'Quota exceeded', 403)
    }

    let poolAccount
    if (requestedAccount) {
      poolAccount = await db.get('SELECT * FROM accounts_pool WHERE account = ? AND status = 1', [
        requestedAccount,
      ])
    } else {
      poolAccount = await db.get(
        'SELECT * FROM accounts_pool WHERE status = 1 ORDER BY usage_count ASC LIMIT 1',
      )
    }

    if (!poolAccount) {
      return sendError(res, 'No available accounts in pool', 404)
    }

    await db.run('BEGIN TRANSACTION')

    try {
      await db.run(
        'UPDATE accounts_pool SET usage_count = usage_count + 1, distributed_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [poolAccount.id],
      )

      await db.run(
        'UPDATE users SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [userId],
      )

      await db.run('COMMIT')

      const accountInfo = {
        id: poolAccount.id,
        account: poolAccount.account,
        password: poolAccount.password,
        token: poolAccount.token || '',
        usage_count: poolAccount.usage_count + 1,
        status: poolAccount.status,
        create_time: poolAccount.created_at,
        distributed_time: new Date().toISOString(),
        update_time: poolAccount.updated_at,
      }

      return sendSuccess(res, {
        success: true,
        account_info: accountInfo,
        activation_code: null,
      })
    } catch (error) {
      await db.run('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Get account error:', error)
    return sendError(res, 'Failed to get account', 500)
  }
}

module.exports = {
  getAccount,
}
