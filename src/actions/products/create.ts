import { FastifyReply, FastifyRequest } from 'fastify';
import { UniqueViolationError } from 'objection';
import Product from '../../models/Product';

type Request = FastifyRequest<{
  Body: {
    sku: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
  }
}>;

export default async (
  { body: { sku, name, description, price, stock } }: Request,
  reply: FastifyReply
) =>
  Product.query()
    .insert({ sku, name, description, price, stock })
    .then((product) => reply.code(201).send(product))
    .catch((error) => {
      if (error instanceof UniqueViolationError) {
        if (error.columns.includes('sku')) {
          return reply.code(400).send({ message: 'sku already taken' });
        }
      }
      return reply.send(error);
    });