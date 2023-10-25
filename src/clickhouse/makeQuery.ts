// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/clickhouse/makeQuery.ts
import { logger } from "../logger";
import * as prometheus from "../prometheus";
import client from "./createClient";

export interface Meta {
    name: string,
    type: string
}
export interface Query<T> {
    meta: Meta[],
    data: T[],
    rows: number,
    statistics: {
        elapsed: number,
        rows_read: number,
        bytes_read: number,
    }
}

export async function makeQuery<T = unknown>(query: string) {
    const response = await client.query({ query })
    const data: Query<T> = await response.json();
    prometheus.query.inc();
    prometheus.bytes_read.inc(data.statistics.bytes_read);
    prometheus.rows_read.inc(data.statistics.rows_read);
    prometheus.elapsed.inc(data.statistics.elapsed);
    logger.info({ query, statistics: data.statistics, rows: data.rows });
    return data;
}