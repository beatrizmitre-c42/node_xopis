import { FastifyInstance } from 'fastify';
import orderCreate from '../actions/orders/create';

export default async function userRoutes(server: FastifyInstance) {
  server.post('/', orderCreate);
}
