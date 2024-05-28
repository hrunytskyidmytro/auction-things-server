class HttpError extends Error {
  constructor(message, errorCode, data) {
    super(message);
    this.code = errorCode;
    this.data = data;
  }

  static badRequest(message, data) {
    return new HttpError(message || "Bad request", 400, data || null);
  }

  static notFound(message, data) {
    return new HttpError(message || "Not found", 404, data || null);
  }

  static forbidden(message, data) {
    return new HttpError(message || "Forbidden", 403, data || null);
  }

  static internalServerError(message, data) {
    return new HttpError(message || "Internal server error", 500, data || null);
  }

  static unauthorized(message, data) {
    return new HttpError(message || "Unauthorized", 401, data || null);
  }

  static conflict(message, data) {
    return new HttpError(message || "Conflict", 409, data || null);
  }
}

module.exports = HttpError;
