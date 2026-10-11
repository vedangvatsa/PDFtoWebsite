import { DurableObject } from 'cloudflare:workers';
import { RenderCapacity } from './src/lib/render-capacity.mjs';
import { rendererStub, RENDER_POOL_SIZE } from './src/lib/render-routing.mjs';
export { DOQueueHandler } from './.open-next/.build/durable-objects/queue.js';

export class AppRenderer extends DurableObject {
  #capacity = new RenderCapacity(4);
  fetch(request) {
    return this.#capacity.run(async () => {
      // Next.js initializes only inside the DO's 30-second CPU budget.
      const { default: app } = await import('./.open-next/worker.js');
      return app.fetch(request, this.env, this.ctx);
    }, { head: request.method === 'HEAD' });
  }
}

// Private compatibility entrypoint; the public gateway uses the DO binding.
export default {
  fetch(request, env) {
    return rendererStub(env.APP_RENDERER, new URL(request.url).pathname, RENDER_POOL_SIZE).fetch(request);
  },
};
