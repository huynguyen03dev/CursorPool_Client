function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password) {
  return password && password.length >= 6
}

function validateUsername(username) {
  return username && username.length >= 3 && username.length <= 20
}

function validateEmailMiddleware(req, res, next) {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      status: false,
      msg: 'Email is required',
      code: 400,
    })
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      status: false,
      msg: 'Invalid email format',
      code: 400,
    })
  }

  next()
}

function validateRegistrationMiddleware(req, res, next) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      status: false,
      msg: 'Email and password are required',
      code: 400,
    })
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      status: false,
      msg: 'Invalid email format',
      code: 400,
    })
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      status: false,
      msg: 'Password must be at least 6 characters',
      code: 400,
    })
  }

  next()
}

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateEmailMiddleware,
  validateRegistrationMiddleware,
}
