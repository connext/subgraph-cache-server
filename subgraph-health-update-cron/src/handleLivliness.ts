export function handleLivlinessRequest(uri: string): Response {
  return new Response(
    `Return The Livliness \n Request Info: ${JSON.stringify(uri)}`,
  )
}
