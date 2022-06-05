import {
  SubgraphHealth,
  getSubgraphHealth,
  Healths,
  ChainData,
} from "./manualDeps";

export const getSubgraphName = (url: string): string => {
  if (
    url ===
    "https://gateway.thegraph.com/api/3dcfe24f2879bbbb4dd88783c162ecda/subgraphs/id/DfD1tZSmDtjCGC2LeYEQbVzj9j8kNqKAQEsYL27Vg6Sw"
  ) {
    // special case for the mainnet subgraph on decentralized network
    url =
      "https://api.thegraph.com/subgraphs/name/connext/nxtp-mainnet-v1-runtime";
  }
  const split = url.split("/");
  return split[split.length - 1];
};
async function getCrossChainJsonAndParse(): Promise<ChainData[]> {
  const chainDataRes = await fetch(
    "https://raw.githubusercontent.com/connext/chaindata/main/crossChain.json"
  );
  const chainData: ChainData[] = await chainDataRes.json();
  return chainData;
  
}
export async function getCrosschainHealth(): Promise<Healths | void> {
  const healthsByChainId: Healths = {};

  const chainData = await getCrossChainJsonAndParse();
  console.log("chainData: ", JSON.stringify(chainData));
  await Promise.all(
    chainData.map(async (chain: { chainId: number; subgraph: string[] }) => {
      const subgraphs = chain.subgraph;
      console.log(`ChainID: ${chain.chainId}: SubgraphURL ${subgraphs}`);
      //override for mainnet subgraph break
      console.log(`chain.subgraph`, chain.subgraph);
      let override = false;
      if (subgraphs) {
        for (const subg of subgraphs) {
          if (subg.includes('thegraph.com')) {
            override = true;
          }
        }
      }
      if (override) {
        const overrideStatus: SubgraphHealth = {
          chainHeadBlock: 1,
          latestBlock: 1,
          lastHealthyBlock: 1,
          network: "mainnet",
          fatalError: undefined,
          health: "healthy",
          synced: true,
          url: `${chain.subgraph[0]}`,
        };
        return (healthsByChainId[chain.chainId] = JSON.stringify({
          data: overrideStatus,
        }));
      } else if (subgraphs === undefined) {
        console.log(`no configured subgraphs for this chain`);
        return (healthsByChainId[chain.chainId] = JSON.stringify({
          data: undefined,
        }));
      }
      if (subgraphs) {
        //statues for all urls
        const urlStatuses: SubgraphHealth[] = [];

        await Promise.all(
          subgraphs.map(async (subgraphUrl: string) => {
            try {
              console.log(getSubgraphName(subgraphUrl));
              const status = await getSubgraphHealth(
                getSubgraphName(subgraphUrl),
                subgraphUrl
              );
              if (status) {
                status.url = subgraphUrl;
                urlStatuses.push(status);
              }
            } catch (err) {
              console.error(
                `Error getting health for subgraph ${getSubgraphName(
                  subgraphUrl
                )}: `,
                err
              );
            }
            healthsByChainId[chain.chainId] = JSON.stringify(urlStatuses[0]);
          })
        );
      }
    })
  );
  return healthsByChainId;
}

export async function handleCronJob(): Promise<void> {
  const healths = await getCrosschainHealth();
  console.log(JSON.stringify(healths));
  if (healths) {
    //@ts-ignore
    await HEALTHS.put("health", JSON.stringify(healths));
  }
}
