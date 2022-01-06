export async function handleHealthRequest(request: Request): Promise<Response> {
  // const value = await HEALTH.get("first-key")
  const value = "he"
  // if (value === null) {
  //   return new Response("Value not found", {status: 404})
  // }
  //@ts-ignore
  await HEALTHS.put("subghealth", "healthy");
  // @ts-ignore
  const res = await HEALTHS.get("subghealth");
  return new Response(res);
}
