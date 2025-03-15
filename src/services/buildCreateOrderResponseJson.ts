import Order from "src/models/Order";
import {OrderToUpsert} from "src/services/orderService";

export default (order: Order | OrderToUpsert) => ({
    id: order.id,
    customer_id: order.customer_id,
    total_paid: order.total_paid,
    total_discount: order.total_discount,
    status: order.status,
    ...(order.items && { items: order.items.map(({ product_id, quantity, discount }) => ({ product_id, quantity, discount })) })
});