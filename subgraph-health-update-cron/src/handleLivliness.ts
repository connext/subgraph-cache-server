export function handleLivlinessRequest(req: Request): Response {
  return new Response(
    `Return The Livliness \n Request Info: ${JSON.stringify(req)}`,
  )
}
