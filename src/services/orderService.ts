import Order from '../models/Order';
import Product from '../models/Product';
type OrderItem = {
    product_id: number;
    quantity: number;
    discount: number;
};

type OrderData = {
    customer_id: number;
    items: OrderItem[];
}

export default class OrderService {
    orderData: OrderData

    constructor (orderData: OrderData) {
        this.orderData = orderData;
    }
    async calculateOrderValue() {
        const itemsWithPrice = await Promise.all(this.orderData.items.map(async (item) => {
            const product = await Product.query().where('id', item.product_id).first();
            return { id: item.product_id, quantity: item.quantity, total_value: item.quantity * product.price, discount: item.discount };
        }))
        const totalOrderValue = itemsWithPrice.reduce((acc, itemWithPrice) => acc + itemWithPrice.total_value, 0)
        const totalDiscount = itemsWithPrice.reduce((acc, itemWithPrice) => acc + itemWithPrice.discount, 0)

        return { total_paid: (totalOrderValue - totalDiscount), total_discount: totalDiscount };
    }
}