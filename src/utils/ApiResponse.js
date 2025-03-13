class ApiResponse {
  /**
   * 
   * @param {number} statusCode 
   * @param {string} message 
   * @param {object} data 
   */
  constructor(statusCode, message="success", data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.status = statusCode < 400;
  }
}

export { ApiResponse };
