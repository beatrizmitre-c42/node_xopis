export type OrderWithItemsType = {
    id?: number;
    total_paid: number;
    total_discount: number;
    status: string;
    customer_id: number;
    total_tax?: 0,
    total_shipping?: 0,
    items: OrderItemType[];
    created_at?: Date;
    updated_at?: Date;
}

export type OrderItemType = {
    product_id: number;
    quantity: number;
    discount: number;
}

export type CreateOrderBodyType = Pick<OrderWithItemsType, 'customer_id' | 'items'>