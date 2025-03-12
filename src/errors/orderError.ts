export enum OrderErrorCodes {
    CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
    PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
}

export default class OrderError extends Error {
    code: string;

    constructor(code: OrderErrorCodes, message: string) {
        super(message);
        this.code = code;
    }
}