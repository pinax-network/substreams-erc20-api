import { OpenAPIHono } from '@hono/zod-openapi';
import { TypedResponse } from 'hono';
import { serveStatic } from 'hono/bun'
import { logger } from 'hono/logger';
import pkg from "../package.json";
import * as routes from './routes';
import {
    type SupplyResponseSchema,
    type SupplySchema, type ContractSchema, type ContractResponseSchema, type BalanceSchema, type BalanceResponseSchema
} from './schemas';
import { getTotalSupply, getContract, getBalance } from './queries';
import config from './config'
import { HTTPException } from 'hono/http-exception';

import { banner } from "./banner";

export function generateApp() {

    const app = new OpenAPIHono();

    if (config.NODE_ENV !== "production")
        app.use('*', logger());

    app.use('/swagger/*', serveStatic({ root: './' }))

    app.doc('/openapi', {
        openapi: '3.0.0',
        info: {
            version: pkg.version,
            title: 'ERC20 API',
        },
    });

    app.onError((err, c) => {
        let error_message = `${err}`;
        let error_code = 500;

        if (err instanceof HTTPException) {
            error_message = err.message;
            error_code = err.status;
        }

        return c.json({ error_message }, error_code);
    });


    app.openapi(routes.indexRoute, (c) => {
        return {
            response: c.text(banner())
        } as TypedResponse<string>;
    });


    app.openapi(routes.TotalSupplyQueryRoute, async (c) => {
        // @ts-expect-error: Suppress type of parameter expected to be never (see https://github.com/honojs/middleware/issues/200)
        const { address, block, contract } = c.req.valid('query') as SupplySchema;
        if (contract) {
            let supply = await getTotalSupply(address, block);
            let contract_info = await getContract(address);
            let result = Object.assign({}, supply, contract_info)
            return {
                response: c.json(result)
            } as TypedResponse<SupplyResponseSchema>;
        }
        else {
            return {
                response: c.json(await getTotalSupply(address, block))
            } as TypedResponse<SupplyResponseSchema>;
        }

    });





    app.openapi(routes.ContractQueryRoute, async (c) => {
        const { address } = c.req.valid('query') as ContractSchema;
        return {
            response: c.json(await getContract(address))
        } as TypedResponse<ContractResponseSchema>;
    });


    app.openapi(routes.BalanceQueryRoute, async (c) => {
        // @ts-expect-error: Suppress type of parameter expected to be never (see https://github.com/honojs/middleware/issues/200)
        const { wallet, address, block } = c.req.valid('query') as BalanceSchema;
        return {
            response: c.json(await getBalance(wallet, address, block))
        } as TypedResponse<BalanceResponseSchema>;
    });


    return app;
}

Bun.serve({
    port: config.port,
    hostname: config.hostname,
    fetch: generateApp().fetch
}
)

console.log("Server listening on http://" + config.hostname + ":" + config.port + "/")
