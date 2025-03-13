import {transaction} from "objection";
import Order from "../../models/Order";
import '../../db'

export default async (orderData: Order) => {
    return await transaction(Order, async (Order, knex) => {
        return await Order.query().upsertGraphAndFetch(orderData, { insertMissing: true, update: true })
    })
}