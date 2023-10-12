import { Hono } from 'hono'
import { getTotalSupply, getContract, getBalance } from './query';
import config from './config'

const app = new Hono()

app.get('/supply', async (c) => {
    let res = await getTotalSupply(c.req.query("address"), c.req.query("block"));
    console.log(res);
    return c.json(res);
})

app.get('/contract', async (c) => {
    let res = await getContract(c.req.query("address"));
    console.log(res);
    return c.json(res);
})

app.get('/balance', async (c) => {
    let res = await getBalance(c.req.query("wallet"), c.req.query("address"), c.req.query("block"));
    console.log(res);
    return c.json(res);
})



export default {
    port: config.PORT,
    fetch: app.fetch,
}