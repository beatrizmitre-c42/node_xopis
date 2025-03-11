import { FastifyReply, FastifyRequest } from 'fastify';
import OrderService from "../../services/orderService";
import insertOrderWithItems from "../../services/queries/insertOrderWithItems"
import { OrderType } from '../../models/types'

type Request = FastifyRequest<{
    Body: OrderType
}>;

export default async (
    { body: { customer_id, items } }: Request,
    reply: FastifyReply
) => {
    const orderService = new OrderService({ customer_id, items })
    const orderData = await orderService.calculateOrderValue();
    const orderWithItems = await insertOrderWithItems(orderData)
    return reply.code(201).send(orderWithItems);
}