function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not Found" });
}

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  const status = err.statusCode || err.status || 500;

  // Avoid leaking internals in production.
  const message = status >= 500 ? "Internal Server Error" : err.message || "Error";

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" ? { details: err.details || undefined } : null),
  });
}

module.exports = { notFoundHandler, errorHandler };

