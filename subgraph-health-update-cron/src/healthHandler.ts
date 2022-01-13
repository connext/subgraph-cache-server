/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { SubgraphHealth, getSubgraphHealth, Healths } from './manualDeps'

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

export async function handleHealthRequest(uri: string): Promise<Response> {
  //@ts-ignore
  const kvhealth = await HEALTHS.get('health')
  if (!kvhealth) {
    Error('couldnt fetch from kv store')
  }
  //parse out the query params
  const url = new URL(uri)
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
        const mutatedProviderArry = []

        if (!chainHealths) {
          return new Response(`No subgraph for ${chainId}`)
        }

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

      if (healths[chainId] === undefined) {
        return new Response(`No subgraph for ${chainId}`)
      }
      const chainHealths = JSON.parse(healths[chainId])

      for (const provider of chainHealths) {
        // console.log(typeof(providers));
        const mutatedData = mutateSubgraphHealth(provider)
        mutatedProviderArry.push(mutatedData)
      }
      console.log(mutatedProviderArry)
      return new Response(JSON.stringify(mutatedProviderArry))
    }
  } else {
    //raw healths
    return new Response(kvhealth)
  }
}
