// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/queries.spec.ts

import { expect, test } from "bun:test";
import { getContracts, getChain, getTotalSupply, getBalanceChanges } from "./queries.js";

const chain = "eth";
const address = 'dac17f958d2ee523a2206206994597c13d831ec7'

test("getContracts", () => {
    expect(getContracts(new URLSearchParams({ chain, address })))
        .toBe(`SELECT * FROM Contracts JOIN blocks ON blocks.block_id = Contracts.block_id WHERE (chain == '${chain}' AND address == '${address}') ORDER BY block_number DESC LIMIT 1`);
});

test("getTotalSupply", () => {
    expect(getTotalSupply(new URLSearchParams({ chain, address })))
        .toBe(`SELECT * FROM TotalSupply JOIN blocks ON blocks.block_id = TotalSupply.block_id WHERE (chain == '${chain}' AND address == '${address}') ORDER BY block_number DESC LIMIT 1`);
});

test("getBalanceChanges", () => {
    expect(getBalanceChanges(new URLSearchParams({ chain, owner: address })))
        .toBe(`SELECT * FROM balance_changes JOIN blocks ON blocks.block_id = balance_changes.block_id WHERE (chain == '${chain}' AND owner == '${address}') ORDER BY block_number DESC LIMIT 1`);
});

test("getChain", () => {
    expect(getChain()).toBe(`SELECT DISTINCT chain FROM module_hashes`);
});