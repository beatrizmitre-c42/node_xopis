import { z } from "zod";

export const OrderSchema = z.object({
    customer_id: z.number().int().positive(),
    items: z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
        discount: z.number().nonnegative()
    }).array()
})