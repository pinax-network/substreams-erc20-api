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
        const block_number = searchParams.get(`${key}_by_block`);
        const timestamp = parseTimestamp(searchParams.get(`${key}_by_timestamp`));
        if (block_number) where.push(`block_number ${operator} ${block_number}`);
        if (timestamp) where.push(`toUnixTimestamp(timestamp) ${operator} ${timestamp}`);
    }
}

export function addAmountFilter(searchParams: URLSearchParams, where: any[]) {
    const operators = [
        ["greater_or_equals", ">="],
        ["greater", ">"],
        ["less_or_equals", "<="],
        ["less", "<"],
    ]
    for (const [key, operator] of operators) {
        const amount = searchParams.get(`amount_${key}`);
        if (amount) where.push(`amount ${operator} ${amount}`);
    }
}


export function getTotalSupply(searchParams: URLSearchParams, example?: boolean) {
    // Params
    const address = getAddress(searchParams, "address", false)?.toLowerCase();
    const chain = searchParams.get("chain");
    const symbol = searchParams.get("symbol")?.toLowerCase();
    const name = searchParams.get("name")?.toLowerCase();

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


    // JOIN Contracts table
    query += ` LEFT JOIN Contracts ON ${contractTable}.address = ${table}.address`;
    if (!example) {
        // WHERE statements
        const where = [];

        // equals
        if (chain) where.push(`${table}.chain == '${chain}'`);
        if (address) where.push(`${table}.address == '${address}'`);

        // timestamp and block filter
        addTimestampBlockFilter(searchParams, where);

        if (symbol) where.push(`LOWER(symbol) == '${symbol}'`);
        if (name) where.push(`LOWER(name) == '${name}'`);


        // Join WHERE statements with AND
        if (where.length) query += ` WHERE (${where.join(' AND ')})`;

        // Sort and Limit
        const sort_by = searchParams.get("sort_by");
        query += ` ORDER BY block_number ${sort_by ?? DEFAULT_SORT_BY} `

    }
    const limit = parseLimit(searchParams.get("limit"));
    query += ` LIMIT ${limit} `
    const offset = searchParams.get("offset");
    if (offset) query += ` OFFSET ${offset} `
    return query;
}



