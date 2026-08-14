import {
  companyDisplayName,
  companyDisplayNameFromJob,
  registrableHostLabel,
  applyCompanyDisplayCasing,
  isJunkCompanyName,
} from './company-directory';
import { domainForCompany, companyLogoCandidates } from './company-logo';
import { isRegistryCompanyLabel } from './company-host.mjs';

function assert(cond: unknown, msg: string) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exit(1);
  }
}

assert(registrableHostLabel('iisc.ac.in') === 'iisc', 'iisc.ac.in brand is iisc');
assert(registrableHostLabel('www.iisc.ac.in') === 'iisc', 'www.iisc.ac.in strips www');
assert(registrableHostLabel('ox.ac.uk') === 'ox', 'ox.ac.uk brand is ox');
assert(registrableHostLabel('careers.ox.ac.uk') === 'ox', 'careers.ox.ac.uk brand is ox');
assert(registrableHostLabel('bbc.co.uk') === 'bbc', 'bbc.co.uk brand is bbc');
assert(registrableHostLabel('jobs.ashbyhq.com') === 'ashbyhq', 'jobs.ashbyhq.com brand is ashbyhq');
assert(registrableHostLabel('platform.stripe.com') === 'stripe', 'stripe.com brand is stripe');
assert(registrableHostLabel('heidihealth.com.au') === 'heidihealth', 'com.au brand is left of suffix');

const iiscApply = 'https://www.iisc.ac.in/careers/post-doctoral-fellowship/';
assert(companyDisplayName('iisc', iiscApply) === 'IISc', `iisc + apply → IISc, got ${companyDisplayName('iisc', iiscApply)}`);
assert(companyDisplayName('AC', iiscApply) === 'IISc', 'stored AC (public suffix) → IISc');
assert(companyDisplayName('iisc') === 'IISc', 'iisc without URL still maps');
assert(companyDisplayName('jobs', 'https://jobs.ashbyhq.com/x') !== 'Ashbyhq', 'ATS vendor is not the employer');
assert(companyDisplayName('Jstreet', 'https://jstreet.bamboohr.com/careers/240') === 'J Street', 'BambooHR tenant stays J Street');
assert(companyDisplayName('Bamboohr', 'https://jstreet.bamboohr.com/careers/240') === 'J Street', 'stored ATS vendor recovers tenant');
assert(companyDisplayName('platform', 'https://platform.stripe.com/jobs') === 'Stripe', 'platform.stripe.com → Stripe');
assert(companyDisplayName('govai', 'https://governance.ai/jobs') === 'GovAI', 'HOST_BRANDS governance.ai');
assert(companyDisplayName('careers', 'https://careers.google.com/jobs') === 'Google', 'careers.google.com → Google');
assert(companyDisplayName('bbc', 'https://www.bbc.co.uk/careers') === 'BBC', 'bbc.co.uk → BBC not CO');
assert(companyDisplayName('co', 'https://www.bbc.co.uk/careers') === 'BBC', 'stored CO → BBC');
assert(companyDisplayName('ox', 'https://www.ox.ac.uk/jobs') !== 'AC', 'ox.ac.uk is not AC');
assert(companyDisplayName('IITB', 'https://www.iitb.ac.in/careers') === 'IITB', 'iitb.ac.in stays IITB');
assert(companyDisplayName('iitb', 'https://www.iitb.ac.in/careers') === 'IITB', 'iitb slug → IITB');

const baked = applyCompanyDisplayCasing(
  'AC AI Postdoc / Fellow at AC. Apply at iisc.ac.in. The AC Bangalore campus.',
  'iisc',
  'IISc',
  iiscApply
);
assert(/IISc AI Postdoc/.test(baked), `rewrote baked AC header: ${baked}`);
assert(/at IISc/.test(baked), 'rewrote at AC');
assert(/iisc\.ac\.in/.test(baked), `kept hostname: ${baked}`);
assert(!/\bAC\b/.test(baked), `no leftover AC: ${baked}`);

const bbcBody = applyCompanyDisplayCasing(
  'Join CO in London.',
  'bbc',
  'BBC',
  'https://www.bbc.co.uk/careers'
);
assert(bbcBody === 'Join BBC in London.', `bbc CO rewrite: ${bbcBody}`);

assert(
  companyDisplayNameFromJob({ company: 'iisc', apply_url: iiscApply }) === 'IISc',
  'FromJob passes apply_url'
);
assert(isJunkCompanyName('AC'), 'registry-only names are junk');
assert(isJunkCompanyName('co'), 'co is junk');
assert(!isJunkCompanyName('IISc'), 'IISc is not junk');

const neverRegistry = [
  ['iisc', iiscApply],
  ['AC', iiscApply],
  ['careers', 'https://careers.ox.ac.uk/x'],
  ['co', 'https://bbc.co.uk/careers'],
  ['edu', 'https://sydney.edu.au/jobs'],
];
for (const [name, url] of neverRegistry) {
  const d = companyDisplayName(name, url);
  assert(!isRegistryCompanyLabel(d), `display ${name} + ${url} must not be registry, got ${d}`);
}

assert(companyDisplayName('Nasa') === 'NASA', 'Nasa → NASA');
assert(companyDisplayName('nasa', 'https://www.nasa.gov/careers') === 'NASA', 'nasa + nasa.gov → NASA');

assert(companyDisplayName('ERA') === 'ERA', 'ERA stays ERA');
assert(companyDisplayName('era fellowship') === 'ERA', 'era fellowship → ERA');
assert(companyDisplayName('erafellowship', 'https://erafellowship.org/fellowship') === 'ERA', 'host maps to ERA');

assert(isJunkCompanyName('eFinancialCareers'), 'job-board companies are junk');
assert(isJunkCompanyName('We Work Remotely'), 'WWR as company is junk');
assert(isJunkCompanyName('Whiterose Janitorial Services'), 'janitorial company is junk');
assert(isJunkCompanyName('Other'), 'generic Other is junk');
assert(isJunkCompanyName('risein'), 'RiseIn aggregator as company is junk');
assert(!isJunkCompanyName('Stripe'), 'Stripe is not junk');

assert(domainForCompany('NASA') === 'nasa.gov', 'NASA domain');
assert(domainForCompany('IISc') === 'iisc.ac.in', 'IISc domain');
assert(domainForCompany('GovAI') === 'governance.ai', 'GovAI domain');
assert(domainForCompany('SPAR') === 'sparai.org', 'SPAR is not spar.com');
assert(domainForCompany('MATS') === 'matsprogram.org', 'MATS program domain');
assert(domainForCompany('The New York Times') === 'nytimes.com', 'NYT domain');

assert(companyLogoCandidates('NASA').includes('/company-logos/nasa.png'), 'NASA uses local meatball');
assert(companyLogoCandidates('GovAI').includes('/company-logos/govai.png'), 'GovAI uses local mark');
assert(companyLogoCandidates('SPAR').includes('/company-logos/spar.png'), 'SPAR uses local mark not spar.com');
assert(companyLogoCandidates('SPAR')[0] === '/company-logos/spar.png', 'SPAR prefers local file');
assert(
  !companyLogoCandidates('Unknown Startup XYZ').some((u) => u.startsWith('/company-logos/')),
  'do not 404-guess missing local logos'
);
assert(companyLogoCandidates('J Street')[0] === '/company-logos/j-street.png', 'J Street uses local mark');

console.log('ok');
