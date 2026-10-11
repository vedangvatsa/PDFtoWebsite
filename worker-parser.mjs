import { runWithCloudflareRequestContext } from './.open-next/cloudflare/init.js';
import { handler } from './.open-next/server-functions/parser/handler.mjs';
export default {
  fetch(request, env, ctx) {
    return runWithCloudflareRequestContext(request, env, ctx, () => handler(request, env, ctx, request.signal));
  },
};
