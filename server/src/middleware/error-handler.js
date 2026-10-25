const { ZodError } = require('zod');

function notFound(req, res) {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: `No route matches ${req.method} ${req.path}.` },
  });
}

function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please check the submitted values.',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
  }

  const status = error.status || 500;
  const body = {
    code: error.code || 'INTERNAL_ERROR',
    message: status === 500 ? 'Something went wrong on the server.' : error.message,
  };
  if (error.details) body.details = error.details;

  if (status === 500 && process.env.NODE_ENV !== 'test') console.error(error);
  return res.status(status).json({ error: body });
}

module.exports = { notFound, errorHandler };

