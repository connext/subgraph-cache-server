/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { handleCronJob, handleHealthRequest } from './handler'
import { getDeployedSubgraphUri, getSubgraphHealth } from "./manualDeps";
import { Router } from 'itty-router';

// const TEST = process.env.TEST;

const router = Router();

router.get('/subgraph_health', async (req)=>{
   return (await handleHealthRequest(req.url));
})
router.get('/router_livliness', async (req)=>{
  return new Response(`Return The Livliness \n Request Info: ${JSON.stringify(req)}`);
})

addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request)) 
  
});
addEventListener('scheduled', (event)=>{
  event.waitUntil(handleCronJob());
});