/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { handleCronJob, handleHealthRequest } from './handler'
import { getDeployedSubgraphUri, getSubgraphHealth } from "./manualDeps";
import axios from 'axios';
const CHAINS_TO_MONITOR = [1,4,5,42];
// const TEST = process.env.TEST;
const TEST = false;

interface Healths{
  [key:number] : string[]
}


export class SubgraphHealthEndpoint{
  constructor(){

  }

  async getHealthByUri(uri:string): Promise<{ chainHeadBlock: number; latestBlock: number; lastHealthyBlock: number | undefined; network: string; fatalError: { message: string; block: number; handler: any; } | undefined; health: "healthy" | "unhealthy" | "failed"; synced: boolean; } | undefined>{
    const length = uri.length;
    const last = uri.lastIndexOf("/");
    const subgraph = uri.substring(last +1, length);
        
    console.log(`call url @ ${uri}`);
    console.log(`wtih subgraph name ${subgraph}`);
    const health = await getSubgraphHealth(subgraph, uri);
    return (health? health: undefined);
  }

  async getHealthForAllChains(){
 
    const healthsByChainId:Healths = {};
  
    for(const chainId of CHAINS_TO_MONITOR){
      const uris = getDeployedSubgraphUri(chainId);
      const chainHealths:string[] = [];
      for(const uri of uris){
        const chainHealth = await this.getHealthByUri(uri);
        if(chainHealth){
          chainHealths.push(JSON.stringify({url: uri, health: chainHealth}));
        
        }else{console.log(`no chain health available`);
          chainHealths.push(JSON.stringify({url: uri, health: "null"}));
        }
      }
      healthsByChainId[chainId] = chainHealths;
    }
    return healthsByChainId;
  }

  async init(){
    // setInterval(async()=>{
      console.log("setting health kv");
      //@ts-ignore
      const healths = await this.getHealthForAllChains();
      //@ts-ignore
      await HEALTHS.set("health", JSON.stringify(healths));
  }
}
export async function makeServer(){
  const endpoint = new SubgraphHealthEndpoint();
  await endpoint.init();
}

addEventListener('fetch', (event) => {
  event.respondWith(handleHealthRequest(event.request)) 
  
});
addEventListener('scheduled', (event)=>{
  event.waitUntil(handleCronJob());
});