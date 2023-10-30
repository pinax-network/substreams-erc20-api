// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/queries.spec.ts

import { expect, test } from "bun:test";
import { getContracts, getChain, getTotalSupply, getBalanceChanges, addTimestampBlockFilter } from "./queries.js";

const chain = "eth";
const address = 'dac17f958d2ee523a2206206994597c13d831ec7'
const limit = '1';
const symbol = "USDT";
const name = "Tether USD";
const greater_or_equals_by_timestamp = "1697587200";
const less_or_equals_by_timestamp = "1697587100";
const transaction_id = "ab3612eed62a184eed2ae86bcad766183019cf40f82e5316f4d7c4e61f4baa44"

// Test Contract
test("getContracts", () => {
    expect(getContracts(new URLSearchParams({ chain, address })).replace(/\s+/g, ''))
        .toBe(`SELECT * FROM Contracts
        JOIN blocks ON blocks.block_id = Contracts.block_id
        WHERE (chain == '${chain}' AND address == '${address}')
        ORDER BY block_number DESC
        LIMIT 1`.replace(/\s+/g, ''));
});

// Test Contract with optionals options
test("getContracts Optional", () => {
    expect(getContracts(new URLSearchParams({ chain, address, symbol, greater_or_equals_by_timestamp, less_or_equals_by_timestamp, name, limit })).replace(/\s+/g, ''))
        .toBe(`SELECT * FROM Contracts
        JOIN blocks ON blocks.block_id = Contracts.block_id
        WHERE (chain == '${chain}' AND address == '${address}' AND symbol == '${symbol}' AND name =='${name}' AND toUnixTimestamp(timestamp) >= ${greater_or_equals_by_timestamp} AND toUnixTimestamp(timestamp) <= ${less_or_equals_by_timestamp})
        ORDER BY block_number DESC
        LIMIT ${limit}`.replace(/\s+/g, ''));
});

//Timestamp and Block Filter
test("addTimestampBlockFilter", () => {
    let where: any[] = [];
    const searchParams = new URLSearchParams({ address: address, greater_or_equals_by_timestamp: "1697587200", less_or_equals_by_timestamp: "1697587100", greater_or_equals_by_block_number: "123", less_or_equals_by_block_number: "123" });
    addTimestampBlockFilter(searchParams, where)
    expect(where).toContain("block_number >= 123");
    expect(where).toContain("block_number <= 123");
    expect(where).toContain("toUnixTimestamp(timestamp) >= 1697587200");
    expect(where).toContain("toUnixTimestamp(timestamp) <= 1697587100");
});


// Test TotalSupply
test("getTotalSupply", () => {
    expect(getTotalSupply(new URLSearchParams({ chain, address })).replace(/\s+/g, ''))
        .toBe(`SELECT
        TotalSupply.address as address,
        TotalSupply.supply as supply,
        TotalSupply.id as id,
        block_number,
        TotalSupply.module_hash as module_hash,
        TotalSupply.chain as chain,
        Contracts.name as name,
        Contracts.symbol as symbol,
        Contracts.decimals as decimals,
        timestamp
        FROM TotalSupply
        JOIN blocks ON blocks.block_id = TotalSupply.block_id
        LEFT JOIN Contracts ON Contracts.address = TotalSupply.address
        WHERE (TotalSupply.chain == '${chain}' AND TotalSupply.address == '${address}')
        ORDER BY block_number DESC
        LIMIT 1`.replace(/\s+/g, ''));
});

// Test TotalSupply
test("getTotalSupply optional", () => {
    expect(getTotalSupply(new URLSearchParams({ chain, address, symbol, greater_or_equals_by_timestamp, less_or_equals_by_timestamp, name, limit })).replace(/\s+/g, ''))
        .toBe(`SELECT
        TotalSupply.address as address,
        TotalSupply.supply as supply,
        TotalSupply.id as id,
        block_number,
        TotalSupply.module_hash as module_hash,
        TotalSupply.chain as chain,
        Contracts.name as name,
        Contracts.symbol as symbol,
        Contracts.decimals as decimals,
        timestamp
        FROM TotalSupply
        JOIN blocks ON blocks.block_id = TotalSupply.block_id
        LEFT JOIN Contracts ON Contracts.address = TotalSupply.address
        WHERE (TotalSupply.chain == '${chain}' AND TotalSupply.address == '${address}' AND toUnixTimestamp(timestamp) >= ${greater_or_equals_by_timestamp} AND toUnixTimestamp(timestamp) <= ${less_or_equals_by_timestamp}  AND symbol == '${symbol}' AND name == '${name}')
        ORDER BY block_number DESC
        LIMIT ${limit} `.replace(/\s+/g, ''));
});

// Test BalanceChanges
test("getBalanceChanges", () => {
    expect(getBalanceChanges(new URLSearchParams({ chain, owner: address })).replace(/\s+/g, ''))
        .toBe(`SELECT balance_changes.contract as contract,
        Contracts.name as name,
        Contracts.symbol as symbol,
        Contracts.decimals as decimals,
        balance_changes.owner as owner,
        balance_changes.old_balance as old_balance,
        balance_changes.new_balance as new_balance,
        balance_changes.transaction_id as transaction_id,
        balance_changes.id as id,
        balance_changes.module_hash as module_hash,
        balance_changes.chain as chain,
        block_number,
        timestamp
        FROM balance_changes
        JOIN blocks ON blocks.block_id = balance_changes.block_id
        LEFT JOIN Contracts ON Contracts.address = balance_changes.contract
        WHERE (chain == '${chain}' AND owner == '${address}')
        ORDER BY block_number DESC
        LIMIT 1 `.replace(/\s+/g, ''))
});


// Test BalanceChanges Optional
test("getBalanceChanges Optional", () => {
    expect(getBalanceChanges(new URLSearchParams({ chain, owner: address, transaction_id, greater_or_equals_by_timestamp, less_or_equals_by_timestamp, limit })).replace(/\s+/g, ''))
        .toBe(`SELECT balance_changes.contract as contract,
        Contracts.name as name,
        Contracts.symbol as symbol,
        Contracts.decimals as decimals,
        balance_changes.owner as owner,
        balance_changes.old_balance as old_balance,
        balance_changes.new_balance as new_balance,
        balance_changes.transaction_id as transaction_id,
        balance_changes.id as id,
        balance_changes.module_hash as module_hash,
        balance_changes.chain as chain,
        block_number,
        timestamp
        FROM balance_changes
        JOIN blocks ON blocks.block_id = balance_changes.block_id
        LEFT JOIN Contracts ON Contracts.address = balance_changes.contract
        WHERE (chain == '${chain}' AND owner == '${address}' AND balance_changes.transaction_id == '${transaction_id}' AND toUnixTimestamp(timestamp) >= ${greater_or_equals_by_timestamp} AND toUnixTimestamp(timestamp) <= ${less_or_equals_by_timestamp})
        ORDER BY block_number DESC
        LIMIT ${limit}`.replace(/\s+/g, ''))
});


test("getChain", () => {
    expect(getChain()).toBe(`SELECT DISTINCT chain FROM module_hashes`);
});