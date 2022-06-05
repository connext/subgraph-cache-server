/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getCrosschainHealth, handleCronJob } from './cronHandler'
import { Healths } from './manualDeps'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function handleOpts(headers:Headers) {

  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    const respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      'Access-Control-Allow-Headers': headers.get(
      'Access-Control-Request-Headers',
      ),
    }
    respHeaders
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS',
      }
  }
}
}


const mutateSubgraphHealth = (chain: any) => {
  console.log(chain)
  const needsMutation = chain.data.indexingStatusForCurrentVersion.chains[0]
  const mutatedStatus = {
    ...needsMutation,
    chainHeadBlock: Number(needsMutation.chainHeadBlock.number),
    syncedBlock: Number(needsMutation.latestBlock.number),
  }
  return { ...chain, data: { ...mutatedStatus } }
}

export async function handleHealthRequest(req: Request): Promise<Response> {
  let headers; 

  if (req.method === "OPTIONS"){
     headers = handleOpts(req.headers);
  }

  //@ts-ignore
  const kvhealth = await HEALTHS.get('health')
  if (!kvhealth) {
    Error('couldnt fetch from kv store')
  }
  //parse out the query params
  const url = new URL(req.url)
  const queryString = url.search.slice(1).split('?')

  if (queryString && queryString.toString().includes('chainId=')) {
    //length of "chainId="
    const chainIds = decodeURIComponent(queryString.toString().substring(8))
    const chainIDHealths: Healths = {}
    //all healths across chainId by provider []
    const healths = JSON.parse(kvhealth)
    //multiple chains requested, split by , ie chainId
    if (chainIds.includes(',')) {
      const chains = chainIds.split(',')
      //get corresponding chains
      for (const chain of chains) {
        const chainId = parseInt(chain)
        const chainHealths = healths[chainId]
        console.log('chainHealths: ', chainHealths);
        const mutatedProviderArry = []
    
        if (!chainHealths) {
          return new Response(`No subgraph for ${chainId}`, headers)
        }

        for (const provider of JSON.parse(chainHealths)) {
          // console.log(typeof(providers));
          const mutatedData = mutateSubgraphHealth(provider)
          mutatedProviderArry.push(mutatedData)
        }
        chainIDHealths[chainId] = JSON.stringify(mutatedProviderArry)
      }

      const res = new Response(JSON.stringify(chainIDHealths), headers);

      res.headers.set("Access-Control-Allow-Origin", "*");
      res.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS');
      res.headers.set('Access-Control-Max-Age', '86400');

      return res;

    } else {
      //single health
      const chainId = parseInt(chainIds)
      if (!chainId) {
        throw 'not a chainId'
      }
      const mutatedProviderArry = []

      if (healths[chainId] === undefined) {
        return new Response(`No subgraph for ${chainId}`, headers)
      }
      console.log('healths[chainId]: ', healths[chainId]);
      const chainHealths = JSON.parse(healths[chainId])
      console.log('chainHealths: ', chainHealths);

      for (const provider of chainHealths) {
        // console.log(typeof(providers));
        const mutatedData = mutateSubgraphHealth(provider)
        mutatedProviderArry.push(mutatedData)
      }
      console.log(mutatedProviderArry);
      const res =  new Response(JSON.stringify(mutatedProviderArry));

      res.headers.set("Access-Control-Allow-Origin", "*");
      res.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS');
      res.headers.set('Access-Control-Max-Age', '86400');

      return res;
    }
  } else {
    const res =  new Response(kvhealth, headers);
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS');
    res.headers.set('Access-Control-Max-Age', '86400');
    return res;
  }
}

