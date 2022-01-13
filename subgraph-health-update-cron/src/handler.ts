/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  SubgraphHealth,
  getSubgraphHealth,
  Healths,
} from './manualDeps'

export const getSubgraphName = (url: string) => {
  const split = url.split('/')
  return split[split.length - 1]
}
const mutateSubgraphHealth = (chain: any) => {
  console.log(chain)
  const needsMutation = chain.data.indexingStatusForCurrentVersion.chains[0]
  const mutatedStatus = {
    ...needsMutation,
    chainHeadBlock: Number(needsMutation.chainHeadBlock.number),
    latestBlock: Number(needsMutation.latestBlock.number),
  }
  return { ...chain, data: { indexingStatusForCurrentVersion: mutatedStatus } }
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
    //all healths across chainId by provider []
    const healths = JSON.parse(kvhealth)
    //multiple chains requested, split by , ie chainId
    if (chainIds.includes(',')) {
      const chains = chainIds.split(',')
      //get corresponding chains
      for (const chain of chains) {
        const chainId = parseInt(chain)
        if (!chainId) {
          throw 'not a chainId'
        }

        const chainHealths = healths[chainId]
        const mutatedProviderArry = []

        for (const provider of JSON.parse(chainHealths)) {
          // console.log(typeof(providers));
          const mutatedData = mutateSubgraphHealth(provider)
          mutatedProviderArry.push(mutatedData)
        }
        chainIDHealths[chainId] = JSON.stringify(mutatedProviderArry)
      }
      return new Response(JSON.stringify(chainIDHealths))
    } else {
      //single health
      const chainId = parseInt(chainIds)
      if (!chainId) {
        throw 'not a chainId'
      }
      const mutatedProviderArry = []

      const chainHealths = JSON.parse(healths[chainId])
      for (const provider of chainHealths) {
        // console.log(typeof(providers));
        const mutatedData = mutateSubgraphHealth(provider)
        mutatedProviderArry.push(mutatedData)
        
      }
      console.log(mutatedProviderArry);
      return new Response(JSON.stringify(mutatedProviderArry));
    }
  } else {
    //raw healths
    return new Response(kvhealth)
  }
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

export async function handleCronJob() {
  const healths = await getCrosschainHealth()
  //@ts-ignore
  await HEALTHS.put('health', JSON.stringify(healths))
}
