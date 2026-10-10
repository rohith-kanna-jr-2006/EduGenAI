/**
 * EduGenAI - Centralized Error Handling Middleware
 * 
 * Intercepts unhandled errors, formats consistent JSON responses,
 * and handles model service unavailability cleanly without fake claims.
 */

function errorHandler(err, req, res, next) {
  console.error(`[Error] [${req.method} ${req.url}] ${err.name}: ${err.message}`);

  // Handle invalid JSON body syntax
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON_BODY',
        message: 'Malformed JSON payload provided in request body.'
      }
    });
  }

  // Handle Model Service Error (e.g. SDXL Colab offline, connection refused, timeout)
  if (err.name === 'ModelServiceError') {
    return res.status(err.statusCode || 503).json({
      success: false,
      error: {
        code: 'MODEL_SERVICE_UNAVAILABLE',
        message: err.message,
        details: err.details || undefined
      }
    });
  }

  // Generic internal server error
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const responseError = {
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected internal error occurred on the server.'
  };

  if (process.env.NODE_ENV === 'development') {
    responseError.stack = err.stack;
  }

  return res.status(statusCode).json({
    success: false,
    error: responseError
  });
}

// 404 Handler for unmatched routes
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist on this backend.`
    }
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
