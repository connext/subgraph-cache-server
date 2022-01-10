/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  getDeployedSubgraphUri,
  getSubgraphHealth,
  Healths, GET_SUBGRAPH_HEALTH_URL
} from './manualDeps'
const CHAINS_TO_MONITOR = [1, 4, 5, 42]

async function getHealthByUri(uri: string) {
  const length = uri.length
  const last = uri.lastIndexOf('/')
  const subgraph = uri.substring(last + 1, length)

  console.log(`call url @ ${uri}`)
  console.log(`wtih subgraph name ${subgraph}`)
  const health = await getSubgraphHealth(subgraph, uri)
  return health ? health : undefined
}
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
      console.log(`ChainID: ${chain.chainId}: SubgraphURL ${subgraphUrls}`);
      if(subgraphUrls === undefined){
        console.log(`no configured subgraphs for this chain`)
        return healthsByChainId[chain.chainId] = JSON.stringify({data: undefined});
      }
      if (subgraphUrls) {
        //statues for all urls 
        const urlStatuses:string[] = [];
        await Promise.all(
          subgraphUrls.map(async (subgraphUrl: string) => {
            try {
              const status = await getSubgraphHealth(
                getSubgraphName(subgraphUrl),
                subgraphUrl
              )
              if(status){
              status.url = subgraphUrl;
              console.log('status: ', status);
              urlStatuses.push(JSON.stringify(status));
              console.log(urlStatuses);
              }
            } catch (err) {
              console.error(
                `Error getting health for subgraph ${subgraphUrl}: `,
                err,
              )
            }
              healthsByChainId[chain.chainId] = JSON.stringify([urlStatuses])
          }),
        )
      }
    }),
  )

  return healthsByChainId
}

async function getHealthForAllChains() {
  const healthsByChainId: Healths = {}

  for (const chainId of CHAINS_TO_MONITOR) {
    const uris = getDeployedSubgraphUri(chainId)
    const chainHealths: string[] = []
    for (const uri of uris) {
      const chainHealth = await getHealthByUri(uri)
      if (chainHealth) {
        chainHealths.push(JSON.stringify({ url: uri, health: chainHealth }))
      } else {
        console.log(`no chain health available`)
        chainHealths.push(JSON.stringify({ url: uri, health: 'null' }))
      }
    }
    healthsByChainId[chainId] = JSON.stringify(chainHealths)
  }
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
      console.log(JSON.stringify(chainIDHealths))
      return new Response(JSON.stringify(chainIDHealths))
    } else {
      //single health
      const cid = decodeURIComponent(queryString.toString().substring(8))
      const health = JSON.parse(kvhealth)
      return new Response(health[parseInt(cid)])
    }
  } else {
    //all healths
    return new Response(kvhealth)
  }
}

export async function handleCronJob() {
  const healths = await getCrosschainHealth()
  //@ts-ignore
  await HEALTHS.put('health', JSON.stringify(healths))
}
