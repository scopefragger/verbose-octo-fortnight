export class AppError extends Error {
  constructor(code, userMessage, { isRetryable = false } = {}) {
    super(userMessage);
    this.code = code;
    this.userMessage = userMessage;
    this.isRetryable = isRetryable;
  }
}
