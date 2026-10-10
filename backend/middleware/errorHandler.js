/**
 * EcoGen AI - Centralized Error Handling Middleware
 * 
 * Intercepts all unhandled errors, formats consistent JSON responses,
 * and ensures sensitive credentials are never leaked.
 */

function errorHandler(err, req, res, next) {
  // Log server-side diagnostic information
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

  // Handle Missing API Key error
  if (err.name === 'ApiKeyMissingError') {
    return res.status(err.statusCode || 503).json({
      success: false,
      error: {
        code: 'API_KEY_NOT_CONFIGURED',
        provider: err.provider,
        message: err.message,
        guide: err.guide
      }
    });
  }

  // Handle Provider-specific generation failure
  if (err.name === 'GenerationProviderError') {
    return res.status(err.statusCode || 502).json({
      success: false,
      error: {
        code: 'IMAGE_GENERATION_FAILED',
        message: err.message,
        details: err.providerDetails || undefined
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

// 404 Not Found fallback for unmatched routes
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
