import {transaction} from "objection";
import Order from "../../models/Order";
import '../../db'
import { CreateOrderBodyType } from 'src/models/types'

export default async (orderData: CreateOrderBodyType) => {
    return await transaction(Order, async (Order, knex) => {
        return await Order.query().insertGraphAndFetch(orderData)
    })
}