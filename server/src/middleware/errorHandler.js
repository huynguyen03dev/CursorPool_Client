const ApiResponse = require('../utils/response')

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString(),
  })

  if (err.name === 'ValidationError') {
    return res.status(400).json(ApiResponse.validationError(err.message, 'VALIDATION_ERROR'))
  }

  if (err.name === 'UnauthorizedError' || err.message === 'Unauthorized') {
    return res.status(401).json(ApiResponse.unauthorized('Authentication required', 'UNAUTHORIZED'))
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.unauthorized('Invalid token', 'INVALID_TOKEN'))
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.unauthorized('Token expired', 'TOKEN_EXPIRED'))
  }

  if (err.status === 404) {
    return res.status(404).json(ApiResponse.notFound('Resource not found', 'NOT_FOUND'))
  }

  const status = err.status || err.statusCode || 500
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message

  res.status(status).json(ApiResponse.error(message, 'INTERNAL_ERROR', status))
}

module.exports = errorHandler
