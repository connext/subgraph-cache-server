/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  handleCronJob,
  handleHealthRequest,
  handleLivlinessRequest,
} from "./handlers";
import { Router } from "itty-router";
import { handleOpts } from "./healthHandler";
// const TEST = process.env.TEST;
const router = Router();

//subgraph health
router.get("/subgraph_health", async (req: Request): Promise<Response> => {
  const res = await handleHealthRequest(req);
  const headers = handleOpts(req.headers);

  if (!res) {
    return new Response(`no res from handling subg health`, { headers: headers });
  }
  return res;
});
//router livliness form ec2
router.get("/router_livliness", async (req) => {
  return handleLivlinessRequest(req.url);
});

router.get("/push_cron", async (req: Request): Promise<Response> => {
  const headers = handleOpts(req.headers);
  try {
    await handleCronJob();
  } catch (e) {
    console.log(e);
    return new Response(`Push cron error`, { headers: headers });
  }
  return new Response(`Push cron`, { headers: headers });
});

//handles http
addEventListener("fetch", (event) => {
  event.respondWith(router.handle(event.request));
});

//handles internal cron
addEventListener("scheduled", (event) => {
  event.waitUntil(handleCronJob());
});
