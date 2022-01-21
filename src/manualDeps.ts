//shim for types /fn() that we cant import from nxtp-utils for some reason
export interface Healths{
  [key:number] : string
}
export const getDeployedSubgraphUri = (chainId: number, chainData?: Map<string, ChainData>): string[] => {
    if (chainData) {
      const subgraph = chainData?.get(chainId.toString())?.subgraph;
      if (subgraph) {
        return subgraph;
      }
    }
    switch (chainId) {
      // testnets
      case 3:
        return ["https://api.thegraph.com/subgraphs/name/connext/nxtp-ropsten-v1-runtime"];
      case 4:
        return ["https://api.thegraph.com/subgraphs/name/connext/nxtp-rinkeby-v1-runtime"];
      case 5:
        return ["https://api.thegraph.com/subgraphs/name/connext/nxtp-goerli-v1-runtime"];
      case 42:
        return ["https://api.thegraph.com/subgraphs/name/connext/nxtp-kovan-v1-runtime"];
      case 69:
        return ["https://api.thegraph.com/subgraphs/name/connext/nxtp-optimism-kovan-v1-runtime"];
      case 97:
        return ["https://api.thegraph.com/subgraphs/name/connext/nxtp-chapel-v1-runtime"];
      case 80001:
        return ["https://api.thegraph.com/subgraphs/name/connext/nxtp-mumbai-v1-runtime"];
      case 421611:
        return ["https://api.thegraph.com/subgraphs/name/connext/nxtp-arbitrum-rinkeby-v1-runtime"];
  
      // mainnets
      case 1:
        return [
          "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-mainnet-v1-runtime",
          "https://api.thegraph.com/subgraphs/name/connext/nxtp-mainnet-v1-runtime",
        ];
      case 10:
        return [
          "https://api.thegraph.com/subgraphs/name/connext/nxtp-optimism-v1-runtime",
          "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-optimism-v1-runtime",
        ];
      case 56:
        return [
          "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-bsc-v1-runtime",
          "https://api.thegraph.com/subgraphs/name/connext/nxtp-bsc-v1-runtime",
        ];
      case 100:
        return [
          "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-xdai-v1-runtime",
          "https://api.thegraph.com/subgraphs/name/connext/nxtp-xdai-v1-runtime",
        ];
      case 122:
        return ["https://api.thegraph.com/subgraphs/name/connext/nxtp-fuse-v1-runtime"];
      case 137:
        return [
          "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-matic-v1-runtime",
          "https://api.thegraph.com/subgraphs/name/connext/nxtp-matic-v1-runtime",
        ];
      case 250:
        return [
          "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-fantom-v1-runtime",
          "https://api.thegraph.com/subgraphs/name/connext/nxtp-fantom-v1-runtime",
        ];
      case 1284:
        return [
          "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-moonbeam-v1-runtime",
        ];
      case 1285:
        return [
          "https://api.thegraph.com/subgraphs/name/connext/nxtp-moonriver-v1-runtime",
          "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-moonriver",
        ];
      case 42161:
        return [
          "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-arbitrum-one-v1-runtime",
          "https://api.thegraph.com/subgraphs/name/connext/nxtp-arbitrum-one-v1-runtime",
        ];
      case 43114:
        return [
          "https://connext.bwarelabs.com/subgraphs/name/connext/nxtp-avalanche-v1-runtime",
          "https://api.thegraph.com/subgraphs/name/connext/nxtp-avalanche-v1-runtime",
        ];
      default:
        return [];
    }
  };

  export type ChainData = {
    name: string;
    chainId: number;
    confirmations: number;
    shortName: string;
    chain: string;
    network: string;
    networkId: number;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: string;
    };
    assetId: Record<
      string,
      {
        symbol: string;
        mainnetEquivalent?: string;
        decimals?: number;
      }
    >;
    rpc: string[];
    subgraph: string[];
    analyticsSubgraph?: string[];
    faucets: string[];
    infoURL: string;
    gasStations: string[];
    explorers: {
      name: string;
      url: string;
      icon: string;
      standard: string;
    }[];
  };

  export const GET_SUBGRAPH_HEALTH_URL = (url: string): string | undefined => {
    if (url.includes('connext.bwarelabs.com/subgraphs/name/connext/nxtp-bsc')) {
      return 'https://connext.bwarelabs.com/bsc/index-node/graphql'
    } else if (
      url.includes('connext.bwarelabs.com/subgraphs/name/connext/nxtp-mainnet')
    ) {
      return 'https://connext.bwarelabs.com/ethereum/index-node/graphql'
    } else if (
      url.includes('connext.bwarelabs.com/subgraphs/name/connext/nxtp-xdai')
    ) {
      return 'https://connext.bwarelabs.com/xdai/index-node/graphql'
    } else if (
      url.includes('connext.bwarelabs.com/subgraphs/name/connext/nxtp-matic')
    ) {
      return 'https://connext.bwarelabs.com/matic/index-node/graphql'
    } else if (
      url.includes('connext.bwarelabs.com/subgraphs/name/connext/nxtp-fantom')
    ) {
      return 'https://connext.bwarelabs.com/fantom/index-node/graphql'
    } else if (
      url.includes('connext.bwarelabs.com/subgraphs/name/connext/nxtp-moonriver')
    ) {
      return 'https://connext.bwarelabs.com/moonriver/index-node/graphql'
    } else if (
      url.includes('connext.bwarelabs.com/subgraphs/name/connext/nxtp-avalanche')
    ) {
      return 'https://connext.bwarelabs.com/avalanche/index-node/graphql'
    } else if (
      url.includes('connext.bwarelabs.com/subgraphs/name/connext/nxtp-arbitrum')
    ) {
      return 'https://connext.bwarelabs.com/arbitrum/index-node/graphql'
    } else if (
      url.includes('connext.bwarelabs.com/subgraphs/name/connext/nxtp-moonbeam')
    ) {
      return 'https://connext.bwarelabs.com/moonbeam/index-node/graphql'
    } else if (url.includes('api.thegraph.com/subgraphs/name/connext')) {
      return 'https://api.thegraph.com/index-node/graphql'
    } else if (
      url.includes('subgraphs.connext.p2p.org/subgraphs/name/connext/nxtp-bsc')
    ) {
      return 'https://subgraphs.connext.p2p.org/nxtp-bsc-health-check'
    } else if (
      url.includes('subgraphs.connext.p2p.org/subgraphs/name/connext/nxtp-matic')
    ) {
      return 'https://subgraphs.connext.p2p.org/nxtp-matic-health-check'
    }
    return undefined
  }  

