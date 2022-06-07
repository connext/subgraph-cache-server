/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ChainData, Healths } from "./manualDeps";
import { mutateSubgraphHealth, getHealthFromKV } from "./healthKv";
import { apiResponseHandler, handleOpts } from "./apiResponse";

enum HealthEndpointErrors {
  MalformedChainId = "Couldn't get a chainId number from your request",
  NoHealthForChainId = "We don't keep track of the health of one or more of the chainIds you requested",
  NoKVStore = "Couldn't fetch and validate kvstore",
}
export async function handleSingle(
  headers: Headers,
  cid: string
): Promise<Response> {
  const chainId = parseInt(cid);

  if (!chainId) {
    return apiResponseHandler(HealthEndpointErrors.MalformedChainId, headers);
  }
  const healths = await getHealthFromKV();

  if (healths[chainId] === undefined) {
    return apiResponseHandler(HealthEndpointErrors.NoHealthForChainId, headers);
  }
  const mutatedProviderArry = [];
  const chainHealths: ChainData[] = JSON.parse(healths[chainId]);
  if (chainHealths.length > 0) {
    //here we breakdown health across many subg providers for a particular chainId
    for (const provider of chainHealths) {
      const mutatedData = mutateSubgraphHealth(provider);
      mutatedProviderArry.push(mutatedData);
    }
  } else {
    const mutData = mutateSubgraphHealth(chainHealths);
    mutatedProviderArry.push(mutData);
  }
  const res = await apiResponseHandler(
    JSON.stringify(mutatedProviderArry),
    headers
  );
  return res;
}

export async function handleHealthRequest(
  req: Request
): Promise<Response | undefined> {
  let headers: Headers = new Headers();

  if (req.method === "OPTIONS") {
    headers = handleOpts(req.headers);
  }

  const healths = await getHealthFromKV();
  if (!healths) {
    Error("couldnt fetch from kv store");
    return apiResponseHandler(HealthEndpointErrors.NoKVStore, headers);
  }

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
      }
      const res = await apiResponseHandler(
        JSON.stringify(chainIDHealths),
        headers
      );
      return res;
    } else {
      const res = await handleSingle(headers, chainIds);
      return res;
    }
  }
}
