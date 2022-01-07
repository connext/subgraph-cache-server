/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSubgraphHealth, getSubgraphName } from './manualDeps'

export async function handleUpdateRequest(request: Request): Promise<Response> {
  console.log('request: ', request)
  const chainDataRes = await fetch(
    'https://raw.githubusercontent.com/connext/chaindata/main/crossChain.json',
  )
  const chainData: any = await chainDataRes.json()
  console.log('chainData: ', JSON.stringify(chainData))
  await Promise.all(
    chainData.map(async (chain: { subgraph: string[] }) => {
      const subgraphUrls = chain.subgraph
      await Promise.all(
        subgraphUrls.map(async (subgraphUrl: string) => {
          try {
            const status = await getSubgraphHealth(
              getSubgraphName(subgraphUrl),
              subgraphUrl,
            )
            console.log('status: ', status)
            // save status to kv store
          } catch (err) {
            console.error(`Error getting health for subgraph ${subgraphUrl}: `, err)
          }
        }),
      )
    }),
  )
  const status = await getSubgraphHealth(
    getSubgraphName("https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-bsc-v1-runtime"),
    "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-bsc-v1-runtime",
  )
  console.log('status: ', JSON.stringify(status))
  // const value = await HEALTH.get("first-key")
  // const value = 'he'
  // if (value === null) {
  //   return new Response("Value not found", {status: 404})
  // }
  //@ts-ignore
  // await HEALTHS.put('subghealth', 'healthy')
  // @ts-ignore
  // const res = await HEALTHS.get('subghealth')
  // return new Response(res)
  return new Response()
}
