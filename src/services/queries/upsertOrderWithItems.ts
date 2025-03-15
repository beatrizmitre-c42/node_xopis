import {transaction} from "objection";
import Order from "../../models/Order";
import '../../db'
import { OrderToUpsert } from 'src/services/orderService'

export default async (orderData: Order | OrderToUpsert) => {
    return await transaction(Order, async (Order, knex) => {
        return await Order.query().upsertGraphAndFetch(orderData, { insertMissing: true, update: true })
    })
};