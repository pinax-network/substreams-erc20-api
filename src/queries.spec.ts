// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/queries.spec.ts

import { expect, test } from "bun:test";
import {
    getContracts,
    getChain,
    getTotalSupply,
    getBalanceChanges,
    addTimestampBlockFilter,
    getHolders,
    getTransfers,
    getApprovals,
    addAmountFilter,
} from "./queries.js";

const chain = "eth";
const address = "dac17f958d2ee523a2206206994597c13d831ec7";
const limit = "1";
const symbol = "usdt";
const name = "tether usd";
const greater_or_equals_by_timestamp = "1697587200";
const less_or_equals_by_timestamp = "1697587100";
const transaction_id =
    "ab3612eed62a184eed2ae86bcad766183019cf40f82e5316f4d7c4e61f4baa44";
const SQLTestQuery = new URLSearchParams({
    chain,
    address,
    symbol,
    greater_or_equals_by_timestamp,
    less_or_equals_by_timestamp,
    name,
    limit,
});

function formatSQL(query: string) {
    return query.replace(/\s+/g, "");
}
// Test Contract
test("getContracts", () => {
    const parameter = new URLSearchParams({ chain, address });
    expect(formatSQL(getContracts(parameter))).toContain(
        formatSQL(`SELECT * FROM Contracts`)
    );


    expect(formatSQL(getContracts(parameter))).toContain(
        formatSQL(`WHERE (chain == '${chain}' AND address == '${address}')`)
    );

    expect(formatSQL(getContracts(parameter))).toContain(
        formatSQL(`ORDER BY block_number DESC`)
    );

    expect(formatSQL(getContracts(parameter))).toContain(formatSQL(`LIMIT 1`));
});

test("getContracts with options", () => {
    const parameter = new URLSearchParams({
        chain,
        address,
        symbol,
        greater_or_equals_by_timestamp,
        less_or_equals_by_timestamp,
        name,
        limit,
    });
    expect(formatSQL(getContracts(parameter))).toContain(
        formatSQL(
            `WHERE(chain == '${chain}' AND address == '${address}' AND LOWER(symbol) == '${symbol}' AND LOWER(name) == '${name}' AND toUnixTimestamp(timestamp) >= ${greater_or_equals_by_timestamp} AND toUnixTimestamp(timestamp) <= ${less_or_equals_by_timestamp})`
        )
    );
});

//Timestamp and Block Filter
test("addTimestampBlockFilter", () => {
    let where: any[] = [];
    const searchParams = new URLSearchParams({
        address: address,
        greater_or_equals_by_timestamp: "1697587200",
        less_or_equals_by_timestamp: "1697587100",
        greater_or_equals_by_block: "123",
        less_or_equals_by_block: "123",
    });
    addTimestampBlockFilter(searchParams, where);
    expect(where).toContain("block_number >= 123");
    expect(where).toContain("block_number <= 123");
    expect(where).toContain("toUnixTimestamp(timestamp) >= 1697587200");
    expect(where).toContain("toUnixTimestamp(timestamp) <= 1697587100");
});

//Test Amount Filter
test("addAmountFilter", () => {
    let where: any[] = [];
    const searchParams = new URLSearchParams({
        address: address,
        amount_greater_or_equals: "123123",
        amount_less_or_equals: "123123",
        amount_greater: "2323",
        amount_less: "2332",
    });
    addAmountFilter(searchParams, where);
    expect(where).toContain("amount >= 123123");
    expect(where).toContain("amount <= 123123");
    expect(where).toContain("amount > 2323");
    expect(where).toContain("amount < 2332");
});


// Test TotalSupply
test("getTotalSupply", () => {
    const parameters = new URLSearchParams({ chain, address });
    expect(formatSQL(getTotalSupply(parameters))).toContain(
        formatSQL(`SELECT
    TotalSupply.address as address,
        TotalSupply.supply as supply,
        TotalSupply.id as id,
        block_number,
        TotalSupply.module_hash as module_hash,
        TotalSupply.chain as chain,
        Contracts.name as name,
        Contracts.symbol as symbol,
        Contracts.decimals as decimals,
        timestamp`)
    );
    expect(formatSQL(getTotalSupply(parameters))).toContain(
        formatSQL(`FROM TotalSupply`)
    );


    expect(formatSQL(getTotalSupply(parameters))).toContain(
        formatSQL(`LEFT JOIN Contracts ON Contracts.address = TotalSupply.address`)
    );

    expect(formatSQL(getTotalSupply(parameters))).toContain(
        formatSQL(
            `WHERE(TotalSupply.chain == '${chain}' AND TotalSupply.address == '${address}')`
        )
    );

    expect(formatSQL(getTotalSupply(parameters))).toContain(
        formatSQL(`ORDER BY block_number DESC`)
    );

    expect(formatSQL(getTotalSupply(parameters))).toContain(formatSQL(`LIMIT 1`));
});

