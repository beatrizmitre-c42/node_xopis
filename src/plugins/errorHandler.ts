import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import ApplicationError, { ErrorCodes } from '../errors/applicationError'
import { ZodError } from "zod";
import OrderError, { ErrorCodes } from '../errors/orderError'


export const errorHandler = (
    error: FastifyError,
    _req: FastifyRequest,
    reply: FastifyReply
) => {
    if (error instanceof ApplicationError) {
        if (error.code === ErrorCodes.BAD_REQUEST) {
            return reply.code(400).send({
                error: "Bad Request",
                message: error.message,
            });
        }

        if (error.code === ErrorCodes.NOT_FOUND) {
            return reply.code(404).send({
                error: "Not Found",
                message: error.message,
            });
        }
    }

    if (error instanceof OrderError) {
        return reply.code(400).send({
            error: error.code,
            message: error.message
        })
    }

    if (error instanceof ZodError) {
        return reply.code(400).send({
            error: "Bad Request",
            message: "Validation failed",
            details: error.issues.map((issue) => {
                return { field: issue.path.join(`, `), message: issue.message };
            })
        })
    }

    return reply.status(500).send({
        error: "Internal Server Error",
        message: "Internal Server Error",
    });
};

