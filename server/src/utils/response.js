class ApiResponse {
  static success(data = null, msg = 'Success', code = '0') {
    return {
      status: 200,
      msg,
      data,
      code,
    }
  }

  static error(msg = 'Error', code = '-1', status = 400) {
    return {
      status,
      msg,
      data: null,
      code,
    }
  }

  static unauthorized(msg = 'Unauthorized', code = 'UNAUTHORIZED') {
    return {
      status: 401,
      msg,
      data: null,
      code,
    }
  }

  static forbidden(msg = 'Forbidden', code = 'FORBIDDEN') {
    return {
      status: 403,
      msg,
      data: null,
      code,
    }
  }

  static notFound(msg = 'Not Found', code = 'NOT_FOUND') {
    return {
      status: 404,
      msg,
      data: null,
      code,
    }
  }

  static validationError(msg = 'Validation Error', code = 'VALIDATION_ERROR') {
    return {
      status: 400,
      msg,
      data: null,
      code,
    }
  }
}

function sendSuccess(res, data = null, msg = 'Success', code = '0') {
  return res.status(200).json(ApiResponse.success(data, msg, code))
}

function sendError(res, msg = 'Error', statusCode = 400, code = '-1') {
  return res.status(statusCode).json(ApiResponse.error(msg, code, statusCode))
}

module.exports = {
  ApiResponse,
  sendSuccess,
  sendError,
}
