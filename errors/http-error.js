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
}

module.exports = HttpError;
