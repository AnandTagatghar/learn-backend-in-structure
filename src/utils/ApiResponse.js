class ApiResonse {
  constructor(statusCode, message="success", data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.status = statusCode < 400;
  }
}

export { ApiResonse };