test("getTotalSupply with options", () => {
    const parameters = new URLSearchParams({
        chain,
        address,
        symbol,
        greater_or_equals_by_timestamp,
        less_or_equals_by_timestamp,
        name,
        limit,
    });
    expect(formatSQL(getTotalSupply(parameters))).toContain(
        formatSQL(
            `WHERE(TotalSupply.chain == '${chain}' AND TotalSupply.address == '${address}' AND toUnixTimestamp(timestamp) >= ${greater_or_equals_by_timestamp}  AND toUnixTimestamp(timestamp) <= ${less_or_equals_by_timestamp}  AND LOWER(symbol) == '${symbol}' AND LOWER(name) == '${name}')`
        )
    );
});

// Test Balance Change
test("getBalanceChange", () => {
    const parameters = new URLSearchParams({ chain, owner: address });
    expect(formatSQL(getBalanceChanges(parameters))).toContain(
        formatSQL(`SELECT balance_changes.contract as contract,
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
        timestamp`)
    );
    expect(formatSQL(getBalanceChanges(parameters))).toContain(
        formatSQL(`FROM balance_changes`)
    );


    expect(formatSQL(getBalanceChanges(parameters))).toContain(
        formatSQL(
            `LEFT JOIN Contracts ON Contracts.address = balance_changes.contract`
        )
    );

    expect(formatSQL(getBalanceChanges(parameters))).toContain(
        formatSQL(`WHERE(chain == '${chain}' AND owner == '${address}')`)
    );

    expect(formatSQL(getBalanceChanges(parameters))).toContain(
        formatSQL(`ORDER BY block_number DESC`)
    );

    expect(formatSQL(getBalanceChanges(parameters))).toContain(
        formatSQL(`LIMIT 100`)
    );
});

test("getBalanceChanges with options", () => {
    const parameters = new URLSearchParams({
        chain,
        owner: address,
        transaction_id,
        greater_or_equals_by_timestamp,
        less_or_equals_by_timestamp,
        limit,
    });
    expect(formatSQL(getBalanceChanges(parameters))).toContain(
        formatSQL(
            `WHERE(chain == '${chain}' AND owner == '${address}' AND balance_changes.transaction_id == '${transaction_id}' AND toUnixTimestamp(timestamp) >= ${greater_or_equals_by_timestamp} AND toUnixTimestamp(timestamp) <= ${less_or_equals_by_timestamp})`
        )
    );
});

// Test getTransfers

test("getTransfers", () => {
    const parameters = new URLSearchParams({ chain, contract: address, from: address, to: address, transaction_id });
    expect(formatSQL(getTransfers(parameters))).toContain(
        formatSQL(`SELECT 
        address as contract,
        from,
        to,
        value as amount,
        transaction as transaction_id,
        block_number,
        timestamp,
        chain`)
    );
    expect(formatSQL(getTransfers(parameters))).toContain(
        formatSQL(`FROM Transfers`)
    );


    expect(formatSQL(getTransfers(parameters))).toContain(
        formatSQL(`WHERE(Transfers.chain == '${chain}' AND Transfers.address == '${address}' AND Transfers.from == '${address}' AND Transfers.to == '${address}' AND Transfers.transaction == '${transaction_id}')`)
    );

    expect(formatSQL(getTransfers(parameters))).toContain(
        formatSQL(`ORDER BY block_number DESC`)
    );

    expect(formatSQL(getTransfers(parameters))).toContain(
        formatSQL(`LIMIT 100`)
    );
});

// Test Approvals

test("getApprovals", () => {
    const parameters = new URLSearchParams({ chain, contract: address, owner: address, sender: address, transaction_id });
    expect(formatSQL(getApprovals(parameters))).toContain(
        formatSQL(`SELECT 
        address as contract,
        owner,
        spender,
        value as amount,
        transaction as transaction_id,
        block_number,
        timestamp,
        chain`)
    );
    expect(formatSQL(getApprovals(parameters))).toContain(
        formatSQL(`FROM Approvals`)
    );


    expect(formatSQL(getApprovals(parameters))).toContain(
        formatSQL(`WHERE(Approvals.chain == '${chain}' AND Approvals.address == '${address}' AND Approvals.owner == '${address}' AND Approvals.sender == '${address}' AND Approvals.transaction == '${transaction_id}')`)
    );

    expect(formatSQL(getApprovals(parameters))).toContain(
        formatSQL(`ORDER BY block_number DESC`)
    );

    expect(formatSQL(getApprovals(parameters))).toContain(
        formatSQL(`LIMIT 100`)
    );
});

// Test getHolders
test("getHolders", () => {
    const parameters = new URLSearchParams({ chain, contract: address });
    expect(formatSQL(getHolders(parameters))).toContain(
        formatSQL(`SELECT owner`)
    );
    expect(formatSQL(getHolders(parameters))).toContain(
        formatSQL(`FROM balance_changes`)
    );


    expect(formatSQL(getHolders(parameters))).toContain(
        formatSQL(`WHERE ((owner,block_number)IN(SELECTowner,max(block_number)FROMbalance_changesGROUPBYowner) AND chain == '${chain}' AND contract == '${address}' AND CAST(new_balance as int) > 0)`)
    );

    expect(formatSQL(getHolders(parameters))).toContain(
        formatSQL(`GROUP BY owner`)
    );

    expect(formatSQL(getHolders(parameters))).toContain(
        formatSQL(`LIMIT 100`)
    );
});


test("getChain", () => {
    expect(getChain()).toBe(`SELECT DISTINCT chain FROM module_hashes`);
});