export function getContracts(searchParams: URLSearchParams, example?: boolean) {
    // Params
    const chain = searchParams.get("chain");
    const address = getAddress(searchParams, "address", false)?.toLowerCase();
    const symbol = searchParams.get("symbol")?.toLowerCase();
    const name = searchParams.get("name")?.toLowerCase();

    // Query
    const table = 'Contracts'
    let query = `SELECT * FROM ${table} `


    if (!example) {
        // WHERE statements
        const where = [];
        if (chain) where.push(`chain == '${chain}'`);
        if (address) where.push(`address == '${address}'`);
        if (symbol) where.push(`LOWER(symbol) == '${symbol}'`);
        if (name) where.push(`LOWER(name) == '${name}'`);

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
    const offset = searchParams.get("offset");
    if (offset) query += ` OFFSET ${offset} `
    return query;
}

export function getBalanceChanges(searchParams: URLSearchParams, example?: boolean) {
    const chain = searchParams.get("chain");
    const contract = getAddress(searchParams, "contract", false)?.toLowerCase();
    const owner = getAddress(searchParams, "owner", false)?.toLowerCase();
    const transaction_id = searchParams.get("transaction_id")?.toLowerCase();
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
    const limit = parseLimit(searchParams.get("limit"), 100);
    query += ` LIMIT ${limit} `
    const offset = searchParams.get("offset");
    if (offset) query += ` OFFSET ${offset} `
    return query;
}


export function getHolders(searchParams: URLSearchParams, example?: boolean) {
    const chain = searchParams.get("chain");
    const contract = getAddress(searchParams, "contract", false)?.toLowerCase();
    const owner = getAddress(searchParams, "owner", false)?.toLowerCase();
    const transaction_id = searchParams.get("transaction_id")?.toLowerCase();
    // SQL Query
    const table = 'balance_changes'
    let query = `SELECT
    owner,
    new_balance,
    block_number
    FROM ${table} `;
    if (!example) {
        // WHERE statements
        const where: any = [];

        //Get holders balance
        let holderWhereQuery = `(owner,block_number) IN (SELECT owner, max(block_number) FROM ${table}`;
        const whereHolder: any = [];
        addTimestampBlockFilter(searchParams, whereHolder);
        if (whereHolder.length) holderWhereQuery += ` WHERE(${whereHolder.join(' AND ')})`;
        holderWhereQuery += ` GROUP BY owner)`;

        where.push(holderWhereQuery);

        // equals

        if (chain) where.push(`chain == '${chain}'`);
        if (contract) where.push(`contract == '${contract}'`);
        where.push(`CAST(new_balance as int) > 0`);

        // timestamp and block filter
        addTimestampBlockFilter(searchParams, where);

        // Join WHERE statements with AND
        if (where.length) query += ` WHERE(${where.join(' AND ')})`;

    }

    const limit = parseLimit(searchParams.get("limit"), 100);
    if (limit) query += ` LIMIT ${limit} `;
    const offset = searchParams.get("offset");
    if (offset) query += ` OFFSET ${offset} `
    return query;
}

export function getTransfers(searchParams: URLSearchParams, example?: boolean) {
    // Params
    const contract = getAddress(searchParams, "contract", false)?.toLowerCase();
    const from = getAddress(searchParams, "from", false)?.toLowerCase();
    const to = getAddress(searchParams, "to", false)?.toLowerCase();
    const chain = searchParams.get("chain");
    const transaction_id = searchParams.get("transaction_id")?.toLowerCase();
    const amount = searchParams.get("amount");
    // Query
    const table = 'Transfers'

    let query = `SELECT 
    address as contract,
    from,
    to,
    value as amount,
    transaction as transaction_id,
    block_number,
    timestamp,
    chain
    FROM ${table} `;

    if (!example) {
        // WHERE statements
        const where = [];

        // equals
        if (chain) where.push(`${table}.chain == '${chain}'`);
        if (contract) where.push(`${table}.address == '${contract}'`);
        if (from) where.push(`${table}.from == '${from}'`);
        if (to) where.push(`${table}.to == '${to}'`);
        if (transaction_id) where.push(`${table}.transaction == '${transaction_id}'`);

        //add amount filter
        addAmountFilter(searchParams, where);
        // timestamp and block filter
        addTimestampBlockFilter(searchParams, where);

        // Join WHERE statements with AND
        if (where.length) query += ` WHERE (${where.join(' AND ')})`;

        // Sort and Limit
        const sort_by = searchParams.get("sort_by");
        query += ` ORDER BY block_number ${sort_by ?? DEFAULT_SORT_BY} `

    }
    const limit = parseLimit(searchParams.get("limit"), 100);
    query += ` LIMIT ${limit} `
    const offset = searchParams.get("offset");
    if (offset) query += ` OFFSET ${offset} `
    return query;
}


export function getApprovals(searchParams: URLSearchParams, example?: boolean) {
    // Params
    const contract = getAddress(searchParams, "contract", false)?.toLowerCase();
    const owner = getAddress(searchParams, "owner", false)?.toLowerCase();
    const sender = getAddress(searchParams, "sender", false)?.toLowerCase();
    const chain = searchParams.get("chain");
    const transaction_id = searchParams.get("transaction_id")?.toLowerCase();
    const amount = searchParams.get("amount");
    // Query
    const table = 'Approvals'

    let query = `SELECT 
    address as contract,
    owner,
    spender,
    value as amount,
    transaction as transaction_id,
    block_number,
    timestamp,
    chain
    FROM ${table} `;

    if (!example) {
        // WHERE statements
        const where = [];

        // equals
        if (chain) where.push(`${table}.chain == '${chain}'`);
        if (contract) where.push(`${table}.address == '${contract}'`);
        if (owner) where.push(`${table}.owner == '${owner}'`);
        if (sender) where.push(`${table}.sender == '${sender}'`);
        if (transaction_id) where.push(`${table}.transaction == '${transaction_id}'`);

        //add amount filter
        addAmountFilter(searchParams, where);
        // timestamp and block filter
        addTimestampBlockFilter(searchParams, where);

        // Join WHERE statements with AND
        if (where.length) query += ` WHERE (${where.join(' AND ')})`;

        // Sort and Limit
        const sort_by = searchParams.get("sort_by");
        query += ` ORDER BY block_number ${sort_by ?? DEFAULT_SORT_BY} `

    }
    const limit = parseLimit(searchParams.get("limit"), 100);
    query += ` LIMIT ${limit} `
    const offset = searchParams.get("offset");
    if (offset) query += ` OFFSET ${offset} `
    return query;
}



export function getChain() {
    return `SELECT DISTINCT chain FROM module_hashes`;
}