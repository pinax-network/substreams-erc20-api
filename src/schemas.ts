import { z } from '@hono/zod-openapi';
import { ethers } from 'ethers'

export const SupplySchema = z.object({
    address: z.string().refine((val) => ethers.isAddress(val))
        .openapi({
            param: {
                name: 'address',
                in: 'query',
            },
            example: 'cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0',
        })
    ,
    block: z.coerce.number().optional().openapi({
        param: {
            name: 'block',
            in: 'query',
        },
        example: 1000000,
    })
});
export type SupplySchema = z.infer<typeof SupplySchema>;

export const SupplyResponseSchema = z.object({
    address: z.string()
        .openapi({
            example: 'cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0',
        })
    ,
    supply: z.string().or(z.number())
        .openapi({
            example: '10000000',
        })
    ,
    block: z.number().or(z.string()).openapi({
        example: 1000000,
    }),

    timestamp: z.string().or(z.number())
        .openapi({
            example: '1697483144',
        })
    ,
});
export type SupplyResponseSchema = z.infer<typeof SupplyResponseSchema>;


export const ContractSchema = z.object({
    address: z.string().refine((val) => ethers.isAddress(val))
        .openapi({
            param: {
                name: 'address',
                in: 'query',
            },
            example: 'cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0',
        })
});
export type ContractSchema = z.infer<typeof ContractSchema>;

export const ContractResponseSchema = z.object({
    address: z.string()
        .openapi({
            example: 'cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0',
        })
    ,
    name: z.string()
        .openapi({
            example: 'Tether USD',
        })
    ,
    symbol: z.string()
        .openapi({
            example: 'USDT',
        })
    ,

    decimals: z.string().or(z.number())
        .openapi({
            example: '18',
        })
    ,
});
export type ContractResponseSchema = z.infer<typeof ContractResponseSchema>;


export const BalanceSchema = z.object({

    wallet: z.string().refine((val) => ethers.isAddress(val)).openapi({
        param: {
            name: 'wallet',
            in: 'query',
        },
        example: 'cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0',
    }),

    address: z.string().refine((val) => ethers.isAddress(val)).optional()
        .openapi({
            param: {
                name: 'address',
                in: 'query',
            },
            example: 'cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0',
        })
    ,
    block: z.coerce.number().optional().openapi({
        param: {
            name: 'block',
            in: 'query',
        },
        example: 1000000,
    })
});
export type BalanceSchema = z.infer<typeof BalanceSchema>;

export const BalanceResponseSchema = z.object({
    contract: z.string()
        .openapi({
            example: 'cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0',
        })
    ,
    balance: z.string().or(z.number())
        .openapi({
            example: '10000000',
        })
    ,
    block: z.number().or(z.string()).openapi({
        example: 1000000,
    }),

});
export type BalanceResponseSchema = z.infer<typeof BalanceResponseSchema>;
