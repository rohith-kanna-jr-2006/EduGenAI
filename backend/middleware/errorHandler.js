/**
 * EduGenAI - Centralized Error Handling Middleware
 * 
 * Intercepts unhandled errors, formats consistent JSON responses,
 * and adheres to exact status codes:
 * - 400: invalid user input
 * - 429: rate limit exceeded
 * - 502: invalid response or failure from upstream model service
 * - 503: model service unavailable or not configured
 * - 504: upstream model generation timed out
 * - 500: unexpected internal server error
 * 
 * Never leaks stack traces or internal credentials in client responses.
 */

function errorHandler(err, req, res, next) {
  // Server-side diagnostic log: operational status codes (e.g. 401, 402, 429) log as warning
  if (err.statusCode && err.statusCode < 500) {
    console.warn(`[API Notice] [${req.method} ${req.url}] ${err.name || 'Notice'}: ${err.message}`);
  } else {
    console.error(`[Error] [${req.method} ${req.url}] ${err.name || 'Error'}: ${err.message}`);
  }

  // Handle invalid JSON body syntax (HTTP 400)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON_BODY',
        message: 'Malformed JSON payload provided in request body.'
      }
    });
  }

  // Handle OpenRouter Error (HTTP 401, 502, 503, 504)
  if (err.name === 'OpenRouterError') {
    return res.status(err.statusCode || 502).json({
      success: false,
      error: {
        code: err.statusCode === 504 ? 'GATEWAY_TIMEOUT' : err.statusCode === 503 ? 'OPENROUTER_SERVICE_UNAVAILABLE' : err.statusCode === 401 ? 'AUTHENTICATION_REQUIRED' : 'OPENROUTER_ERROR',
        message: err.message,
        statusCode: err.statusCode || 502,
        details: err.details || undefined
      }
    });
  }

  // Handle Model Service Error (HTTP 502, 503, 504)
  if (err.name === 'ModelServiceError') {
    return res.status(err.statusCode || 503).json({
      success: false,
      error: {
        code: err.statusCode === 504 ? 'GATEWAY_TIMEOUT' : err.statusCode === 503 ? 'MODEL_SERVICE_UNAVAILABLE' : 'UPSTREAM_MODEL_ERROR',
        message: err.message,
        details: err.details || undefined
      }
    });
  }

  // Handle CORS Forbidden error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CORS_FORBIDDEN',
        message: err.message
      }
    });
  }

  // Generic internal server error (HTTP 500)
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
