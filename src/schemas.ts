import { z } from '@hono/zod-openapi';
import { ethers } from 'ethers'


export const ContractSchema = z.object({
    address: z.string().refine((val) => ethers.isAddress(val))
        .openapi({
            param: {
                name: 'address',
                in: 'query',
            },
            example: 'dAC17F958D2ee523a2206206994597C13D831ec7',
        })
});
export type ContractSchema = z.infer<typeof ContractSchema>;

export const ContractResponseSchema = z.object({
    address: z.string()
        .openapi({
            example: 'dAC17F958D2ee523a2206206994597C13D831ec7',
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
            example: '6',
        })
    ,
});
export type ContractResponseSchema = z.infer<typeof ContractResponseSchema>;



export const SupplySchema = z.object({
    address: z.string().refine((val) => ethers.isAddress(val))
        .openapi({
            param: {
                name: 'address',
                in: 'query',
            },
            example: 'dAC17F958D2ee523a2206206994597C13D831ec7',
        })
    ,
    block: z.coerce.number().optional().openapi({
        param: {
            name: 'block',
            in: 'query',
        },
        example: 1000000,
    }),

    contract: z.enum(["true", "false"]).transform((value) => value === "true").optional().openapi({
        param: {
            name: 'contract',
            in: 'query',
        },
        example: true,
    })
});
export type SupplySchema = z.infer<typeof SupplySchema>;

export const SupplyResponseSchema = z.object({
    address: z.string()
        .openapi({
            example: 'dAC17F958D2ee523a2206206994597C13D831ec7',
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
    contract: ContractResponseSchema.optional()
});
export type SupplyResponseSchema = z.infer<typeof SupplyResponseSchema>;



export const BalanceSchema = z.object({

    wallet: z.string().refine((val) => ethers.isAddress(val)).openapi({
        param: {
            name: 'wallet',
            in: 'query',
        },
        example: 'a46fcc88d1e03f79e264ec48bcf05094401a6962',
    }),

    address: z.string().refine((val) => ethers.isAddress(val)).optional()
        .openapi({
            param: {
                name: 'address',
                in: 'query',
            },
            example: 'd445d1c4b6d2f048b566ce6c079d20512985854e',
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
            example: 'd445d1c4b6d2f048b566ce6c079d20512985854e',
        })
    ,
    balance: z.string().or(z.number())
        .openapi({
            example: '888',
        })
    ,
    block: z.number().or(z.string()).openapi({
        example: 1009707,
    }),

});
export type BalanceResponseSchema = z.infer<typeof BalanceResponseSchema>;
