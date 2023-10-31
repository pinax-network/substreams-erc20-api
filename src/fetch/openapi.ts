// from: https://github.com/pinax-network/substreams-clock-api/blob/main/src/fetch/openapi.ts
import pkg from "../../package.json" assert { type: "json" };

import { OpenApiBuilder, SchemaObject, ExampleObject, ParameterObject } from "openapi3-ts/oas31";
import { config } from "../config.js";
import { registry } from "../prometheus.js";
import { supportedChainsQuery } from "./chains.js";
import { makeQuery } from "../clickhouse/makeQuery.js";
import { getBalanceChanges, getContracts, getTotalSupply } from "../queries.js";
const TAGS = {
  MONITORING: "Monitoring",
  HEALTH: "Health",
  USAGE: "Usage",
  DOCS: "Documentation",
} as const;

const arrayFilter = ["greater_or_equals_by_timestamp", "greater_by_timestamp", "less_or_equals_by_timestamp", "less_by_timestamp"];

const chains = await supportedChainsQuery();
const supply_example = (await makeQuery(await getTotalSupply(new URLSearchParams({ limit: "2" }), true))).data;
const contract_example = (await makeQuery(await getContracts(new URLSearchParams({ limit: "2" }), true))).data;
const balance_example = (await makeQuery(await getBalanceChanges(new URLSearchParams({ limit: "2" }), true))).data;

const timestampSchema: SchemaObject = {
  anyOf: [
    { type: "number" },
    { type: "string", format: "date" },
    { type: "string", format: "date-time" }
  ]
};
const timestampExamples: ExampleObject = {
  unix: { summary: `Unix Timestamp (seconds)` },
  date: { summary: `Full-date notation`, value: '2023-10-18' },
  datetime: { summary: `Date-time notation`, value: '2023-10-18T00:00:00Z' },
}

const parameterChain: ParameterObject = {
  name: "chain",
  in: "query",
  description: "Filter by chain",
  required: false,
  schema: { enum: chains },
}
const parameterString = (name: string = "address", required = false) => ({
  name,
  in: "query",
  description: `Filter by ${name}`,
  required,
  schema: { type: "string" },
} as ParameterObject);


const parameterLimit: ParameterObject = {
  name: "limit",
  in: "query",
  description: "Used to specify the number of records to return.",
  required: false,
  schema: { type: "number", maximum: config.maxLimit, minimum: 1 },
}


const timestampFilter = arrayFilter.map(name => {
  return {
    name,
    in: "query",
    description: "Filter " + name.replace(/_/g, " "),
    required: false,
    schema: timestampSchema,
    examples: timestampExamples,
  } as ParameterObject
})

const blockFilter = arrayFilter.map(name => {
  return {
    name,
    in: "query",
    description: "Filter " + name.replace(/_/g, " "),
    required: false,
    schema: { type: "number" },
  } as ParameterObject
})

export default new OpenApiBuilder()
  .addInfo({
    title: pkg.name,
    version: pkg.version,
    description: pkg.description,
    license: { name: pkg.license, url: `${pkg.homepage}/blob/main/LICENSE` },
  })
  .addExternalDocs({ url: pkg.homepage, description: "Extra documentation" })
  .addSecurityScheme("auth-key", { type: "http", scheme: "bearer" })
  .addPath("/chains", {
    get: {
      tags: [TAGS.USAGE],
      summary: 'Supported chains',
      responses: {
        200: {
          description: "Array of chains",
          content: {
            "application/json": {
              schema: { type: "array" },
              example: chains,
            }
          },
        },
      },
    },
  })
  .addPath("/supply", {
    get: {
      tags: [TAGS.USAGE],
      summary: "ERC20 total supply",
      parameters: [
        parameterChain,
        parameterString("address"),
        parameterString("name"),
        parameterString("symbol"),
        ...timestampFilter,
        ...blockFilter,
        parameterLimit,
      ],
      responses: {
        200: { description: "Array of supply", content: { "application/json": { example: supply_example, schema: { type: "array" } } } },
        400: { description: "Bad request" },
      },
    },
  })
  .addPath("/contract", {
    get: {
      tags: [TAGS.USAGE],
      summary: "ERC20 contract information",
      parameters: [
        parameterChain,
        parameterString("address"),
        parameterString("symbol"),
        parameterString("name"),
        ...timestampFilter,
        ...blockFilter,
        parameterLimit,
      ],
      responses: {
        200: { description: "Array of contracts", content: { "application/json": { example: contract_example, schema: { type: "array" } } } },
        400: { description: "Bad request" },
      },
    },
  })
  .addPath("/balance", {
    get: {
      tags: [TAGS.USAGE],
      summary: "ERC20 balance changes",
      parameters: [
        parameterChain,
        parameterString("owner"),
        parameterString("contract"),
        parameterString("transaction_id"),
        ...timestampFilter,
        ...blockFilter,
        parameterLimit,
      ],
      responses: {
        200: { description: "Array of balance changes", content: { "application/json": { example: balance_example, schema: { type: "array" } } } },
        400: { description: "Bad request" },
      },
    },
  })
  .addPath("/health", {
    get: {
      tags: [TAGS.HEALTH],
      summary: "Performs health checks and checks if the database is accessible",
      responses: { 200: { description: "OK", content: { "text/plain": { example: "OK" } } } },
    },
  })
  .addPath("/metrics", {
    get: {
      tags: [TAGS.MONITORING],
      summary: "Prometheus metrics",
      responses: { 200: { description: "Prometheus metrics", content: { "text/plain": { example: await registry.metrics(), schema: { type: "string" } } } } },
    },
  })
  .addPath("/openapi", {
    get: {
      tags: [TAGS.DOCS],
      summary: "OpenAPI specification",
      responses: { 200: { description: "OpenAPI JSON Specification", content: { "application/json": { schema: { type: "string" } } } } },
    },
  })
  .getSpecAsJson();