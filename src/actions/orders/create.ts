import { FastifyReply, FastifyRequest } from 'fastify';
import OrderService from "../../services/orderService";
import insertOrderWithItems from "../../services/queries/insertOrderWithItems"
import { CreateOrderBodyType } from 'src/models/types'
import { OrderWithItemsType } from 'src/models/types';
import buildCreateOrderResponseJson from "src/services/buildCreateOrderResponseJson";

type Request = FastifyRequest<{
    Body: CreateOrderBodyType
}>;

export default async (
    { body: { customer_id, items } }: Request,
    reply: FastifyReply
) => {
    const orderService = new OrderService({ customer_id, items })
    const orderData = await orderService.calculateOrderValue();
    const createdOrderWithItems = await insertOrderWithItems(orderData)
    const responseBody = buildCreateOrderResponseJson(createdOrderWithItems)
    return reply.code(201).send(responseBody);
}