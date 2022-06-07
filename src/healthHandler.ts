/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ChainData, Healths } from "./manualDeps";
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
      network: "mainnet",
      chainHeadBlock: 1,
      latestBlock: { number: "1" },
      lastHealthyBlock: null,
      syncedBlock: 1,
      url: `foobuzz`,
      fatalError: undefined,
      health: "healthy",
      synced: true,
    };
    return { ...chain, data: { ...fakeStatus } };
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function handleOpts(headers: Headers) {
  const newHeaders: Headers = new Headers();
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
    newHeaders.append("Allow", "GET, HEAD, POST, OPTIONS");
  }
  return newHeaders;
}

export async function apiRequestHandler(
  responseBody: string,
  headers: Headers
): Promise<Response> {
  handleOpts(headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  headers.set("Access-Control-Max-Age", "86400");
  const res = new Response(responseBody, { headers: headers });
  return res;
}

type KvHealth = {
  [key: number]: string;
};
export async function getHealthFromKV(): Promise<KvHealth> {
  //Store called HEALTHS key called health
  //@ts-ignore
  const kvhealth = await HEALTHS.get("health");
  return JSON.parse(kvhealth) as KvHealth;
}
export async function handleSingle(
  headers: Headers,
  chainIds: string
): Promise<Response> {
  //single health
  const healths = await getHealthFromKV();
  const chainId = parseInt(chainIds);
  if (!chainId) {
    throw "not a chainId";
  }
  const mutatedProviderArry = [];

  if (healths[chainId] === undefined) {
    return new Response(`No subgraph for ${chainId}`, { headers: headers });
  }
  const chainHealths: ChainData[] = JSON.parse(healths[chainId]);
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

export async function handleHealthRequest(
  req: Request
): Promise<Response | undefined> {
  let headers: Headers = new Headers();

  if (req.method === "OPTIONS") {
    headers = handleOpts(req.headers);
  }

  //@ts-ignore
  const kvhealth = await HEALTHS.get("health");
  if (!kvhealth) {
    Error("couldnt fetch from kv store");
    return new Response(`couldnt fetch kv`, { headers: headers });
  }
  const healths = await getHealthFromKV();

  //parse out the query params
  const url = new URL(req.url);
  const queryString = url.search.slice(1).split("?");

  if (queryString && queryString.toString().includes("chainId=")) {
    //length of "chainId="
    const chainIds = decodeURIComponent(queryString.toString().substring(8));
    const chainIDHealths: Healths = {};

    //all healths across chainId by provider []
    //multiple chains requested, split by , ie chainId
    if (chainIds.includes(",")) {
      const chains = chainIds.split(",");
      //get corresponding chains
      for (const chain of chains) {
        const chainId = parseInt(chain);
        const mutatedProviderArry = [];

        if (healths[chainId] === undefined) {
          return new Response(`No subgraph for ${chainId}`, {
            headers: headers,
          });
        }
        const chainHealths: ChainData[] = JSON.parse(healths[chainId]);

        if (chainHealths.length > 0) {
          for (const provider of chainHealths) {
            const mutatedData = mutateSubgraphHealth(provider);
            mutatedProviderArry.push(mutatedData);
          }
        } else {
          const mutData = mutateSubgraphHealth(chainHealths);
          mutatedProviderArry.push(mutData);
        }
        chainIDHealths[chainId] = JSON.stringify(mutatedProviderArry);
        // console.log(mutatedProviderArry);
        // const res = new Response(JSON.stringify(mutatedProviderArry));
        // const chainHealths = healths[chainId];

        // if (!chainHealths) {
        //   return new Response(`No subgraph for ${chainId}`, {
        //     headers: headers,
        //   });
        // }

        // chainIDHealths[chainId] = chainHealths;
      }
      console.log("CHAINIDHEALTHS", chainIDHealths);
      const res = new Response(JSON.stringify(chainIDHealths), {
        headers: headers,
      });

      res.headers.set("Access-Control-Allow-Origin", "*");
      res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
      res.headers.set("Access-Control-Max-Age", "86400");

      return res;
    } else {
      const res = await handleSingle(headers, chainIds);
      return res;
    }
    //  {
    //       const h: Headers = new Headers();
    //       h.set("Allow", "GET, HEAD, POST, OPTIONS");
    //       h.set("Access-Control-Allow-Origin", "*");
    //       h.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
    //       h.set("Access-Control-Max-Age", "86400");

    //       const res = new Response(kvhealth, { headers: h });

    //       return res;
    //     }
  }
}
