# [`Substreams`](https://substreams.streamingfast.io/) ERC20 API

[![.github/workflows/bun-test.yml](https://github.com/pinax-network/substreams-erc20-api/actions/workflows/bun-test.yml/badge.svg)](https://github.com/pinax-network/substreams-erc20-api/actions/workflows/bun-test.yml)

> ERC-20 Balance, Supply, Contract API

## REST API

| Pathname              | Description                                             |
| ----------------------|-------------------------------------------------------- |
| GET `/`               | [Swagger UI](https://swagger.io/resources/open-api/)
| GET `/chains`         | Available `chains`
| GET `/supply`         | ERC20 total supply
| GET `/contract`       | ERC20 contract information (name,symbol,decimals)
| GET `/balance`        | ERC20 balance changes
| GET `/health`         | Health check
| GET `/metrics`        | Prometheus metrics
| GET `/openapi`        | [OpenAPI v3 JSON](https://spec.openapis.org/oas/v3.0.0)

## Requirements

- [ClickHouse](clickhouse.com/)
- [Substreams Sink ClickHouse](https://github.com/pinax-network/substreams-sink-clickhouse/)

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
# API Server
PORT=8080
HOSTNAME=localhost

# Clickhouse Database
HOST=http://127.0.0.1:8123
DATABASE=default
USERNAME=default
PASSWORD=
MAX_LIMIT=500

# Logging
VERBOSE=true
```

## Help

```console
$ ./substreams-erc20-api --help
Usage: substreams-erc20-api [options]

ERC20 API powered by Substreams

Options:
  -V, --version            output the version number
  -p, --port <number>      HTTP port on which to attach the API (default: "8080", env: PORT)
  -v, --verbose <boolean>  Enable verbose logging (choices: "true", "false", default: false, env: VERBOSE)
  --hostname <string>      Server listen on HTTP hostname (default: "localhost", env: HOSTNAME)
  --host <string>          Database HTTP hostname (default: "http://localhost:8123", env: HOST)
  --username <string>      Database user (default: "default", env: USERNAME)
  --password <string>      Password associated with the specified username (default: "", env: PASSWORD)
  --database <string>      The database to use inside ClickHouse (default: "default", env: DATABASE)
  --max-limit <number>     Maximum LIMIT queries (default: 10000, env: MAX_LIMIT)
  -h, --help               display help for command
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
