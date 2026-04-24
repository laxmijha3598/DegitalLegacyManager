function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const details = err.details;
  res.status(status).json({
    ok: false,
    error: { message, details }
  });
}

module.exports = { errorHandler };

