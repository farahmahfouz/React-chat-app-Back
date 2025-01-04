class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode || 500; // Default to 500 if not provided
      this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
module.exports = AppError;