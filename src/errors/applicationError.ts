export enum ErrorCodes {
    BAD_REQUEST = "BAD_REQUEST",
    NOT_FOUND = "NOT_FOUND",
}

export default class ApplicationError extends Error {
    code: string;

    constructor(code: ErrorCodes, message: string) {
        super(message);
        this.code = code;
    }
}