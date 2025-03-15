import { FastifyInstance } from 'fastify';
import orderUpsert from '../actions/orders/upsert';
import { validate } from '../dtos/validate'
import { OrderSchema } from "src/models/ZodSchemas";

export default async function orderRoutes(server: FastifyInstance) {
  server.post('/', { preHandler: validate(OrderSchema), handler: orderUpsert });
}