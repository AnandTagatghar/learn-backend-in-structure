class ApiResponse {
  /**
   *
   * @param {number} statusCode
   * @param {string} message
   * @param {object} data
   */
  constructor(statusCode, message = "success", data = undefined) {
    this.statusCode = statusCode;
    this.message = message;
    this.status = statusCode < 400;
    this.data = data;
  }
}

export { ApiResponse };
