export class BadRequest extends Error {
    constructor(context) {
        const { message, statusCode } = context || {};
        super(message || "Bad Request");
        this._code = statusCode || BadRequest._statusCode;
    }
    getStatusCode() {
        return this._code;
    }
    getErrorMessage() {
        return this.message;
    }
}
BadRequest._statusCode = 404;
