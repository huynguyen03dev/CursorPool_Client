const db = require('../config/database')

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendVerificationCode(email, type = 'register') {
  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await db.run(
    `INSERT INTO email_verification_codes (email, code, type, expires_at, used, created_at)
     VALUES (?, ?, ?, ?, 0, datetime('now'))`,
    [email, code, type, expiresAt.toISOString()],
  )

  console.log(`[EMAIL] Verification code for ${email} (${type}): ${code}`)
  console.log(`[EMAIL] Code expires at: ${expiresAt.toISOString()}`)

  return code
}

async function verifyCode(email, code, type) {
  const row = await db.get(
    `SELECT * FROM email_verification_codes 
     WHERE email = ? AND code = ? AND type = ? AND used = 0 
     ORDER BY created_at DESC LIMIT 1`,
    [email, code, type],
  )

  if (!row) {
    return { valid: false, error: 'Invalid or expired verification code' }
  }

  const expiresAt = new Date(row.expires_at)
  if (expiresAt < new Date()) {
    return { valid: false, error: 'Verification code has expired' }
  }

  await db.run(`UPDATE email_verification_codes SET used = 1 WHERE id = ?`, [row.id])

  return { valid: true }
}

module.exports = {
  generateVerificationCode,
  sendVerificationCode,
  verifyCode,
}
