import Product from '../models/Product';
import User from '../models/User';
import OrderError, { OrderErrorCodes } from "../errors/orderError";
import { CreateOrderBodyType, OrderWithItemsType } from 'src/models/types'

export default class OrderService {
    orderData: CreateOrderBodyType

    constructor (orderData: CreateOrderBodyType) {
        this.orderData = orderData;
    }
    async calculateOrderValue():Promise<OrderWithItemsType> {
        const customer = await User.query().findById(this.orderData.customer_id);
        if (customer) {
            const itemsWithPrice = await Promise.all(this.orderData.items.map(async (item) => {
                const product = await Product.query().where('id', item.product_id).first();
                if (product) {
                    return {
                        product_id: item.product_id,
                        quantity: item.quantity,
                        tax: 0,
                        shipping: 0,
                        paid: item.quantity * product.price - item.discount,
                        discount: item.discount
                    };
                }
                else throw new OrderError(OrderErrorCodes.PRODUCT_NOT_FOUND, `Product with id ${item.product_id} not found`);
            }))

            const totalOrderValue = itemsWithPrice.reduce((acc, itemWithPrice) => acc + itemWithPrice.paid, 0)
            const totalDiscount = itemsWithPrice.reduce((acc, itemWithPrice) => acc + itemWithPrice.discount, 0)

            return {
                customer_id: this.orderData.customer_id,
                status: 'payment_pending',
                total_tax: 0,
                total_shipping: 0,
                total_discount: totalDiscount,
                total_paid: totalOrderValue,
                items: itemsWithPrice,
            };
        }
        else {
            throw new OrderError(OrderErrorCodes.CUSTOMER_NOT_FOUND, `Customer with id ${this.orderData.customer_id} not found`);
        }
    }
}