//shim for types /fn() that we cant import from nxtp-utils for some reason
export interface Healths {
  [key: number]: string;
}

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
  if (url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-bsc")) {
    return "https://connext.bwarelabs.com/bsc/index-node/graphql";
  } else if (
    url.includes(
      "connext-firehose.bwarelabs.com/subgraphs/name/connext/nxtp-bsc"
    )
  ) {
    return "https://connext-firehose.bwarelabs.com/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-mainnet")
  ) {
    return "https://connext.bwarelabs.com/ethereum/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-xdai")
  ) {
    return "https://connext.bwarelabs.com/xdai/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-matic")
  ) {
    return "https://connext.bwarelabs.com/matic/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-fantom")
  ) {
    return "https://connext.bwarelabs.com/fantom/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-moonriver")
  ) {
    return "https://connext.bwarelabs.com/moonriver/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-avalanche")
  ) {
    return "https://connext.bwarelabs.com/avalanche/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-arbitrum")
  ) {
    return "https://connext.bwarelabs.com/arbitrum/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-optimism")
  ) {
    return "https://connext.bwarelabs.com/optimism/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-moonbeam")
  ) {
    return "https://connext.bwarelabs.com/moonbeam/index-node/graphql";
  } else if (
    url.includes(
      "connext.bwarelabs.com/subgraphs/name/connext/nxtp-milkomeda-cardano"
    )
  ) {
    return "https://connext.bwarelabs.com/milkomeda-cardano/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-gather")
  ) {
    return "https://connext.bwarelabs.com/gather/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-boba")
  ) {
    return "https://connext.bwarelabs.com/boba/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-harmonyone")
  ) {
    return "https://connext.bwarelabs.com/harmonyone/index-node/graphql";
  } else if (
    url.includes(
      "connext.bwarelabs.com/subgraphs/name/connext/nxtp-kava-alphanet"
    )
  ) {
    return "https://connext.bwarelabs.com/kava-alphanet/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-cronos")
  ) {
    return "https://connext.bwarelabs.com/cronos/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-evmos")
  ) {
    return "https://connext.bwarelabs.com/evmos/index-node/graphql";
  } else if (
    url.includes("connext.bwarelabs.com/subgraphs/name/connext/nxtp-fuse")
  ) {
    return "https://connext.bwarelabs.com/fuse/index-node/graphql";
  } else if (url.includes("api.thegraph.com/subgraphs/name/connext")) {
    return "https://api.thegraph.com/index-node/graphql";
  } else if (
    url.includes("subgraphs.connext.p2p.org/subgraphs/name/connext/nxtp-bsc")
  ) {
    return "https://subgraphs.connext.p2p.org/nxtp-bsc-health-check";
  } else if (
    url.includes("subgraphs.connext.p2p.org/subgraphs/name/connext/nxtp-matic")
  ) {
    return "https://subgraphs.connext.p2p.org/nxtp-matic-health-check";
  }
  return undefined;
};

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

export const getSubgraphHealth = async (
  subgraphName: string,
  url: string
): Promise<SubgraphHealth | undefined> => {
  const healthUrl = GET_SUBGRAPH_HEALTH_URL(url);
  if (!healthUrl) {
    return undefined;
  }

  const res = await fetch(healthUrl, {
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
