import 'tests/setup';
import server from 'src/server';
import { LightMyRequestResponse } from 'fastify';
import Order from "../../../src/models/Order";
import { CreateOrderBodyType, OrderWithItemsType } from 'src/models/types'

describe('CREATE action', () => {
    const validInput: CreateOrderBodyType = {
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
            const numberOfRecordsBefore = await Order.query().select('*').resultSize();

            const response = await makeRequest(input);

            const numberOfRecordsAfter = await Order.query().select('*').resultSize();

            expect(numberOfRecordsAfter).toBe(numberOfRecordsBefore + 1);
        });

        it('returns the created order', async () => {
            const response = await makeRequest(input);

            const jsonResponse = response.json<OrderWithItemsType>();
            expect(jsonResponse).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    customer_id: input.customer_id,
                    total_paid: expect.any(Number),
                    total_discount: expect.any(Number),
                    status: expect.any(String),
                    items: expect.any(Array)
                })
            );
            expect(jsonResponse.items).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        discount: expect.any(Number),
                        product_id: expect.any(Number),
                        quantity: expect.any(Number),
                    })
                ])
            )
        });
    });

    describe('when the input is valid', () => {
        const input = validInput;

        it('is successful', async () => {

            const response = await makeRequest(input);
            expect(response.statusCode).toBe(201);
        });

        it('creates a new record', async () => {
            const numberOfRecordsBefore = await Order.query().select('*').resultSize();

            const response = await makeRequest(input);

            const numberOfRecordsAfter = await Order.query().select('*').resultSize();

            expect(numberOfRecordsAfter).toBe(numberOfRecordsBefore + 1);
        });

        it('returns the created order', async () => {
            const response = await makeRequest(input);

            const jsonResponse = response.json<OrderWithItemsType>();
            expect(jsonResponse).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    customer_id: input.customer_id,
                    total_paid: expect.any(Number),
                    total_discount: expect.any(Number),
                    status: expect.any(String),
                    items: expect.any(Array)
                })
            );
            expect(jsonResponse.items).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        discount: expect.any(Number),
                        product_id: expect.any(Number),
                        quantity: expect.any(Number),
                    })
                ])
            )
        });
    });

    const makeRequest = async (input: Partial<CreateOrderBodyType>) => {
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
})