import {OrderWithItemsType} from "src/models/types";

export default (order: OrderWithItemsType) => {
    return {
        id: order.id,
        customer_id: order.customer_id,
        total_paid: order.total_paid,
        total_discount: order.total_discount,
        status: order.status,
        items: order.items.map((item) => { return { product_id: item.product_id, quantity: item.quantity, discount: item.discount } })
    }
}