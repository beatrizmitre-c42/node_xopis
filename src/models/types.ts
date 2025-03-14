import Order from "../models/Order";
import OrderItem from "../models/OrderItem";

export type CreateOrderBodyType = {
    customer_id: number,
    items: Partial<OrderItem>[]
}
export type UpsertOrderBodyType = Partial<Pick<Order, 'customer_id' | 'id' | 'status' | 'items'>>
