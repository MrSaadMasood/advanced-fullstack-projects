
export class BadRequest extends Error {
    private static readonly _statusCode = 404
    private readonly _code : number

    constructor(context? : { message : string, statusCode? : number}) {
        const { message , statusCode } = context || {}
        super(message || "Bad Request")
        this._code = statusCode || BadRequest._statusCode  
    }

    getStatusCode () {
        return this._code
    }

    getErrorMessage () {
        return this.message
    }
}
