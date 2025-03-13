import Order from "../models/Order";

export type CreateOrderBodyType = Pick<Order, 'customer_id' | 'items'>
export type UpsertOrderBodyType = Partial<Pick<Order, 'customer_id' | 'id' | 'status' | 'items'>>
