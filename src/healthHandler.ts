/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ChainData, Healths } from "./manualDeps";
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

const mutateSubgraphHealth = (chain: any) => {
  if (chain.data?.indexingStatusForCurrentVersion) {
    const needsMutation = chain.data.indexingStatusForCurrentVersion.chains[0];
    const mutatedStatus = {
      ...needsMutation,
      chainHeadBlock: Number(needsMutation.chainHeadBlock.number),
      syncedBlock: Number(needsMutation.latestBlock.number),
    };
    return { ...chain, data: { ...mutatedStatus } };
  } else {
    const fakeStatus = {
      chainHeadBlock: 1,
      latestBlock: 1,
      lastHealthyBlock: 1,
      network: "mainnet",
      fatalError: undefined,
      health: "healthy",
      synced: true,
      url: `foobar`,
    };
    return { ...chain, data: { ...fakeStatus } };
  }
};

export async function handleHealthRequest(req: Request): Promise<Response> {
  let headers;

  if (req.method === "OPTIONS") {
    headers = handleOpts(req.headers);
  }

  //@ts-ignore
  const kvhealth = await HEALTHS.get("health");
  if (!kvhealth) {
    Error("couldnt fetch from kv store");
    return new Response(`couldnt fetch kv`, headers);
  }
  const healths = JSON.parse(kvhealth);

  //parse out the query params
  const url = new URL(req.url);
  const queryString = url.search.slice(1).split("?");

  if (queryString && queryString.toString().includes("chainId=")) {
    //length of "chainId="
    const chainIds = decodeURIComponent(queryString.toString().substring(8));
    const chainIDHealths: Healths = {};

    const mutatedProviderArry = [];

    //all healths across chainId by provider []
    console.log(healths);
    //multiple chains requested, split by , ie chainId
    if (chainIds.includes(",")) {
      const chains = chainIds.split(",");
      //get corresponding chains
      for (const chain of chains) {
        const chainId = parseInt(chain);
        const chainHealths = healths[chainId];

        if (!chainHealths) {
          return new Response(`No subgraph for ${chainId}`, headers);
        }
        // if (chainId === 1) {
        //   const fakeData = {
        //     chainHeadBlock: 1,
        //     latestBlock: 1,
        //     lastHealthyBlock: 1,
        //     network: "mainnet",
        //     fatalError: undefined,
        //     health: "healthy",
        //     synced: true,
        //     url: `${chain[0]}`,
        //   };
        //   mutatedProviderArry.push(fakeData);
        // }
        chainIDHealths[chainId] = chainHealths;
      }

      const res = new Response(JSON.stringify(chainIDHealths), headers);

      res.headers.set("Access-Control-Allow-Origin", "*");
      res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
      res.headers.set("Access-Control-Max-Age", "86400");

      return res;
    } else {
      //single health
      const chainId = parseInt(chainIds);
      if (!chainId) {
        throw "not a chainId";
      }
      const mutatedProviderArry = [];

      if (healths[chainId] === undefined) {
        return new Response(`No subgraph for ${chainId}`, headers);
      }
      const chainHealths:ChainData[] = JSON.parse(healths[chainId]);
      if (chainHealths.length > 0) {
        for (const provider of chainHealths) {
          const mutatedData = mutateSubgraphHealth(provider);
          mutatedProviderArry.push(mutatedData);
        }
      } else {
        const mutData = mutateSubgraphHealth(chainHealths);
        mutatedProviderArry.push(mutData);
      }
      console.log(mutatedProviderArry);
      const res = new Response(JSON.stringify(mutatedProviderArry));

      res.headers.set("Access-Control-Allow-Origin", "*");
      res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
      res.headers.set("Access-Control-Max-Age", "86400");

      return res;
    }
  } else {
    const res = new Response(kvhealth, headers);
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
    res.headers.set("Access-Control-Max-Age", "86400");
    return res;
  }
}
