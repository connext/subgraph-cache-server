import { ChainData } from "./manualDeps";

export const override = false;

export const overrideStatus = (chain: any) => {
  return {
    health: "healthy",
    synced: true,
    fatalError: null,
    chains: [
      {
        network: "mainnet",
        chainHeadBlock: { number: "1" },
        latestBlock: { number: "1" },
        lastHealthyBlock: null,
      },
    ],
    url: `${chain.subgraph[0]}`,
  };
};
