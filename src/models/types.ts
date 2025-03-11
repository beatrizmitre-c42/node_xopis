export type OrderItemType = {
    product_id: number;
    quantity: number;
    discount: number;
};

export type OrderType = {
    customer_id: number;
    items: OrderItemType[];
};