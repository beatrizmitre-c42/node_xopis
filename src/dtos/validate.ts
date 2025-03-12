import { z } from "zod"
import { FastifyReply, FastifyRequest } from "fastify";


export function validate(schema: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>) {
    return async function (req: FastifyRequest) {
        await schema.parseAsync(req.body)
    }
}