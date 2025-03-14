import Product from '../models/Product';
import User from '../models/User';
import OrderError, {OrderErrorCodes} from "../errors/orderError";
import {UpsertOrderBodyType} from 'src/models/types'
import Order, {OrderStatus} from "src/models/Order";
import OrderItem from "src/models/OrderItem";

type OrderItemToBuildJson = {
    id?: number
    order_id?: number
    product_id: number
    quantity: number
    tax?: number
    shipping?: number
    discount: number
    paid: number
}

export type OrderToUpsert = {
    customer_id?: number
    status?: OrderStatus | undefined;
    total_tax?: number;
    total_shipping?: number;
    items: (OrderItem | OrderItemToBuildJson)[];
    total_paid: number;
    total_discount: number;
    id?: number | undefined;
}

type OrderValuesToBuildJson = { total_paid: number, total_discount: number }

export default class OrderService {
    orderData: UpsertOrderBodyType

    constructor (orderData: UpsertOrderBodyType) {
        this.orderData = orderData;
    }

    async findOrder() {
        if (this.orderData.id) {
            const order = await Order.query().withGraphFetched('items').where('id', this.orderData.id).first();
            if (order) { return order }
        }
    }

    async findCustomer() {
        if (this.orderData.customer_id) {
            const customer = await User.query().findById(this.orderData.customer_id);
            if (customer) { return customer } else { throw new OrderError(OrderErrorCodes.CUSTOMER_NOT_FOUND, `Customer with id ${this.orderData.customer_id} not found`)}
        }
    }

    async findRequestBodyProducts() {
        if (this.orderData.items && this.orderData.items.length > 0) {
            await this.checkIfRepeatedBodyOrderProducts()
            return await Promise.all(this.orderData.items.map(async (product) => {
                const existingProduct = await Product.query().findById(product.product_id)
                if (existingProduct) {
                    return existingProduct;
                } else { throw new OrderError(OrderErrorCodes.PRODUCT_NOT_FOUND, `Product with id ${product.product_id} not found`) }
            }))
        }
    }

    async checkIfRepeatedBodyOrderProducts() {
        if (this.orderData.items && this.orderData.items.length > 0) {
            const productIds = this.orderData.items.map((item) => item.product_id)
            const uniqueProductIds = [...new Set(productIds)]
            if (uniqueProductIds.length < productIds.length) {
                throw new OrderError(OrderErrorCodes.REPEATED_PRODUCTS, `The order cannot have the same product in different items.`)
            }
        }
    }
    async buildOrderItemsArray():Promise<(OrderItemToBuildJson | OrderItem)[]> {
        const order = await this.findOrder();
        const requestOrderItems = this.orderData.items
        const customer = await this.findCustomer()
        const products = await this.findRequestBodyProducts()

        if (order) {
            if (order.status !== 'payment_pending') throw new OrderError(OrderErrorCodes.CANT_MODIFY_ORDER, `This order can't be modified`)
            const existingOrderItems = order.items

            if (requestOrderItems && products) {
                return requestOrderItems.map((requestOrderItem):OrderItem | OrderItemToBuildJson => {
                    const product = products.find((product) => product.id === requestOrderItem.product_id)
                    const existingOrderItem = existingOrderItems.find((existingOrderItem) => existingOrderItem.product_id === requestOrderItem.product_id)
                    if (product && existingOrderItem) {
                        existingOrderItem.quantity = requestOrderItem.quantity
                        existingOrderItem.discount = requestOrderItem.discount
                        existingOrderItem.paid = existingOrderItem.quantity * product.price - existingOrderItem.discount
                        delete existingOrderItem.updated_at
                        delete existingOrderItem.created_at
                        return {...existingOrderItem}
                    } else if (product) {
                        return {
                            product_id: requestOrderItem.product_id,
                            quantity: requestOrderItem.quantity,
                            tax: 0,
                            shipping: 0,
                            paid: requestOrderItem.quantity * product.price - requestOrderItem.discount,
                            discount: requestOrderItem.discount
                        }
                    }
                    else throw new OrderError(OrderErrorCodes.PRODUCT_NOT_FOUND, `Product not found`)
                })
            }
            else return []
        }
        else if (requestOrderItems && products) {
            return requestOrderItems.map((requestOrderItem) => {
                const product = products.find((product) => product.id === requestOrderItem.product_id)
                if (product) {
                    return {
                        product_id: requestOrderItem.product_id,
                        quantity: requestOrderItem.quantity,
                        tax: 0,
                        shipping: 0,
                        paid: requestOrderItem.quantity * product.price - requestOrderItem.discount,
                        discount: requestOrderItem.discount
                    }
                }
                else throw new OrderError(OrderErrorCodes.PRODUCT_NOT_FOUND, `Product not found`)
            })
        }
        else return []
    }


    calculateTotalOrderValue(items:(OrderItemToBuildJson | OrderItem)[] | undefined) {
        if (items !== undefined) {
            const totalOrderValue = items.reduce((acc, item:(OrderItem | OrderItemToBuildJson)) => acc + item.paid, 0)
            const totalDiscount = items.reduce((acc, item:(OrderItem | OrderItemToBuildJson)) => acc + item.discount, 0)
            return { total_paid: totalOrderValue, total_discount: totalDiscount }
        }
        else {
            return { total_paid: 0, total_discount: 0 }
        }
    }

    async getUpsertOrderStatus() {
        const order = await this.findOrder();
        if (order) {
            return this.orderData.status || order.status;
        }
        else return OrderStatus.PaymentPending
    }

    async buildUpsertOrderJson(orderValues:OrderValuesToBuildJson, items:(OrderItemToBuildJson | OrderItem)[] | undefined) {
        const orderStatus = await this.getUpsertOrderStatus()
        return {
            ...(this.orderData.id && { id : this.orderData.id }),
            ...orderValues,
            customer_id: this.orderData.customer_id,
            status: orderStatus,
            total_tax: 0,
            total_shipping: 0,
            items: items || []
        }
    }

    async calculateOrderValue():Promise<OrderToUpsert | Order> {
        const items:(OrderItemToBuildJson | OrderItem)[] = await this.buildOrderItemsArray()
        const orderValues:OrderValuesToBuildJson = this.calculateTotalOrderValue(items)
        return await this.buildUpsertOrderJson(orderValues, items)
    }
}