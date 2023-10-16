import { createRoute } from '@hono/zod-openapi';
import * as schemas from './schemas';



export const indexRoute = createRoute({
    method: 'get',
    path: '/',
    responses: {
        200: {
            description: 'Index page banner.',
        },
    },
});


export const TotalSupplyQueryRoute = createRoute({
    method: 'get',
    path: '/supply',
    request: {
        query: schemas.SupplySchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: schemas.SupplyResponseSchema,
                },
            },
            description: 'Get the total supply of an ERC20 contract',
        },
    },
});


export const ContractQueryRoute = createRoute({
    method: 'get',
    path: '/contract',
    request: {
        query: schemas.ContractSchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: schemas.ContractResponseSchema,
                },
            },
            description: 'Get the ERC20 contract information',
        },
    },
});


export const BalanceQueryRoute = createRoute({
    method: 'get',
    path: '/balance',
    request: {
        query: schemas.BalanceSchema,
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: schemas.BalanceResponseSchema,
                },
            },
            description: 'Get the ERC20 contract information',
        },
    },
});