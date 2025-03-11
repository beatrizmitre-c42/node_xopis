import { FastifyReply, FastifyRequest } from 'fastify';
import { UniqueViolationError } from 'objection';
import Order from '../../models/Order';
import Product from '../../models/Product';
import OrderService from "../../services/orderService";
import insertOrderWithItems from "../../services/queries/insertOrderWithItems"

type Request = FastifyRequest<{
    Body: {
        customer_id: number;
        items: OrderItem[];
    };
}>;

type OrderItem = {
    product_id: number;
    quantity: number;
    discount: number;
};

export default async (
    { body: { customer_id, items } }: Request,
    reply: FastifyReply
) => {
    console.log({ body: { customer_id, items } })
    const orderService = new OrderService({ customer_id, items })
    const orderData = await orderService.calculateOrderValue();
    const orderWithItems = await insertOrderWithItems(orderData)
    return reply.code(201).send(orderWithItems);
}