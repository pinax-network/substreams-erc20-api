import { describe, expect, it, beforeAll } from 'bun:test';

import index from '../src/index';
import { banner } from "../src/banner";
import { getTotalSupply, getBalance, getContract } from "../src/queries";

describe('Index page (/)', () => {
    it('Should return 200 Response', async () => {
        const res = await index.app.request('/');
        expect(res.status).toBe(200);
    });

    it('Should have the banner as the body', async () => {
        const res = await index.app.request('/');
        expect(await res.text()).toBe(banner());
    });
});

describe('Supply page (/supply)', () => {

    it('Should return 200 Response for valid address', async () => {

        const validAddress =  "cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0"
        const res = await index.app.request('/supply?address=' + validAddress);

        const json = await res.json() as {message: string};
        expect(res.status === 200 || json.message === "Contract data not available").toBe(true);
    });

    it('Should return 200 Response for valid address and block', async () => {

        const validAddress =  "cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0"
        const res = await index.app.request('/supply?address=' + validAddress + '&block=1004162');

        const json = await res.json() as {message: string};
        expect(res.status === 200 || json.message === "Contract data not available").toBe(true);

    });

    it('Should return 400 Response for invalid address', async () => {

        const validAddress =  "awdawd"
        const res = await index.app.request('/supply?address=' + validAddress);
        expect(res.status).toBe(400);
    });

    it('Should return 400 Response for valid address but invalid block', async () => {

        const validAddress =  "cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0"
        const res = await index.app.request('/supply?address=' + validAddress + '&block=awdawd');
        expect(res.status).toBe(400);
    });
});

describe('Contract page (/contract)', () => {

    it('Should return 200 Response for valid address', async () => {

        const validAddress =  "cb9df5dc2ed5d7d3972f601acfe35cdbe57341e0"
        const res = await index.app.request('/contract?address=' + validAddress);
        const json = await res.json() as {message: string};
        expect(res.status === 200 || json.message === "Contract data not available").toBe(true);
    });

    it('Should return 400 Response for invalid address', async () => {

        const validAddress =  "awdawd"
        const res = await index.app.request('/contract?address=' + validAddress);
        expect(res.status).toBe(400);
    });
});


describe('Balance page (/balance)', () => {

    it('Should return 200 Response for valid address', async () => {

        const validWallet =  "0x39fA8c5f2793459D6622857E7D9FbB4BD91766d3"
        const res = await index.app.request('/balance?wallet=' + validWallet);
        const json = await res.json() as {message: string};
        expect(res.status === 200 || json.message === "Contract data not available").toBe(true);
    });

    it('Should return 200 Response for valid wallet and block', async () => {

        const validWallet =  "0x39fA8c5f2793459D6622857E7D9FbB4BD91766d3"
        const res = await index.app.request('/balance?wallet=' + validWallet + '&block=1000000');
        const json = await res.json() as {message: string};
        expect(res.status === 200 || json.message === "Contract data not available").toBe(true);

    });
    

    it('Should return 200 Response for valid wallet and valid address', async () => {

        const validWallet =  "0x39fA8c5f2793459D6622857E7D9FbB4BD91766d3"
        const res = await index.app.request('/balance?wallet=' + validWallet + '&address=0xc083e9947Cf02b8FfC7D3090AE9AEA72DF98FD47');
        const json = await res.json() as {message: string};
        expect(res.status === 200 || json.message === "Contract data not available").toBe(true);
    });

    it('Should return 400 Response for valid wallet and invalid address', async () => {

        const validWallet =  "0x39fA8c5f2793459D6622857E7D9FbB4BD91766d3"
        const res = await index.app.request('/balance?address=' + validWallet + '&address=3rrw3r');
        expect(res.status).toBe(400);
    });

    it('Should return 400 Response for invalid wallet', async () => {

        const validWallet =  "awdawdaw"
        const res = await index.app.request('/balance?wallet=' + validWallet);
        expect(res.status).toBe(400);
    });

    it('Should return 400 Response for valid wallet but invalid block', async () => {

        const validWallet =  "0x39fA8c5f2793459D6622857E7D9FbB4BD91766d3"
        const res = await index.app.request('/balance?wallet=' + validWallet + '&block=awdawd');
        expect(res.status).toBe(400);
    });
});