// TODO: Make an actual error type for this?
type SubgraphHealthError = {
    message: string;
    block: number;
    handler: any;
  };
  
  export type SubgraphHealth = {
    chainHeadBlock: number;
    latestBlock: number;
    lastHealthyBlock: number | undefined;
    network: string;
    fatalError: SubgraphHealthError | undefined;
    health:
      | "healthy" // Subgraph syncing normally
      | "unhealthy" // Subgraph syncing but with errors
      | "failed"; // Subgraph halted due to errors
    synced: boolean;
    url: string;
  };
  
  /**
   *
   * @param subgraphName - name of the subgraph, e.g. "nxtp-bsc-v1-runtime"
   * @param url - url of the subgraph, e.g. "nxtp-bsc-v1-runtime"
   *
   * @returns SubgraphHealth object with the following fields:
   * - chainHeadBlock: the latest block number of the chain head
   * - latestBlock: the latest block number of the subgraph
   * - lastHealthyBlock: the latest block number of the subgraph that was healthy
   * - network: the name of the network the subgraph is synced to
   * - fatalError: if the subgraph is in a failed state, this will contain the error
   * - health: the health of the subgraph, one of:
   *   - "healthy": subgraph syncing normally
   *   - "unhealthy": subgraph syncing but with errors
   *   - "failed": subgraph halted due to errors
   * - synced: whether the subgraph is synced to the network
   */
  
  export const getSubgraphHealth = async (subgraphName: string, url: string): Promise<SubgraphHealth | undefined> => {
    const healthUrl = GET_SUBGRAPH_HEALTH_URL(url);
    if (!healthUrl) {
      return undefined;
    }

    const res = await fetch(healthUrl,{
      method: "post",
      body: JSON.stringify({
        query: `{
        indexingStatusForCurrentVersion(subgraphName: "connext/${subgraphName}") {
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
    });
    /**
     * Example res:
     * {
     *   data: {
     *     indexingStatusForCurrentVersion: {
     *       chains: [
     *         {
     *           chainHeadBlock: {
     *             number: "12956365",
     *           },
     *           lastHealthyBlock: undefined,
     *           latestBlock: { hash: "55ef6848b4dd98c6323f2bb1707ed56458c50ed07dab83a836d956425e3776d0", number: "12956202" },
     *           network: "bsc",
     *         },
     *       ],
     *       fatalError: None,
     *       health: "healthy",
     *       synced: true,
     *     },
     *   },
     * }
     */
    if (res) {
      return res.json();
    }
    return undefined;
  };
  