import { ethers } from "ethers";
import { createClient } from "@clickhouse/client-web";
import config from "./config";

const client = createClient({
    database: config.name,
    host: config.dbHost,
    username: config.username,
    password: config.password,
});

function formatAddress(address: string) {
    if (address.startsWith('0x')) {
        // Remove the "0x" prefix and return the address
        return address.slice(2);
    }
    // If it doesn't start with "0x", return the address as is
    return address;
}

export async function getTotalSupply(
    address: string | undefined,
    block?: number | undefined
) {
    if (address) {
        address = formatAddress(address);
        if (ethers.isAddress(address)) {
            let sqlquery: string = "";
            if (block) {
                sqlquery = `SELECT address,supply, block_number AS block,chain
                    FROM TotalSupply
                    JOIN block ON block.block_id = TotalSupply.block_id
                    WHERE address = '${address}' AND block_number >= ${block}
                    ORDER BY block_number
                    LIMIT 1`;
            } else {
                sqlquery = `SELECT address,supply, chain FROM TotalSupply  JOIN block ON block.block_id = TotalSupply.block_id WHERE address = '${address}' ORDER BY block_number DESC LIMIT 1`;
            }
            const resultSet = await client.query({
                query: sqlquery,
                format: "JSONEachRow",
            });
            const dataset = await resultSet.json();
            if (Array.isArray(dataset) && dataset.length !== 0) return dataset;
            else return { error: "Contract data not available" };
        } else {
            console.log("Invalid Address");
            return { error: "Invalid Address" };
        }
    }

}

export async function getContract(address: string | undefined) {
    if (address) {
        address = formatAddress(address);
        if (ethers.isAddress(address)) {
            let sqlquery: string = `SELECT address,name,symbol,decimals,chain FROM Contracts WHERE address = '${address}'`;
            const resultSet = await client.query({
                query: sqlquery,
                format: "JSONEachRow",
            });
            const dataset = await resultSet.json();
            if (Array.isArray(dataset) && dataset.length !== 0) return dataset;
            else return { error: "Contract data not available" };
        } else {
            console.log("Invalid Address");
            return { error: "Invalid Address" };
        }
    }

}

export async function getBalance(
    wallet: string | undefined,
    address?: string | undefined,
    block?: number | undefined
) {
    if (wallet) {
        wallet = formatAddress(wallet);
        if (address) address = formatAddress(address);
        if (ethers.isAddress(wallet)) {
            let sqlquery: string = "";

            //GET all balance of every contract for a wallet LATEST BLOCK
            if (!block && !address) {
                sqlquery = `WITH RankedBalances AS (
                        SELECT
                            contract,
                            new_balance AS balance,
                            chain,
                            ROW_NUMBER() OVER (PARTITION BY contract ORDER BY block_number DESC) AS rn
                        FROM balance_changes
                        JOIN block ON block.block_id = balance_changes.block_id
                        WHERE owner = '${wallet}'
                    )
                    SELECT contract, balance,chain
                    FROM RankedBalances
                    WHERE rn = 1`;
            }

            //GET all balance of every contract for a wallet at specific block
            else if (block && !address) {
                sqlquery = `WITH RankedBalances AS (
                        SELECT
                            contract,
                            new_balance AS balance,
                            block_number,
                            chain,
                            ROW_NUMBER() OVER (PARTITION BY contract ORDER BY block_number) AS rn
                        FROM balance_changes
                        JOIN block ON block.block_id = balance_changes.block_id
                        WHERE owner = '${wallet}' AND block_number >= ${block}
                    )
                    SELECT contract, balance, block_number,chain
                    FROM RankedBalances
                    WHERE rn = 1;
                    `;
            }
            //GET  balance of a specific contract for a wallet LATEST BLOCK
            else if (!block && address) {
                if (ethers.isAddress(address)) {
                    sqlquery = `SELECT contract, new_balance AS balance,chain 
                    FROM balance_changes
                    JOIN block ON block.block_id = balance_changes.block_id
                    WHERE owner = '${wallet}' AND contract = '${address}'
                    ORDER BY block_number DESC
                    LIMIT 1`;

                    console.log(sqlquery);
                } else {
                    console.log("Invalid Address");
                    return { error: "Invalid Address" };
                }
            } else if (block && address) {
                sqlquery = `SELECT contract,
                    new_balance AS balance,
                    block_number AS block,
                    chain
                    FROM balance_changes
                    JOIN block ON block.block_id = balance_changes.block_id
                    WHERE owner = '${wallet}' AND contract = '${address}' AND block_number >= ${block}
                    ORDER BY block_number
                    LIMIT 1`;
            }

            const resultSet = await client.query({
                query: sqlquery,
                format: "JSONEachRow",
            });
            const dataset = await resultSet.json();
            if (Array.isArray(dataset) && dataset.length !== 0) return dataset;
            else return { error: "Contract data not available" };
        } else {
            console.log("Invalid Wallet");
            return { error: "Invalid Wallet" };
        }
    }

}
