import 'tests/setup';
import server from 'src/server';
import { LightMyRequestResponse } from 'fastify';
import Order from "../../../src/models/Order";
import User from "../../../src/models/User";
import { OrderType } from 'src/models/types'

describe('CREATE action', () => {
    const validInput: OrderType = {
        customer_id: 1,
        items: [
            {
                product_id: 1,
                quantity: 2,
                discount: 1
            }
        ]
    }

    describe('when the input is valid', () => {
        const input = validInput;

        it('is successful', async () => {

            const response = await makeRequest(input);
            expect(response.statusCode).toBe(201);
        });

        it('creates a new record', async () => {
            await assertCount({customer_id: 1,
                orders_items: [
                    {
                        product_id: 1,
                        quantity: 2,
                        discount: 1
                    }
                ]}, { changedBy: 1 });
        });

        // it('returns the created user', async () => {
        //     const response = await makeRequest(input);
        //
        //     const jsonResponse = response.json<Product>();
        //     expect(jsonResponse).toEqual(
        //         expect.objectContaining({
        //             id: expect.any(Number),
        //             customer_id: input.customer_id,
        //             total_paid: expect.any(Number),
        //             total_discount: expect.any(Number),
        //             status: expect.any(String),
        //             items: expect.arrayContaining({
        //                 product_id: expect.any(Number),
        //                 quantity: expect.any(Number),
        //                 discount: expect.any(Number)
        //             })
        //         })
        //     );
        // });
    });

    const makeRequest = async (input: Partial<OrderType>) => {
        const userInput = { name: 'John Doe', email: 'john.doe@email.com' };
        const productInput = {
            name: 'Beach Ball',
            sku: 'BCHBLL',
            description: 'A fun and colorful beach ball.',
            price: 2.99,
            stock: 100,
        };

        await server.inject({
            method: 'POST',
            url: '/users',
            body: userInput,
        });
        await server.inject({
            method: 'POST',
            url: '/products',
            body: productInput,
        });

        return await server.inject({
            method: 'POST',
            url: '/orders',
            body: input,
        });
    }

    type OrderItemType = {
        product_id: number;
        quantity: number;
        discount: number;
    };
    type OrderWithItemsType = {
        customer_id: number,
        orders_items: OrderItemType[]
    }

    const countRecords = async (input: Partial<OrderWithItemsType>) =>
        Order.query().where(input).resultSize();


    const assertCount = async (input: OrderWithItemsType, { changedBy }: { changedBy: number }) => {
        const initialCount = await countRecords({customer_id: 1});

        await makeRequest(input);

        const finalCount = await countRecords(input);

        expect(finalCount).toBe(initialCount + changedBy);
    };

    const assertBadRequest = async (response: LightMyRequestResponse, message: RegExp | string) => {
        const json_response = response.json<{ message: string }>();
        expect(response.statusCode).toBe(400);
        expect(json_response.message).toMatch(message);
    };
})