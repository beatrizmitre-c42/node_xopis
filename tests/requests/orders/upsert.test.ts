import 'tests/setup';
import server from 'src/server';
import { LightMyRequestResponse } from 'fastify';
import Order from "../../../src/models/Order";
import Product from "../../../src/models/Product";
import User from "../../../src/models/User";
import { CreateOrderBodyType } from 'src/models/types'

describe('CREATE action', () => {
    const validInput: CreateOrderBodyType = {
        customer_id: 1,
        items: [
            {
                product_id: 1,
                quantity: 2,
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

            const jsonResponse = response.json<Order>();
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

            const jsonResponse = response.json<Order>();
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

        it('calculates order value correctly', async () => {

            const inputWith2Products = {
                customer_id: 1,
                items: [
                    {
                        product_id: 1,
                        quantity: 2,
                    },
                    {
                        product_id: 2,
                        quantity: 4,
                        discount: 3.49
                    },
                ]
            }
            const response = await makeRequest(inputWith2Products);
            const jsonResponse = response.json<Order>();

            const expectedProduct1Price = 2.99 * 2
            const expectedProduct2Price = 4.50 * 4 - 3.49
            console.log(jsonResponse);
            expect(jsonResponse.total_paid).toEqual(expectedProduct1Price + expectedProduct2Price);
        });
    });

    const userInput = { name: 'John Doe', email: 'john.doe@email.com' };
    const productInput1 = {
        name: 'Beach Ball',
        sku: 'BCHBLL',
        description: 'A fun and colorful beach ball.',
        price: 2.99,
        stock: 100,
    };

    const productInput2 = {
        name: 'Umbrella',
        sku: 'UMBRLL',
        description: 'A fun and colorful umbrella.',
        price: 4.50,
        stock: 100,
    };

    const makeRequest = async (input: Partial<CreateOrderBodyType>) => {
        await User.query().insert(userInput);
        await Product.query().insert(productInput1);
        await Product.query().insert(productInput2);

        console.log(input)
        return await server.inject({
            method: 'POST',
            url: '/orders',
            body: input,
        });
    }
})

describe('UPDATE action', () => {
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

        it('changes order status', async () => {

            const response = await makeRequest(input);
            const orderInfo = await response.json()

            const upsertInput = {
                id: orderInfo.id,
                customer_id: orderInfo.customer_id,
                status: 'approved',
                items: orderInfo.items,
            }
            const upsertResponse = await server.inject({
                method: 'POST',
                url: '/orders',
                body: upsertInput,
            });
            const parsedUpsertResponse = await upsertResponse.json();
            expect(parsedUpsertResponse.status).toEqual('approved')
            expect(parsedUpsertResponse.id).toEqual(orderInfo.id)
        });

        it('removes order items', async () => {

            const response = await makeRequest(input);
            const orderInfo = await response.json()

            const upsertInput = {
                id: orderInfo.id,
                customer_id: orderInfo.customer_id,
                status: 'approved',
                items: [],
            }
            const upsertResponse = await server.inject({
                method: 'POST',
                url: '/orders',
                body: upsertInput,
            });
            const parsedUpsertResponse = await upsertResponse.json();
            expect(parsedUpsertResponse.items).toEqual([])
            expect(parsedUpsertResponse.id).toEqual(orderInfo.id)
        });
    });

    const userInput = { name: 'John Doe', email: 'john.doe@email.com' };
    const productInput1 = {
        name: 'Beach Ball',
        sku: 'BCHBLL',
        description: 'A fun and colorful beach ball.',
        price: 2.99,
        stock: 100,
    };

    const productInput2 = {
        name: 'Umbrella',
        sku: 'UMBRLL',
        description: 'A fun and colorful umbrella.',
        price: 4.50,
        stock: 100,
    };

    const makeRequest = async (input: Partial<CreateOrderBodyType>) => {

        await User.query().insert(userInput);
        await Product.query().insert(productInput1);
        await Product.query().insert(productInput2);

        return await server.inject({
            method: 'POST',
            url: '/orders',
            body: input,
        });
    }
})