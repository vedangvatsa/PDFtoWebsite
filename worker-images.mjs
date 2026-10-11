import { DurableObject } from 'cloudflare:workers';
import { RenderCapacity } from './src/lib/render-capacity.mjs';
import { rendererStub, IMAGE_POOL_SIZE } from './src/lib/render-routing.mjs';

export class ImageRenderer extends DurableObject {
  #capacity = new RenderCapacity(1);
  fetch(request) {
    return this.#capacity.run(async () => {
      const { runWithCloudflareRequestContext } = await import('./.open-next/cloudflare/init.js');
      const { handler } = await import('./.open-next/server-functions/images/handler.mjs');
      return runWithCloudflareRequestContext(request, this.env, this.ctx, () => handler(request, this.env, this.ctx, request.signal));
    }, { head: request.method === 'HEAD' });
  }
}
export default {
  fetch(request, env) {
    return rendererStub(env.IMAGE_RENDERER, new URL(request.url).pathname, IMAGE_POOL_SIZE).fetch(request);
  },
};
