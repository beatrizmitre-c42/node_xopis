import { FastifyReply, FastifyRequest } from 'fastify';
import OrderService from "../../services/orderService";
import Order from "src/models/Order";
import { UpsertOrderBodyType } from 'src/models/types'
import buildCreateOrderResponseJson from "src/services/buildCreateOrderResponseJson";
import upsertOrderWithItems from "src/services/queries/upsertOrderWithItems";
import {OrderToUpsert} from "../../services/orderService";

type Request = FastifyRequest<{
    Body: UpsertOrderBodyType
}>;

export default async (
    { body: { id, customer_id, status, items } }: Request,
    reply: FastifyReply
) => {
    const orderService = new OrderService({ id, customer_id, status, items })
    const orderData = await orderService.calculateOrderValue();
    const createdOrderWithItems:(OrderToUpsert | Order) = await upsertOrderWithItems(orderData)
    const responseBody = buildCreateOrderResponseJson(createdOrderWithItems)
    return reply.code(201).send(responseBody);
}