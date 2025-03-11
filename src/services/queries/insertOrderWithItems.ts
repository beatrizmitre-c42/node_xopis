import {transaction} from "objection";
import Order from "../../models/Order";
import '../../db'
import {OrderData} from "src/services/orderService";

export default async (orderData: OrderData) => {
    return await transaction(Order, async (Order, knex) => {
        return await Order.query().insertGraph(orderData)
    })
}