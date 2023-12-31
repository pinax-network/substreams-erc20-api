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


function balance_changes_owner_contract_query(table: string) {
    let query = `SELECT
    contract as contract,
    owner as owner,
    newBalance as balance,
    toDateTime(timestamp) as timestamp,
    transaction as transaction_id,
    chain as chain,
    block_number`;

    query += ` FROM ${table}`
    return query;
}

function balance_changes_owner_query(table: string) {
    let query = `SELECT
    owner,
    contract,
    toDateTime(last_value(timestamp)) AS timestamp,
    last_value(newBalance) AS balance`;

    query += ` FROM ${table}`
    return query;
}

function balance_changes_contract_query(table: string) {
    let query = `SELECT
    owner,
    contract,
    toDateTime(last_value(timestamp)) as timestamp,
    last_value(newBalance) as balance`;

    query += ` FROM ${table}`
    return query;
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
                ${table}.block_number,
                    ${table}.chain as chain,
                        ${contractTable}.name as name,
                            ${contractTable}.symbol as symbol,
                                ${contractTable}.decimals as decimals,
                                    ${table}.timestamp
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
        if (where.length) query += ` WHERE(${where.join(' AND ')})`;

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
        if (where.length) query += ` WHERE(${where.join(' AND ')})`;

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


    let table;
    let contractTable;
    let mvOwnerTable = "mv_balance_changes_owner"
    let mvContractTable = "mv_balance_changes_contract"
    let query = "";

    // SQL Query
    table = 'BalanceChange'


    if (contract && owner) query += balance_changes_owner_contract_query(mvOwnerTable);
    else if (!contract && owner) query += balance_changes_owner_query(mvContractTable);
    else if (contract && !owner) query += balance_changes_contract_query(mvContractTable);
    else query += `SELECT * FROM ${table}`
    if (!example) {
        // WHERE statements
        const where = [];

        // equals

        if (chain) where.push(`chain == '${chain}'`);
        if (owner) where.push(`owner == '${owner}'`);
        if (contract) where.push(`contract == '${contract}'`);

        // timestamp and block filter
        addTimestampBlockFilter(searchParams, where);

        // Join WHERE statements with AND
        if (where.length) query += ` WHERE(${where.join(' AND ')})`;


        //add ORDER BY and GROUP BY
        if (contract && owner) query += ` ORDER BY timestamp DESC`
        if (!contract && owner) query += `GROUP BY (contract, owner) ORDER BY timestamp DESC`
        if (contract && !owner) query += `GROUP BY (contract, owner) ORDER BY timestamp DESC`
    }

    //ADD limit
    const limit = parseLimit(searchParams.get("limit"));
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
    const table = 'mv_balance_changes_contract'
    let query = `SELECT
    owner,
        newBalance AS balance,
        block_number,
        toDateTime(timestamp) AS timestamp
    FROM ${table} `;
    if (!example) {
        // WHERE statements
        const where: any = [];

        if (chain) where.push(`chain == '${chain}'`);
        if (contract) where.push(`contract == '${contract}'`);
        where.push(`CAST(balance as int) > 0`);

        // timestamp and block filter
        addTimestampBlockFilter(searchParams, where);

        // Join WHERE statements with AND
        if (where.length) query += ` WHERE(${where.join(' AND ')})`;

        //add ORDER BY and GROUP BY
        query += `ORDER BY timestamp DESC`
    }

    const limit = parseLimit(searchParams.get("limit"), 100);
    if (limit) query += ` LIMIT ${limit} `;
    const offset = searchParams.get("offset");
    if (offset) query += ` OFFSET ${offset} `
    return query;
}

export function getTransfers(searchParams: URLSearchParams, example?: boolean) {

    const contract = getAddress(searchParams, "contract", false)?.toLowerCase();
    const from = getAddress(searchParams, "from", false)?.toLowerCase();
    const to = getAddress(searchParams, "to", false)?.toLowerCase();
    const chain = searchParams.get("chain");
    const transaction_id = searchParams.get("transaction_id")?.toLowerCase();
    const amount = searchParams.get("amount");


    // SQL Query
    let table = "Transfers"
    let mvFromTable = "mv_transfers_from"
    let mvToTable = "mv_transfers_to"
    let mvContractTable = "mv_transfers_contract"

    let query = `SELECT
        address,
        from,
        to,
        value as amount,
        transaction as transaction_id,
        block_number,
        timestamp,
        chain`

    if (contract) query += ` FROM ${mvContractTable}`
    else if (!contract && from && !to) query += ` FROM ${mvFromTable}`
    else if (!contract && !from && to) query += ` FROM ${mvToTable}`
    else if (!contract && from && to) query += ` FROM ${mvFromTable}`
    else query += ` FROM ${table}`

    if (!example) {
        // WHERE statements
        const where = [];

        // equals
        if (chain) where.push(`chain == '${chain}'`);
        if (contract) where.push(`address == '${contract}'`);
        if (from) where.push(`from == '${from}'`);
        if (to) where.push(`to == '${to}'`);
        if (transaction_id) where.push(`transaction == '${transaction_id}'`);

        //add amount filter
        addAmountFilter(searchParams, where);
        // timestamp and block filter
        addTimestampBlockFilter(searchParams, where);

        // Join WHERE statements with AND
        if (where.length) query += ` WHERE(${where.join(' AND ')})`;
        //add ORDER BY and GROUP BY
        query += ` ORDER BY timestamp DESC`
    }

    //ADD limit
    const limit = parseLimit(searchParams.get("limit"), 100);
    query += ` LIMIT ${limit} `
    const offset = searchParams.get("offset");
    if (offset) query += ` OFFSET ${offset} `
    return query;
}

export function getChain() {
    return `SELECT DISTINCT chain FROM module_hashes`;
}