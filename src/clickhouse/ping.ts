// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/clickhouse/ping.ts
import { PingResult } from "@clickhouse/client-web";
import client from "./createClient";

// Does not work with Bun's implementation of Node streams.
export async function ping(): Promise<PingResult> {
  try {
    await client.exec({ query: "SELECT 1" });
    return { success: true };
  } catch (err) {
    const message = typeof err === "string" ? err : JSON.stringify(err);
    return { success: false, error: new Error(message) };
  }
};