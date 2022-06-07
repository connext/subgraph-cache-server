const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function handleOpts(headers: Headers) {
  const newHeaders: Headers = new Headers();
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    const respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      "Access-Control-Allow-Headers": headers.get(
        "Access-Control-Request-Headers"
      ),
    };

    respHeaders;
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    newHeaders.append("Allow", "GET, HEAD, POST, OPTIONS");
  }
  return newHeaders;
}

export async function apiResponseHandler(
  responseBody: string,
  headers: Headers
): Promise<Response> {
  handleOpts(headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  headers.set("Access-Control-Max-Age", "86400");
  const res = new Response(responseBody, { headers: headers });
  return res;
}
