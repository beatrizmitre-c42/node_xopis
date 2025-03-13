export enum OrderErrorCodes {
    CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
    PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
    REPEATED_PRODUCTS = 'REPEATED_PRODUCTS',
    CANT_MODIFY_ORDER = 'CANT_MODIFY_ORDER',
}

export default class OrderError extends Error {
    code: string;

    constructor(code: OrderErrorCodes, message: string) {
        super(message);
        this.code = code;
    }
}