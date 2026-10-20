/**
 * Centralized Express error handling middleware.
 * Maps MySQL and server errors to consistent JSON responses.
 *
 * Mappings:
 * - SQLSTATE 45000 -> HTTP 400: { "error": "message from MySQL" }
 * - ER_DUP_ENTRY   -> HTTP 409: { "error": "Duplicate entry" }
 * - Unknown errors -> HTTP 500: { "error": "Internal Server Error" }
 */
const errorHandler = (err, req, res, next) => {
  // SQLSTATE 45000 -> HTTP 400 with MySQL message
  if (err.sqlState === '45000' || err.errno === 1644) {
    return res.status(400).json({ error: err.message });
  }

  // ER_DUP_ENTRY -> HTTP 409 with "Duplicate entry"
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  // Operational client errors with statusCode (e.g. 400, 404)
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Log unexpected internal errors
  console.error('Unhandled Internal Error:', err);

  // Unknown errors -> HTTP 500
  return res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = errorHandler;
