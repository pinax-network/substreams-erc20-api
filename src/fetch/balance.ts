// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/fetch/block.ts
import { makeQuery } from "../clickhouse/makeQuery.js";
import { logger } from "../logger.js";
import { getBalanceChanges } from "../queries.js";
import * as prometheus from "../prometheus.js";
import { toJSON } from "./utils.js";


function verifyParams(searchParams: URLSearchParams) {
  const chain = searchParams.get("chain");
  const owner = searchParams.get("owner");
  const contract = searchParams.get("contract");

  if (!chain) throw new Error("chain is required");
  if (!owner && !contract) throw new Error("owner or contract is required");
}

export default async function (req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    logger.info({ searchParams: Object.fromEntries(Array.from(searchParams)) });
    //Verify required params
    verifyParams(searchParams);
    const query = await getBalanceChanges(searchParams);
    const response = await makeQuery(query)
    return toJSON(response.data);
  } catch (e: any) {
    logger.error(e);
    prometheus.request_error.inc({ pathname: "/balance", status: 400 });
    return new Response(e.message, { status: 400 });
  }
}