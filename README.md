## Testing Locally

Make sure you have @cloudflare/wrangler installed globally:

`npm install -g @cloudflare/wrangler`

Local development (point querys to localhost):

**Start dev server:**
`wrangler dev`

**Curl local server test:**
`curl http://127.0.0.1:8787/subgraph_health/?chainId=1,42`

**Start remote preview server:**
`wrangler preview`


## Subgraph CF Worker API
Purpose: To cache livliness of subgraph health endpoints used for NXTP.

# Deployed To:
**URL**:  https://subgraph-ts-worker.connext.workers.dev/subgraph_health/

# Get All Health

Get the health of all ChainID's subgraphs.

**URL** : `/`

**Method** : `GET`

## Success Response

**Code** : `200 OK`


# Get Health for n ChainIDs

Get health for specified comma seperated chainIDs

**URL**: `/?chainId=<comma seperated chainIDs>`
**Method** : `GET`

**Example**:
`/?chainId=1,4,5`

## Success Response

**Code** : `200 OK`


## Notes

* if any one of the chainIds is not available it will throw error: `No subgraph health for ChainId <n>`
