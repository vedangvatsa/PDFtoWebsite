// Read-only source audit. No database writes, posting, or AI calls.
import { writeFileSync } from 'node:fs';
import { AI_COMPANIES, AI_SOURCES, aiCompanyId, collectAiCompanyJobs } from './lib/ai-company-jobs.mjs';
import { createOriginalJobFetcher } from './lib/fetch-original-job.mjs';
import { sourcePublicationPatch } from '../../src/lib/source-job-description.mjs';

const companies = process.env.AI_AUDIT_IDS ? AI_COMPANIES.filter((company) => process.env.AI_AUDIT_IDS.split(',').includes(company.id)) : AI_COMPANIES;
if (!companies.length) throw new Error('No matching AI employer IDs');
const { jobs, coverage } = await collectAiCompanyJobs({ companies });
if (process.argv.includes('--verify-samples')) {
  const fetchOriginal = createOriginalJobFetcher();
  for (const company of coverage) {
    const samples = jobs.filter((job) => aiCompanyId(job) === company.id).slice(0, 2);
    company.samples = [];
    for (const job of samples) {
      try {
        const source = await fetchOriginal(job);
        const patch = source.ok && sourcePublicationPatch(job, source.html || source.text, { html: Boolean(source.html) });
        company.samples.push({ external_id: job.external_id, source: job.source, location: job.location, published_at: job.published_at, complete: Boolean(patch), reason: source.reason || (patch ? undefined : 'invalid_source_body') });
      } catch (error) { company.samples.push({ external_id: job.external_id, complete: false, error: error.message }); }
    }
    if (samples.length) console.log(`AI100_SAMPLES ${JSON.stringify({ company: company.id, samples: company.samples })}`);
  }
}
const report = { checkedAt: new Date().toISOString(), rosterSize: AI_COMPANIES.length, checked: coverage.length, remoteOnly: true,
  candidateJobs: jobs.length, companiesWithCandidates: coverage.filter((row) => row.candidates).length,
  statuses: coverage.reduce((result, row) => { result[row.status] = (result[row.status] || 0) + 1; return result; }, {}),
  limitations: AI_SOURCES.limitations, companies: coverage };
if (process.env.AI_COVERAGE_OUTPUT) writeFileSync(process.env.AI_COVERAGE_OUTPUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, companies: undefined }, null, 2));
if (!coverage.some((row) => row.boards.length)) process.exitCode = 1;
