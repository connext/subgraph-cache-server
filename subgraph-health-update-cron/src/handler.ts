/* eslint-disable @typescript-eslint/ban-ts-comment */
import {Router} from 'itty-router';
import { SubgraphSyncRecord } from '@connext/nxtp-utils'
import {
  getSubgraphHealth,
  Healths,
  SubgraphHealth,
} from './manualDeps'

const router = Router();


export const getSubgraphName = (url: string) => {
  const split = url.split('/')
  return split[split.length - 1]
}

export async function getCrosschainHealth() {
  const healthsByChainId: Healths = {}

  const chainDataRes = await fetch(
    'https://raw.githubusercontent.com/connext/chaindata/main/crossChain.json',
  )
  const chainData: any = await chainDataRes.json()
  console.log('chainData: ', JSON.stringify(chainData))
  await Promise.all(
    chainData.map(async (chain: { chainId: number; subgraph: string[] }) => {
      const subgraphUrls = chain.subgraph
      console.log(`ChainID: ${chain.chainId}: SubgraphURL ${subgraphUrls}`)
      if (subgraphUrls === undefined) {
        console.log(`no configured subgraphs for this chain`)
        return (healthsByChainId[chain.chainId] = JSON.stringify({
          data: undefined,
        }))
      }
      if (subgraphUrls) {
        //statues for all urls
        const urlStatuses: SubgraphHealth[] = []
        await Promise.all(
          subgraphUrls.map(async (subgraphUrl: string) => {
            try {
              const status = await getSubgraphHealth(
                getSubgraphName(subgraphUrl),
                subgraphUrl,
              )
              if (status) {
                status.url = subgraphUrl
                console.log('status: ', status)
                urlStatuses.push(status)
                console.log(urlStatuses)
              }
            } catch (err) {
              console.error(
                `Error getting health for subgraph ${subgraphUrl}: `,
                err,
              )
            }
            healthsByChainId[chain.chainId] = JSON.stringify(urlStatuses)
          }),
        )
      }
    }),
  )
  return healthsByChainId
}



export async function handleHealthRequest(request: Request): Promise<Response> {
  //@ts-ignore
  const kvhealth = await HEALTHS.get('health')
  if (!kvhealth) {
    Error('couldnt fetch from kv store')
  }
  //parse out the query params
  const url = new URL(request.url)
  const queryString = url.search.slice(1).split('?')

  if (queryString && queryString.toString().includes('chainId=')) {
    //length of "chainId="
    const chainIds = decodeURIComponent(queryString.toString().substring(8))
    const chainIDHealths: Healths = {}
    if (chainIds.includes(',')) {
      const chains = chainIds.split(',')
      const healths = JSON.parse(kvhealth)

      //get corresponding chains
      for (const chain of chains) {
        const chainId = parseInt(chain)
        // console.log(`chainId: ${parseInt(chain)}`);
        const chainHealth = healths[chainId]
        chainIDHealths[chainId] = chainHealth
      }
      const obj = JSON.parse(chainIDHealths[1])
      //@ts-ignore
      const data = obj[0].data.indexingStatusForCurrentVersion.chains;

      const mutateSubgraphHealth = (chains:any) =>{
        for(const chain of chains){
          // {
          //   "chainHeadBlock": {
          //     "number": "13983587"
          //   },
          //   "lastHealthyBlock": null,
          //   "latestBlock": {
          //     "number": "13983587"
          //   },
          //   "network": "mainnet"
          // }
          console.log((chain));
        }
      }
      //input chains
      console.log(mutateSubgraphHealth(data));
      return new Response(JSON.stringify(data));

    } else {
      //single health
      const cid = decodeURIComponent(queryString.toString().substring(8))
      const health = JSON.parse(kvhealth)
      const singleHealth = health[parseInt(cid)]
      return new Response(JSON.stringify(singleHealth));
    }
  } else {
    //all healths
    return new Response(kvhealth)
  }
}

async function tittyHandler(request:Request){
  console.log("TITTIESDHKSHDLJHSFDLUFDLSHJHFD")
}

export async function handleCronJob() {
  const healths = await getCrosschainHealth()
  //@ts-ignore
  await HEALTHS.put('health', JSON.stringify(healths))
}

  router.get('/',  async (req:Request)=>{   await handleHealthRequest(req)});
  router.get('/analytics',  async (req:Request)=>{ await tittyHandler(req)});
  router.get('/ff', () => new Response("found tho", { status: 404 }));

export  async function fetchMiddlewareHandler(request:Request):Promise<Response>{
    console.log(`middleware ${request}`)
    router.handle(request);
    return new Response('foundfound', {status: 400});
  
}