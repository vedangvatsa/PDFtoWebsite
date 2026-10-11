import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(path), 'utf8');
describe('personalization never enters a shared response cache', () => {
  it('does not apply a generic two-segment 30-day TTL to API or OAuth routes', () => {
    const config = read('next.config.ts');
    assert.doesNotMatch(config, /source:\s*['"]\/:slug\/:jobSlug['"]/);
    assert.match(config, /\/auth\/:path\*/);
    assert.match(read('src/app/api/jobs/route.ts'), /Cache-Control', 'private, no-store'/);
  });
  it('invalidates profile caches after browser writes and account deletion', () => {
    assert.match(read('src/utils/supabase/client.ts'), /response\.ok/);
    assert.match(read('src/utils/supabase/client.ts'), /await fetch\('\/api\/cache\/profile'/);
    assert.match(read('src/app/api/cache/profile/route.ts'), /auth\.getUser\(\)/);
    assert.match(read('src/app/api/cache/profile/route.ts'), /revalidateTag\('public-profiles'/);
    assert.match(read('src/app/api/account/route.ts'), /revalidateTag\('public-profiles'/);
  });
});
