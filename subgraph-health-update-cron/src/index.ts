/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  handleCronJob,
  handleHealthRequest,
  handleLivlinessRequest,
} from './handlers'
import { Router } from 'itty-router'
// const TEST = process.env.TEST;
const router = Router()

//subgraph health
router.get('/subgraph_health', async (req) => {
  return await handleHealthRequest(req.url)
})
//router livliness form ec2
router.get('/router_livliness', async (req) => {
   return handleLivlinessRequest(req.url);
})

//handles http
addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request))
})

//handles internal cron
addEventListener('scheduled', (event) => {
  event.waitUntil(handleCronJob())
})
