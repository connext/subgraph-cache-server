import { SubgraphHealth, getSubgraphHealth, Healths } from './manualDeps'

export const getSubgraphName = (url: string):string => {
    const split = url.split('/')
    return split[split.length - 1]
  }
  
export async function getCrosschainHealth(): Promise<Healths | void> {
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
                urlStatuses.push(status)
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

export async function handleCronJob(): Promise<void> {
  const healths = await getCrosschainHealth()
  //@ts-ignore
  await HEALTHS.put('health', JSON.stringify(healths))
}
