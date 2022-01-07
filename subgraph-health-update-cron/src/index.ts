/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { handleHealthRequest } from './handler'
import { getSubgraphHealth } from './manualDeps'
const CHAINS_TO_MONITOR = [1, 4, 5, 42]
// const TEST = process.env.TEST;
const TEST = false

interface Healths {
  [key: number]: string[]
}

const getHealthByUri = async (uri: string) => {
  const length = uri.length
  const last = uri.lastIndexOf('/')
  const subgraph = uri.substring(last + 1, length)

  console.log(`call url @ ${uri}`)
  console.log(`wtih subgraph name ${subgraph}`)
  const health = await getSubgraphHealth(subgraph, uri)
  return health ? health : undefined
}

// TODO: pull subgraphs from crossChain.json
// const getHealthForAllChains = async () => {
//   const healthsByChainId: Healths = {}

//   for (const chainId of CHAINS_TO_MONITOR) {
//     const uris = getDeployedSubgraphUri(chainId)
//     const chainHealths: string[] = []
//     for (const uri of uris) {
//       const chainHealth = await getHealthByUri(uri)
//       if (chainHealth) {
//         chainHealths.push(JSON.stringify({ url: uri, health: chainHealth }))
//       } else {
//         console.log(`no chain health available`)
//         chainHealths.push(JSON.stringify({ url: uri, health: 'null' }))
//       }
//     }
//     healthsByChainId[chainId] = chainHealths
//   }
//   return healthsByChainId
// }

const init = async () => {
  // setInterval(async()=>{
  console.log('setting health')

  // const healths = await getHealthForAllChains()
  //@ts-ignore
  await HEALTHS.set('health', JSON.stringify(healths))

  // }, 5000);
}

export async function makeServer() {
  await init()
}

//broken query
async function tryaxios() {
  try {
    const res = await fetch(
      'https://connext.bwarelabs.com/bsc/index-node/graphql',
      {
        method: 'post',
        body: JSON.stringify({
          query: `{
        indexingStatusForCurrentVersion(subgraphName: "connext/nxtp-mainnet-v1-runtime") {
          health
          synced
          fatalError {
            message
            block {
              number
            }
            handler
          }
          chains {
            network
            chainHeadBlock {
              number
            }
            latestBlock {
              number
            }
            lastHealthyBlock {
              number
            }
          }
        }
      }`,
        }),
      },
    )
    console.log('res: ', JSON.stringify(await res.json()))
    return new Response("hello")
  } catch (e) {
    console.log('e: ', e)
    console.log(`query error`, e)
  }
}
// makeServer();

addEventListener('fetch', async (event) => {
  // event.respondWith(handleHealthRequest(event.request))
  //@ts-ignore
  // HEALTHS.get('subghealth')
  //this query is broken
  event.respondWith(tryaxios())
})
