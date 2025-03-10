import { FastifyReply, FastifyRequest } from 'fastify';
import { UniqueViolationError } from 'objection';
import Order from '../../models/Order';

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
    console.log({ customer_id, items })
}