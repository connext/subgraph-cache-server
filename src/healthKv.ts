const enableFakeStatusOnError = false;

export const mutateSubgraphHealth = (chain: any) => {
  //if chain.data.indexingStatusForCurrentVersion we're getting active health
  //otherwise we can push a fake health in and grab the url from overrideStatus
  //have we been getting a successful query back? if so get the status
  if (chain.data?.indexingStatusForCurrentVersion) {
    const needsMutation = chain.data.indexingStatusForCurrentVersion.chains[0];
    const mutatedStatus = {
      ...needsMutation,
      chainHeadBlock: Number(needsMutation.chainHeadBlock.number),
      syncedBlock: Number(needsMutation.latestBlock.number),
    };
    return { ...chain, data: { ...mutatedStatus } };
  } else if (enableFakeStatusOnError) {
    //this will return a fake status for chains that aren't returning correctly
    const fakeStatus = {
      network: "mainnet",
      chainHeadBlock: 1,
      latestBlock: { number: "1" },
      lastHealthyBlock: null,
      syncedBlock: 1,
      fatalError: undefined,
    };
    return {
      ...chain,
      data: { ...fakeStatus },
      url: `${chain.data.overrideStatus?.url}`,
    };
  }
};

type KvHealth = {
  [key: number]: string;
};
export async function getHealthFromKV(): Promise<KvHealth> {
  //Store called HEALTHS key called health
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const kvhealth = await HEALTHS.get("health");
  return JSON.parse(kvhealth) as KvHealth;
}
