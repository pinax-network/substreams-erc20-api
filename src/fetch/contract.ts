// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/fetch/block.ts
import { makeQuery } from "../clickhouse/makeQuery.js";
import { logger } from "../logger.js";
import { getContracts } from "../queries.js";
import * as prometheus from "../prometheus.js";

export default async function (req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    logger.info({searchParams: Object.fromEntries(Array.from(searchParams))});
    const query = await getContracts(searchParams);
    const response = await makeQuery(query)
    return new Response(JSON.stringify(response.data), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    logger.error(e);
    prometheus.request_error.inc({pathname: "/contract", status: 400});
    return new Response(e.message, { status: 400 });
  }
}