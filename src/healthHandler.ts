/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Healths } from "./manualDeps";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function handleOpts(headers: Headers) {
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    const respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      "Access-Control-Allow-Headers": headers.get(
        "Access-Control-Request-Headers"
      ),
    };
    respHeaders;
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    };
  }
}

export async function handleHealthRequest(req: Request): Promise<Response> {
  let headers;

  if (req.method === "OPTIONS") {
    headers = handleOpts(req.headers);
  }

  //@ts-ignore
  const kvhealth = await HEALTHS.get("health");
  if (!kvhealth) {
    Error("couldnt fetch from kv store");
  }
  //parse out the query params
  const url = new URL(req.url);
  const queryString = url.search.slice(1).split("?");

  if (queryString && queryString.toString().includes("chainId=")) {
    //length of "chainId="
    const chainIds = decodeURIComponent(queryString.toString().substring(8));
    const chainIDHealths: Healths = {};
    //all healths across chainId by provider []
    const healths = JSON.parse(kvhealth);
    //multiple chains requested, split by , ie chainId
    const chains = chainIds.split(",");
    //get corresponding chains
    for (const chain of chains) {
      const chainId = parseInt(chain);
      if (!chainId) {
        return new Response(`Not a chainId: ${chain}`, headers);
      }

      const chainHealths = healths[chainId];
      if (!chainHealths) {
        return new Response(`No subgraph for ${chainId}`, headers);
      }
      const parsedHealths = JSON.parse(chainHealths);

      const network =
        parsedHealths[0].data.indexingStatusForCurrentVersion.chains[0].network;
      let chainHeadBlock = -1;
      const subgraphs = [];
      for (const subgraph of parsedHealths) {
        const info = subgraph.data.indexingStatusForCurrentVersion;
        const blockNumbers = info.chains[0];
        const headBlock = Number(blockNumbers.chainHeadBlock.number);
        if (!isNaN(headBlock) && headBlock > chainHeadBlock) {
          chainHeadBlock = headBlock;
        }
        subgraphs.push({
          localHeadBlock: headBlock,
          fatalError: info.fatalError,
          syncedBlock: Number(blockNumbers.latestBlock.number),
          url: subgraph.url,
        });
      }

      chainIDHealths[chainId] = JSON.stringify({
        network,
        chainHeadBlock,
        subgraphs,
      });
    }

    const res = new Response(JSON.stringify(chainIDHealths), headers);

    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
    res.headers.set("Access-Control-Max-Age", "86400");

    return res;
  } else {
    //raw healths
    const res = new Response(kvhealth, headers);
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
    res.headers.set("Access-Control-Max-Age", "86400");
    return res;
  }
}
