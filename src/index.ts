/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { handleHealthRequest } from './handler'
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

  async getHealthByUri(uri:string){
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
      console.log("setting health");
      
      const healths = await this.getHealthForAllChains();
      //@ts-ignore
      await HEALTHS.set("health", JSON.stringify(healths));

    // }, 5000);    
  }
}

export async function makeServer(){
  const endpoint = new SubgraphHealthEndpoint();
  await endpoint.init();
}

//broken query
async function tryaxios(){
  try{
    const res = await axios({
      url: "connext.bwarelabs.com/subgraphs/name/connext",
      method: "post",
      data: {
        query: `{
        indexingStatusForCurrentVersion(subgraphName: "/nxtp-mainnet-v1-runtime") {
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
      },
    });
}catch(e){console.log(`query error`, e)}
}
// makeServer();

addEventListener('fetch', (event) => {
  event.respondWith(handleHealthRequest(event.request)) 
  //@ts-ignore
  HEALTHS.get("subghealth")
  //this query is broken 
  tryaxios().then(()=>{console.log('axiostried')})
});
  

