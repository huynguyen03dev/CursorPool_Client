const { verifyToken } = require('../services/tokenService')
const { sendError } = require('../utils/response')

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401)
    }

    const token = authHeader.substring(7)

    const decoded = verifyToken(token)

    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      level: decoded.level,
    }

    next()
  } catch (error) {
    return sendError(res, error.message || 'Invalid token', 401)
  }
}

module.exports = {
  authenticate,
}
