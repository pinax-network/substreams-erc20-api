# [`Substreams`](https://substreams.streamingfast.io/) ERC20 API

## REST API

| Pathname                                                                                        | Description                                             |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| GET `/`                                                                                         | Banner                                                  |
| GET `/supply?address=<contract address>&block=<Optional Block Number>`                          | Returns the total supply of a contract                  |
| GET `/contract?address=<contract address>`                                                      | Returns Contract information (name,symbol,decimals)     |
| GET `/balance?wallet?<wallet address>&address=<contract address>&block=<Optional Block Number>` | Returns the wallet balance                              |
| GET `/openapi`                                                                                  | [OpenAPI v3 JSON](https://spec.openapis.org/oas/v3.0.0) |
| GET `/swagger`                                                                                  | [Swagger UI](https://swagger.io/resources/open-api/)    |

## Requirements

- [Clickhouse](clickhouse.com/)

Additionnaly to pull data directly from a substream:

- [Substreams Sink Clickhouse](https://github.com/pinax-network/substreams-sink-clickhouse/)

## Quickstart

```console
$ bun install
$ bun dev
```

## [`Bun` Binary Releases](https://github.com/pinax-network/substreams-sink-websockets/releases)

> Linux Only

```console
$ wget https://github.com/pinax-network/substreams-erc20-api/releases/download/v0.0.1/substreams-erc20-api
$ chmod +x ./substreams-erc20-api
```

## `.env` Environment variables

```env
# Optional
PORT=8080
HOSTNAME=localhost
DB_HOST=http://localhost:8123
DB_NAME=demo
DB_USERNAME=default
DB_PASSWORD=
```

## Help

```console
$ ./substreams-erc20-api --help
Usage: substreams-erc20-api [options]

Timestamps <> Block numbers conversion for your favorite chains

Options:
  --port <int>                     Server listen on HTTP port (default: "8080", env: PORT)
  --hostname <string>              Server listen on HTTP hostname (default: "localhost", env: HOST)
  --db-host <string>               Clickhouse DB HTTP hostname (default: "http://localhost:8123", env: dbHost)
  --name <string>                  Clickhouse DB table name (default: "demo", env: DB_NAME)
  --username <string>              Clickhouse DB username (default: "default", env: DB_USERNAME)
  --password <string>              Clickhouse DB password (default: "", env: DB_PASSWORD)
  --max-elements-queried <string>  Maximum number of query elements when using arrays as parameters (default: 10, env: MAX_ELEMENTS_QUERIED)
  --verbose <boolean>              Enable verbose logging (default: false, env: VERBOSE)
  -V, --version                    output the version number
  -h, --help                       display help for command
```

## Docker environment

Pull from GitHub Container registry

```bash
docker pull ghcr.io/pinax-network/substreams-erc20-api:latest
```

Build from source

```bash
docker build -t substreams-erc20-api .
```

Run with `.env` file

```bash
docker run -it --rm --env-file .env ghcr.io/pinax-network/substreams-erc20-api
```
