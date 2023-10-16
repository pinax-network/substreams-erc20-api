import { ethers } from "ethers";
import { createClient } from "@clickhouse/client-web";
import config from "./config";

const client = createClient({
    database: config.name,
    host: config.dbHost,
    username: config.username,
    password: config.password,
});

export async function getTotalSupply(
    address: string | undefined,
    block?: number | undefined
) {
    if (ethers.isAddress(address)) {
        let sqlquery: string = "";
        if (block) {
            sqlquery = `SELECT *
                FROM TotalSupply
                WHERE address = '${address}' AND CAST(block AS INT) >= ${block}
                ORDER BY block
                LIMIT 1`;
        } else {
            sqlquery = `SELECT * FROM TotalSupply WHERE address = '${address}' ORDER BY block DESC LIMIT 1`;
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

export async function getContract(address: string | undefined) {
    if (ethers.isAddress(address)) {
        let sqlquery: string = `SELECT * FROM Contracts WHERE address = '${address}'`;
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

export async function getBalance(
    wallet: string | undefined,
    address?: string | undefined,
    block?: number | undefined
) {
    if (ethers.isAddress(wallet)) {
        let sqlquery: string = "";

        //GET all balance of every contract for a wallet LATEST BLOCK
        if (!block && !address) {
            sqlquery = `WITH RankedBalances AS (
                    SELECT
                        contract,
                        new_balance AS balance,
                        block_num,
                        ROW_NUMBER() OVER (PARTITION BY contract ORDER BY block_num DESC) AS rn
                    FROM balance_changes
                    WHERE owner = '${wallet}'
                )
                SELECT contract, balance, block_num
                FROM RankedBalances
                WHERE rn = 1`;
        }

        //GET all balance of every contract for a wallet at specific block
        else if (block && !address) {
            sqlquery = `WITH RankedBalances AS (
                    SELECT
                        contract,
                        new_balance AS balance,
                        block_num,
                        ROW_NUMBER() OVER (PARTITION BY contract ORDER BY block_num) AS rn
                    FROM balance_changes
                    WHERE owner = '${wallet}' AND CAST(block_num AS INT) >= ${block}
                )
                SELECT contract, balance, block_num
                FROM RankedBalances
                WHERE rn = 1;
                `;
        }
        //GET  balance of a specific contract for a wallet LATEST BLOCK
        else if (!block && address) {
            if (ethers.isAddress(address)) {
                sqlquery = `SELECT contract,
                new_balance AS balance,
                block_num,
                FROM balance_changes
                WHERE owner = '${wallet}' AND contract = '${address}'
                ORDER BY block_num DESC
                LIMIT 1`;

                console.log(sqlquery);
            } else {
                console.log("Invalid Address");
                return { error: "Invalid Address" };
            }
        } else if (block && address) {
            sqlquery = `SELECT contract,
                new_balance AS balance,
                block_num,
                FROM balance_changes
                WHERE owner = '${wallet}' AND contract = '${address}' AND CAST(block_num AS INT) >= ${block}
                ORDER BY block_num
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
