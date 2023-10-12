import { Hono } from 'hono'
import { getTotalSupply, getContract, getBalance } from './queries';
import config from './config'
import { HTTPException } from 'hono/http-exception';

import { banner } from "./banner";

const app = new Hono()

app.get('/', (c) => c.text(banner()));

app.get('/supply', async (c) => {
    let res = await getTotalSupply(c.req.query("address"), c.req.query("block"));
    
    if (res && (typeof res === 'object') && 'error' in res) {
        throw new HTTPException(400, {
            message: res.error
        });
    }
    return c.json(res);
})

app.get('/contract', async (c) => {
    let res = await getContract(c.req.query("address"));
    
    if (res && (typeof res === 'object') && 'error' in res) {
        throw new HTTPException(400, {
            message: res.error
        });
    }
    return c.json(res);
})

app.get('/balance', async (c) => {
    let res = await getBalance(c.req.query("wallet"), c.req.query("address"), c.req.query("block"));
    
    if (res && (typeof res === 'object') && 'error' in res) {
        throw new HTTPException(400, {
            message: res.error
        });
    }
    return c.json(res);
})

app.onError((err, c) => {
    let error_message = `${err}`;
    let error_code = 500;

  
    if (err instanceof HTTPException){
        error_message = err.message;
        error_code = err.status;
    }
    console.log(error_message)
    return c.json({ message: error_message }, error_code);
});

export default {
    port: config.PORT,
    fetch: app.fetch,
    app: app
}