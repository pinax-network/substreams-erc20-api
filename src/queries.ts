import { DEFAULT_SORT_BY } from "./config";
import { getAddress, parseLimit } from "./utils";

export function getTotalSupply(searchParams: URLSearchParams) {
    // Params
    const address = getAddress(searchParams, "address", false);
    const chain = searchParams.get("chain");

    // Query
    const table = 'TotalSupply'
    let query = `SELECT * FROM ${table}`;

    // JOIN block table
    query += ` JOIN block ON block.block_id = ${table}.block_id`;

    // WHERE statements
    const where = [];

    // equals
    if (chain) where.push(`chain == '${chain}'`);
    if (address) where.push(`address == '${address}'`);

    // TO-DO: sort by timestamp & block number
    // https://github.com/pinax-network/substreams-erc20-api/issues/4

    // TO-DO: Filter by symbol & name (INNER JOIN Contracts table)
    // https://github.com/pinax-network/substreams-erc20-api/issues/6

    // Join WHERE statements with AND
    if ( where.length ) query += ` WHERE (${where.join(' AND ')})`;

    // Sort and Limit
    const limit = parseLimit(searchParams.get("limit"));
    const sort_by = searchParams.get("sort_by");
    query += ` ORDER BY block_number ${sort_by ?? DEFAULT_SORT_BY}`
    query += ` LIMIT ${limit}`
    return query;
}

export function getContracts(searchParams: URLSearchParams) {
    // Params
    const chain = searchParams.get("chain");
    const address = getAddress(searchParams, "address", false);
    const symbol = searchParams.get("symbol");
    const name = searchParams.get("name");

    // Query
    const table = 'Contracts'
    let query = `SELECT * FROM ${table}`

    // JOIN block table
    query += ` JOIN block ON block.block_id = ${table}.block_id`;

    // WHERE statements
    const where = [];
    if ( chain ) where.push(`chain == '${chain}'`);
    if ( address ) where.push(`address == '${address}'`);
    if ( symbol ) where.push(`symbol == '${symbol}'`);
    if ( name ) where.push(`name == '${name}'`);

    // TO-DO: sort by timestamp & block number
    // https://github.com/pinax-network/substreams-erc20-api/issues/4

    // Join WHERE statements with AND
    if ( where.length ) query += ` WHERE (${where.join(' AND ')})`;

    // Sort and Limit
    const limit = parseLimit(searchParams.get("limit"));
    const sort_by = searchParams.get("sort_by");
    query += ` ORDER BY block_number ${sort_by ?? DEFAULT_SORT_BY}`
    query += ` LIMIT ${limit}`
    return query;
}

export function getBalanceChanges(searchParams: URLSearchParams) {
    const chain = searchParams.get("chain");
    const contract = getAddress(searchParams, "contract", false);
    const owner = getAddress(searchParams, "owner", false);

    // SQL Query
    const table = 'balance_changes'
    let query = `SELECT * FROM ${table}`;

    // JOIN block table
    query += ` JOIN block ON block.block_id = ${table}.block_id`;

    // WHERE statements
    const where = [];

    // equals
    if ( chain ) where.push(`chain == '${chain}'`);
    if ( owner ) where.push(`owner == '${owner}'`);
    if ( contract ) where.push(`contract == '${contract}'`);

    // TO-DO: sort by timestamp & block number
    // https://github.com/pinax-network/substreams-erc20-api/issues/4

    // TO-DO: Filter by symbol & name (INNER JOIN Contracts table)
    // https://github.com/pinax-network/substreams-erc20-api/issues/6

    // TO-DO: Filter by transaction_id
    // https://github.com/pinax-network/substreams-erc20-api/issues/7

    // Join WHERE statements with AND
    if ( where.length ) query += ` WHERE (${where.join(' AND ')})`;

    // Sort and Limit
    const limit = parseLimit(searchParams.get("limit"));
    const sort_by = searchParams.get("sort_by");
    query += ` ORDER BY block_number ${sort_by ?? DEFAULT_SORT_BY}`
    query += ` LIMIT ${limit}`
    return query;
}

export function getChain() {
    return `SELECT DISTINCT chain FROM module_hashes`;
}