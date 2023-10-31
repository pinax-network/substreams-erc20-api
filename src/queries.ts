import { DEFAULT_SORT_BY } from "./config.js";
import { getAddress, parseLimit, parseTimestamp } from "./utils.js";



export function addTimestampBlockFilter(searchParams: URLSearchParams, where: any[]) {
    const operators = [
        ["greater_or_equals", ">="],
        ["greater", ">"],
        ["less_or_equals", "<="],
        ["less", "<"],
    ]
    for (const [key, operator] of operators) {
        const block_number = searchParams.get(`${key}_by_block_number`);
        const timestamp = parseTimestamp(searchParams.get(`${key}_by_timestamp`));
        if (block_number) where.push(`block_number ${operator} ${block_number}`);
        if (timestamp) where.push(`toUnixTimestamp(timestamp) ${operator} ${timestamp}`);
    }
}

export function getTotalSupply(searchParams: URLSearchParams, example?: boolean) {
    // Params
    const address = getAddress(searchParams, "address", false);
    const chain = searchParams.get("chain");
    const symbol = searchParams.get("symbol");
    const name = searchParams.get("name");

    // Query
    const table = 'TotalSupply'
    const contractTable = 'Contracts';
    let query = `SELECT
    ${table}.address as address,
    ${table}.supply as supply,
    ${table}.id as id,
    block_number,
    ${table}.module_hash as module_hash,
    ${table}.chain as chain,
    ${contractTable}.name as name,
    ${contractTable}.symbol as symbol,
    ${contractTable}.decimals as decimals,
    timestamp
    FROM ${table} `;


    // JOIN block table
    query += ` JOIN blocks ON blocks.block_id = ${table}.block_id`;
    query += ` LEFT JOIN Contracts ON ${contractTable}.address = ${table}.address`;
    if (!example) {
        // WHERE statements
        const where = [];

        // equals
        if (chain) where.push(`${table}.chain == '${chain}'`);
        if (address) where.push(`${table}.address == '${address}'`);

        // timestamp and block filter
        addTimestampBlockFilter(searchParams, where);

        if (symbol) where.push(`symbol == '${symbol}'`);
        if (name) where.push(`name == '${name}'`);


        // Join WHERE statements with AND
        if (where.length) query += ` WHERE (${where.join(' AND ')})`;

        // Sort and Limit
        const sort_by = searchParams.get("sort_by");
        query += ` ORDER BY block_number ${sort_by ?? DEFAULT_SORT_BY} `

    }
    const limit = parseLimit(searchParams.get("limit"));
    query += ` LIMIT ${limit} `

    return query;
}

export function getContracts(searchParams: URLSearchParams, example?: boolean) {
    // Params
    const chain = searchParams.get("chain");
    const address = getAddress(searchParams, "address", false);
    const symbol = searchParams.get("symbol");
    const name = searchParams.get("name");

    // Query
    const table = 'Contracts'
    let query = `SELECT * FROM ${table} `


    // JOIN block table
    query += ` JOIN blocks ON blocks.block_id = ${table}.block_id`;
    if (!example) {
        // WHERE statements
        const where = [];
        if (chain) where.push(`chain == '${chain}'`);
        if (address) where.push(`address == '${address}'`);
        if (symbol) where.push(`symbol == '${symbol}'`);
        if (name) where.push(`name == '${name}'`);

        // timestamp and block filter
        addTimestampBlockFilter(searchParams, where);

        // Join WHERE statements with AND
        if (where.length) query += ` WHERE (${where.join(' AND ')})`;

        // Sort and Limit
        const sort_by = searchParams.get("sort_by");
        query += ` ORDER BY block_number ${sort_by ?? DEFAULT_SORT_BY} `

    }
    const limit = parseLimit(searchParams.get("limit"));
    query += ` LIMIT ${limit} `
    return query;
}

export function getBalanceChanges(searchParams: URLSearchParams, example?: boolean) {
    const chain = searchParams.get("chain");
    const contract = getAddress(searchParams, "contract", false);
    const owner = getAddress(searchParams, "owner", false);
    const transaction_id = searchParams.get("transaction_id");
    // SQL Query
    const table = 'balance_changes'
    const contractTable = 'Contracts';
    let query = `SELECT
    ${table}.contract as contract,
    ${contractTable}.name as name,
    ${contractTable}.symbol as symbol,
    ${contractTable}.decimals as decimals,
    ${table}.owner as owner,
    ${table}.old_balance as old_balance,
    ${table}.new_balance as new_balance,
    ${table}.transaction_id as transaction_id,
    ${table}.id as id,
    ${table}.module_hash as module_hash,
    ${table}.chain as chain,
    block_number,
    timestamp
    FROM ${table} `;

    // JOIN block table
    query += ` JOIN blocks ON blocks.block_id = ${table}.block_id`;
    query += ` LEFT JOIN Contracts ON ${contractTable}.address = ${table}.contract`;

    if (!example) {
        // WHERE statements
        const where = [];

        // equals

        if (chain) where.push(`chain == '${chain}'`);
        if (owner) where.push(`owner == '${owner}'`);
        if (contract) where.push(`contract == '${contract}'`);
        if (transaction_id) where.push(`${table}.transaction_id == '${transaction_id}'`);

        // timestamp and block filter
        addTimestampBlockFilter(searchParams, where);

        // Join WHERE statements with AND
        if (where.length) query += ` WHERE (${where.join(' AND ')})`;

        // Sort and Limit
        const sort_by = searchParams.get("sort_by");
        query += ` ORDER BY block_number ${sort_by ?? DEFAULT_SORT_BY} `
    }
    const limit = parseLimit(searchParams.get("limit"));
    query += ` LIMIT ${limit} `
    return query;
}

export function getChain() {
    return `SELECT DISTINCT chain FROM module_hashes`;
}