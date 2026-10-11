// Read-only, aggregate metrics. No request URLs, cookies, or user data are read.
// Usage: node --env-file=.env.local .github/scripts/check-free-tier-usage.mjs [start ISO] [end ISO]
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!/^[a-f0-9]{32}$/i.test(account || '')) throw new Error('CLOUDFLARE_ACCOUNT_ID is required');
const end = new Date(process.argv[3] || Date.now() - 15 * 60_000);
const start = new Date(process.argv[2] || end.getTime() - 3_600_000);
const seconds = (end.getTime() - start.getTime()) / 1000;
if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 86_400) throw new Error('Provide an ordered window of at most 24 hours');
const midnight = new Date(end);
midnight.setUTCHours(0, 0, 0, 0);
const headers = { 'Content-Type': 'application/json' };
if (process.env.CLOUDFLARE_API_KEY && process.env.CLOUDFLARE_EMAIL) {
  headers['X-Auth-Key'] = process.env.CLOUDFLARE_API_KEY;
  headers['X-Auth-Email'] = process.env.CLOUDFLARE_EMAIL;
} else if (process.env.CLOUDFLARE_API_TOKEN) {
  headers.Authorization = `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`;
} else throw new Error('Cloudflare analytics credentials are required');

const range = (from) => `{datetime_geq:${JSON.stringify(from.toISOString())},datetime_lt:${JSON.stringify(end.toISOString())}}`;
const query = `{
  viewer { accounts(filter:{accountTag:${JSON.stringify(account)}}) {
    workers: workersInvocationsAdaptive(limit:1000,filter:${range(start)}) {
      dimensions { scriptName status }
      sum { requests errors }
      quantiles { cpuTimeP50 cpuTimeP95 cpuTimeP99 }
    }
    objects: durableObjectsInvocationsAdaptiveGroups(limit:1000,filter:${range(start)}) {
      dimensions { scriptName namespaceId status }
      sum { requests errors }
    }
    duration: durableObjectsPeriodicGroups(limit:1000,filter:${range(start)}) {
      dimensions { namespaceId }
      sum { duration activeTime cpuTime exceededCpuErrors exceededMemoryErrors fatalInternalErrors rowsRead rowsWritten }
      quantiles { memoryUsageBytesP99 }
    }
    d1: d1AnalyticsAdaptiveGroups(limit:1,filter:${range(start)}) {
      sum { rowsRead rowsWritten }
    }
    dailyWorkers: workersInvocationsAdaptive(limit:1,filter:${range(midnight)}) { sum { requests errors } }
    dailyObjects: durableObjectsInvocationsAdaptiveGroups(limit:1,filter:${range(midnight)}) { sum { requests errors } }
    dailyDuration: durableObjectsPeriodicGroups(limit:1,filter:${range(midnight)}) { sum { duration rowsRead rowsWritten } }
    dailyD1: d1AnalyticsAdaptiveGroups(limit:1,filter:${range(midnight)}) { sum { rowsRead rowsWritten } }
  } }
}`;
const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
  method: 'POST', headers, body: JSON.stringify({ query }), signal: AbortSignal.timeout(30_000),
});
if (!response.ok) throw new Error(`Cloudflare analytics HTTP ${response.status}`);
const result = await response.json();
if (result.errors?.length) throw new Error(result.errors.map((error) => error.message).join('; '));
const metrics = result.data?.viewer?.accounts?.[0];
if (!metrics) throw new Error('Cloudflare returned no account metrics');
for (const key of ['workers', 'objects', 'duration']) {
  if (metrics[key].length >= 1000) throw new Error(`${key} metrics may be truncated`);
}
const total = (rows, field) => rows.length ? rows.reduce((sum, row) => sum + row.sum[field], 0) : null;
const estimate = (value) => value === null ? null : Math.round(value * 86_400 / seconds);
console.log(JSON.stringify({
  start: start.toISOString(), end: end.toISOString(),
  units: { workerCpu: 'milliseconds', objectDuration: 'GB-s', objectActiveAndCpuTime: 'microseconds', objectMemory: 'bytes' },
  workers: metrics.workers.map(({ dimensions, sum, quantiles }) => ({
    ...dimensions, ...sum,
    cpuP50: quantiles.cpuTimeP50 / 1000, cpuP95: quantiles.cpuTimeP95 / 1000, cpuP99: quantiles.cpuTimeP99 / 1000,
  })),
  objects: metrics.objects,
  objectDuration: metrics.duration,
  dailyUsage: {
    start: midnight.toISOString(),
    workerRequests: total(metrics.dailyWorkers, 'requests'),
    objectRequests: total(metrics.dailyObjects, 'requests'),
    objectDurationGBs: total(metrics.dailyDuration, 'duration'),
    objectRowsRead: total(metrics.dailyDuration, 'rowsRead'), objectRowsWritten: total(metrics.dailyDuration, 'rowsWritten'),
    d1RowsRead: total(metrics.dailyD1, 'rowsRead'), d1RowsWritten: total(metrics.dailyD1, 'rowsWritten'),
  },
  projectedDailyAtWindowRate: {
    workerRequests: estimate(total(metrics.workers, 'requests')),
    objectRequests: estimate(total(metrics.objects, 'requests')),
    objectDurationGBs: estimate(total(metrics.duration, 'duration')),
    d1RowsRead: estimate(total(metrics.d1, 'rowsRead')), d1RowsWritten: estimate(total(metrics.d1, 'rowsWritten')),
  },
  note: 'Analytics can be delayed or sampled; DO counters have arrived over 10 minutes after Worker CPU. Default end lags by 15 minutes. A short-window projection is not a billing forecast; null means no reported data.',
}, null, 2));
