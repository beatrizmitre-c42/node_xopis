export enum ApplicationErrorCodes {
    BAD_REQUEST = "BAD_REQUEST",
    NOT_FOUND = "NOT_FOUND",
}

export default class ApplicationError extends Error {
    code: string;

    constructor(code: ApplicationErrorCodes, message: string) {
        super(message);
        this.code = code;
    }
}