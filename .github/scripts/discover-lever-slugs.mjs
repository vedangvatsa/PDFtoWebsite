/**
 * Discover + verify additional Lever ATS company slugs from public directories:
 *  1. bloomberry.com/data/lever/          — exact jobs.lever.co/{slug} links (live scrape)
 *  2. theirstack.com/en/technology/lever  — top companies (+ country pages), name+domain pairs
 *  3. technologychecker.io/technology/lever — demo company names
 * Each candidate slug is verified against the Lever API (200 + has postings = valid).
 * Verified slugs not already in jobs-sync's LEVER_SLUGS are written to
 * .github/scripts/lever-slugs-extra.json.
 *
 * Usage: node .github/scripts/discover-lever-slugs.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, 'lever-slugs-extra.json');

async function fetchText(url) {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0' },
    signal: AbortSignal.timeout(30000),
  });
  return r.ok ? await r.text() : '';
}

// 1) Bloomberry: exact slugs
async function bloomberrySlugs() {
  const html = await fetchText('https://bloomberry.com/data/lever/');
  return [...new Set([...html.matchAll(/https?:\/\/(?:www\.)?jobs\.lever\.co\/([a-z0-9-]+)/gi)].map((m) => m[1]))];
}

// 2) TheirStack: names (main + country pages), with domain hints where visible
const TS_COUNTRIES = ['us', 'gb', 'ca', 'fr', 'au', 'de', 'in'];
async function theirStackNames() {
  const names = new Set();
  const domains = new Map(); // name -> domain hint
  for (const url of ['https://theirstack.com/en/technology/lever', ...TS_COUNTRIES.map((c) => `https://theirstack.com/en/technology/lever/${c}`)]) {
    // The page is client-rendered; render it via r.jina.ai to get the table.
    const html = await fetchText(`https://r.jina.ai/${url}`);
    for (const m of html.matchAll(/domain\/([a-z0-9.-]+)\.(?:jpeg|png|gif)[^)]*\)[^\[]*\[([^\]\n]{2,50})\]/gi)) {
      const d = m[1].replace(/^www\./, '');
      const n = m[2].trim();
      names.add(n);
      domains.set(n, d);
    }
    for (const m of html.matchAll(/\[([A-Z][^\]\n]{2,50})\]\((?:https:\/\/app\.theirstack\.com\/home\?)/g)) {
      const n = m[1].trim();
      if (!/^(Home|Pricing|Log in|Sign up|See all|Get alerted|Export|Technologies|HRMS|English|Skip|Go to)/i.test(n)) {
        names.add(n);
      }
    }
  }
  return { names: [...names], domains };
}

// 2b) TheirStack API (free tier page 1, real names + domains)
const TS_API_PAIRS = [
  ['Ci&T', 'ciandt.com'], ['Binance', 'binance.com'], ['Paytm', 'paytm.com'],
  ['Octopus Energy', 'octopusenergy.group'], ['WinnCompanies', 'winncompanies.com'],
  ['Shield AI', 'shield.ai'], ['Zoox', 'zoox.com'], ['Edelman', 'edelman.com'],
  ['Nielsen', 'nielsen.com'], ['Dun & Bradstreet', 'dnb.co.in'], ['Veepee', 'veepee.com'],
  ['Vohra Wound Physicians', 'vohrawoundcare.com'], ['Planned Parenthood', 'plannedparenthood.org'],
  ['Daniels Health', 'info.danielshealth.com'], ['Xero', 'xero.com'], ['Mobileye', 'mobileye.com'],
  ['CSC Generation', 'cscgeneration.com'], ['Gopuff', 'gopuff.com'],
  ['Contact Government Services, LLC', null], ['CesiumAstro', 'cesiumastro.com'],
  ['Ninja Van', 'ninjavan.co'], ['Aledade, Inc.', 'aledade.com'],
  ['Extreme Networks', 'extremenetworks.com'], ['banco BV', 'bancobv.com.br'],
  ['despegar.com', 'despegar.com'],
];

// 2c) Bloomberry app API (free tier page 1-3, domain+name+linkedin handle)
const BLOOMBERRY_APP_PAIRS = [
  ['Kalogon', 'kalogon.com', 'kalogon'],
  ['Utility', 'utilityglobal.com', 'utilityglobal'],
  ['Velaura AI', 'velaura.ai', 'velaura-ai-inc'],
  ['House Majority PAC', 'thehousemajoritypac.com', 'house-majority-pac'],
  ['Tiberius Aerospace', 'tiberius.com', 'tiberius-aerospace'],
  ['Phoenix Ecommerce Technologies', 'phoenixtechnologies.io', 'phoenixecommerce'],
  ['Tali AI', 'tali.ai', 'tali-ai'],
  ['Corner Health', 'cornerhealth.com', 'corner-health-np'],
  ['Rembrand', 'rembrand.com', 'getrembrand'],
  ['LUUM', 'luumlash.com', 'luumlash'],
  ['Aqueduct Technologies, Inc.', 'aqueducttech.com', 'aqueduct-technologies'],
  ['The Battery Network', 'batterynetwork.org', 'thebatterynetwork'],
  ['Vitana Pediatric & Orthodontic Partners', 'vitanapdp.com', 'vitana-pediatric-dental-partners'],
  ['Express Chipping, Inc.', 'chippingconcrete.com', 'expresschipping'],
  ['Canvas Homes', 'canvas.homes', 'canvashomesre'],
  ['Atrium Therapeutics', 'atriumtherapeutics.com', 'atrium-therapeutics'],
  ['Teramind', 'teramind.co', 'teramindco'],
  ['envelio', 'envelio.com', 'envelio'],
  ['DiliTrust', 'dilitrust.com', 'dilitrust'],
  ['Auxia', 'auxia.io', 'auxia-io'],
  ['Apryse', 'apryse.com', 'aprysesolutions'],
  ['AppNation', 'appnation.co', 'appnationco'],
  ['1inch', '1inch.com', '1inchcom'],
  ['Veritran', 'veritran.com', 'veritran'],
  ['Treering', 'treering.com', 'treering'],
  ['Solutions Journalism Network', 'solutionsjournalism.org', 'solutions-journalism-network'],
  ['Softdocs', 'softdocs.com', 'softdocs'],
  ['Senti Biosciences', 'sentibio.com', 'senti-biosciences'],
  ['Seattle Art Museum', 'seattleartmuseum.org', 'seattle-art-museum'],
  ['Sapio Sciences', 'sapiosciences.com', 'sapio-sciences-llc'],
  ['Rezolute, Inc.', 'rezolutebio.com', 'rezolute'],
  ['Patch My PC', 'patchmypc.com', 'patchmypc'],
  ['OTI Lumionics', 'otilumionics.com', 'oti-lumionics'],
  ['National Journal', 'nationaljournal.com', 'national-journal'],
  ['MicroVision®', 'microvision.com', 'microvision'],
  ['Influur', 'influur.com', 'influur'],
  ['myLaurel®', 'mylaurelhealth.com', 'mylaurel'],
  ['Hiring Our Heroes', 'hiringourheroes.org', 'hiringourheroes'],
  ['Cleveland Construction, Inc.', 'clevelandconstruction.com', 'cleveland-construction'],
  ['CopilotKit', 'copilotkit.ai', 'copilotkit'],
  ['BrightBee', 'brightbee.org', 'wearebrightbees'],
  ['Subsense Inc.', 'subsense-bci.com', 'subsense-inc'],
  ['GTI Fabrication', 'gtifabrication.com', 'gtifabrication'],
  ['Okanagan College', 'okanagancollege.ca', 'okanagan-college_2'],
  ['FYZICAL Chicago', 'fyzical.com', 'fyzical-chicago'],
  ['Thomas & Hutton', 'thomasandhutton.com', 'thomas-&-hutton'],
  ['Copper', 'copper.com', 'copper-inc'],
  ['Fenway Sports Management', 'fenwaysportsmanagement.com', 'fenway-sports-management'],
  ['Commerce Undergraduate Society of UBC Vancouver', 'cus.ca', 'cusubc'],
  ['Terrific', 'terrificlive.com', 'terrificapp'],
  ['West Yost', 'westyost.com', 'west-yost'],
  ['Independence Home Loans', 'independencehl.com', 'independence-home-loans'],
  ['Welo Global', 'weloglobal.com', 'welo-global'],
  ['Onboarded', 'onboarded.com', 'onboarded-inc'],
  ['RAVL', 'ravl.io', 'ravl-io'],
  ['APCO Holdings, LLC', 'apcoholdings.com', 'apco-holdings-inc.'],
  ['Hayes Locums', 'hayeslocums.com', 'hayes-locums'],
  ['UX Woman', 'uxwoman.com', 'ux-woman'],
  ['NextOvation', 'nextovation.com', 'nextovation-2004'],
  ['BreezeBio', 'breezebio.com', 'breezebio'],
  ['Restore Dispensaries', 'restoredispensaries.com', 'restore-dispensaries'],
  ['Mars Men', 'mengotomars.com', 'mengotomars'],
  ['KMA Human Resources Consulting', 'kmahr.com', 'kma-human-resources-consulting-llc'],
  ['Sphere Labs', 'spherepay.co', 'sphere-laboratories'],
  ['Five Star Solutions', 'getfivestar.com', 'get-five-star'],
  ['FANTOM CORPORATION', 'fantomcorp.com', 'fantom-corporation'],
  ['Moments Hospice', 'momentshospice.com', 'moments-hospice'],
  ['Lyra Collective', 'lyracollective.com', 'lyracollective'],
  ['Rhino-Back Roofing', 'rhinobackroofing.com', 'rhino-back-roofing'],
  ['Eagle Point Credit', 'eaglepointcredit.com', 'eagle-point-credit'],
  ['Optimal Beginnings, LLC', 'optimalbeginning.com', 'optimal-beginnings-llc'],
  ['Foxtrot Division', 'foxtrotdivision.us', 'foxtrot-division'],
  ['Field Fastener', 'fieldfastener.com', 'field-fastener'],
  ['Rise Alliance', 'risealliance.com', 'rise-alliance-debt-solutions'],
  ['Next Shift Learning', 'nextshiftlearning.com', 'nextshiftlearning'],
  ['State Policy Network', 'spn.org', 'state-policy-network'],
  ['Hypersonica', 'hypersonica.com', 'hypersonicagmbh'],
  ['Talentus Global', 'talentusglobal.com', 'talentusglobal'],
  ['ms consultants, inc.', 'msconsultants.com', 'ms-consultants-inc-'],
  ['Simply Protein for Pets', 'simplyproteinforpets.com', 'simply-protein-for-pets'],
  ['Classical Charter Schools', 'classicalcharterschools.org', 'classical-charter-school'],
  ['Lake Partners Strategy Consultants', 'lakepartners.com', 'lake-partners-strategy-consultants'],
  ['Lever for Change', 'leverforchange.org', 'leverforchange'],
  ['Lyrebird Health', 'lyrebirdhealth.com', 'lyrebirdhealth'],
  ['Sycurio', 'sycurio.com', 'sycurio'],
  ['HavenPoint Health', 'havenpoint.health', 'havenpoint-health'],
  ['Grand Rapids Counseling Services (GRCS)', 'grcounseling.com', 'grand-rapids-counseling-services-grcs'],
  ['Link Rehab and Wellness', 'linkrehabwellness.com', 'link-rehab-wellness'],
  ['CCT', 'cct.io', 'cctinsight'],
  ['Crescent Biopharma', 'crescentbiopharma.com', 'crescent-biopharma'],
  ['Buckeye Corrugated, Inc. (BCI)', 'bcipkg.com', 'bci-buckeye-corrugated'],
  ['Hutker Architects, Inc.', 'hutkerarchitects.com', 'hutker-architects'],
  ['Laminar', 'runlaminar.com', 'run-laminar'],
  ['Active Theory', 'activetheory.net', 'active-theory'],
  ['Brookfield Residential Property Services', 'rpsrealsolutions.com', 'brookfield-residential-property-services'],
  ['Veda', 'veda.tech', 'veda-tech'],
  ['e184', 'e184.com', 'e184'],
  ['HITCONTRACT', 'hitcontract.com', 'hitcontract'],
  ['Turgon AI', 'turgon.ai', 'turgon-ai'],
  ['Banana Daddy', 'eatbananadaddy.com', 'banana-daddy'],
  ['Mayer LLP', 'mayerllp.com', 'mayer-llp'],
  ['Enveda', 'enveda.com', 'envedabio'],
  ['Hawthorne Health, Inc.', 'hawthornehealth.com', 'hawthornehealth'],
  ['JetBridge AI', 'jetbridge.com', 'jetbridge'],
  ['Schneider Geospatial, LLC', 'schneidergis.com', 'schneider-geospatial'],
  ['Latin Top Jobs Group', 'ltjgroup.com', 'latin-top-jobs'],
  ['Computer World Services Corp. (CWS)', 'cwsc.com', 'computer-world-services-corp.-cws-'],
  ['Canopy Aerospace & Defense', 'canopy-ad.com', 'canopy-aerospace-defense'],
  ['VEIC', 'veic.org', 'veic'],
  ['Magna Legal Services', 'magnals.com', 'magna-legal-services'],
  ['Tali AI', 'tali.ai', 'tali-ai'],
  ['CVRx | Barostim', 'barostim.com', 'cvrx'],
  ['ERP Success Partners', 'erpsuccesspartners.com', 'erpsuccesspartners'],
  ['MaverickX', 'maverickx.com', 'maverickx-company'],
  ['Evry Health', 'evryhealth.com', 'evryhealth'],
  ['SkinnyDipped', 'skinnydipped.com', 'skinny-dipped'],
  ['Health Services Advisory Group, Inc. (HSAG)', 'hsag.com', 'health-services-advisory-group'],
  ['Lingaro', 'lingarogroup.com', 'lingaro'],
  ['Pine Services Group', 'pineservicesgroup.com', 'pine-services-group'],
  ['EnGen', 'getengen.com', 'engen-impact'],
  ['ilek', 'ilek.fr', 'ilek'],
  ['Foundation EGI', 'foundationegi.com', 'foundationegi'],
  ['Tom Steyer 2020', 'tomsteyer.com', 'tom-steyer-2020'],
  ['Beckley Clinical', 'beckleyclinical.com', 'beckley-clinical'],
  ['Fun', 'fun.xyz', 'funxyz'],
  ['Allstar Services', 'allstarservicesnow.com', 'allstar-services-today'],
  ['Iru', 'iru.com', 'officiallyiru'],
  ['Dynamic Connections', 'dynamicconnections.com', 'dynamic-connections-inc-'],
  ['nEye.ai', 'neye.ai', 'neye-systems'],
  ['Daos Hub Dubai', 'daoshub.xyz', 'daoshub'],
  ['Stable Money', 'stablemoney.in', 'stable-money'],
  ['ANS', 'ans-team.com', 'ans-team'],
  ['Horizon Blue ABA', 'horizonblueaba.com', 'horizon-blue-aba'],
  ['GRADION', 'gradion.com', 'gradion-global'],
  ['SteerBridge', 'steerbridge.com', 'steerbridge'],
  ['Sequel Med Tech', 'sequelmedtech.com', 'sequel-med-tech'],
  ['Decima Digital Inc.', 'decimadigital.com', 'decima-digital'],
  ['Crypto Banter', 'cryptobanter.com', 'crypto-banter'],
  ['JamLoop', 'jamloop.com', 'jamloop'],
  ['NPHub', 'nphub.com', 'np-hub'],
  ['Penrod', 'penrod.co', 'penrodhq'],
  ['Push Security', 'pushsecurity.com', 'push-security'],
  ['Scanline VFX', 'eyelinestudios.com', 'scanlinevfx'],
  ['Five Star Solutions', 'getfivestar.com', 'get-five-star'],
  ['Cathoven AI', 'cathoven.com', 'cathoven'],
  ['BlueMatrix', 'bluematrix.com', 'bluematrix'],
  ['Medical Outsourcing Solutions, Inc.', 'micmos.com', 'medical-outsourcing-solutions-inc'],
  ['Epoch AI', 'epoch.ai', 'epochai'],
  ['Cypher Games', 'cyphergames.com', 'cyphergames'],
  ['OU Education Services', 'oueducationservices.org', 'ou-education-services'],
  ['Athena Education', 'athenaeducation.co.in', 'athenaeducationindia'],
  ['Zambezi', 'zmbz.com', 'zmbz'],
  ['Russell Speeders Car Wash', 'summitwashholdings.com', 'russell-speeders-car-wash'],
  ['DN', 'dnllc.com', 'dn-llc'],
  ['Coderio', 'coderio.com', 'coderio'],
  ['NIC MAP', 'nicmap.com', 'nic-map'],
  ['Vested', 'fullyvested.com', 'vested-llc'],
  ['Pacific Quest', 'pacificquest.org', 'pacific-quest'],
  ['Tandems', 'tandems.ai', 'tandems-enterprise'],
  ['EFY Finance', 'efyfinance.com', 'efyfinance'],
  ['Third Plateau', 'thirdplateau.com', 'third-plateau-social-impact-strategies'],
  ['Loop AI', 'loopai.com', 'loopaicom'],
  ['Applied Underwriters', 'auw.com', 'applied-underwriters'],
  ['Apex ABA Therapy', 'apexaba.com', 'apex-aba-therapy'],
  ['Texas Stock Exchange | TXSE Group Inc', 'txse.com', 'txse'],
  ['EARNEST Partners', 'earnestpartners.com', 'earnest-partners'],
  ['Fleetzero', 'fleetzero.com', 'fleetzero'],
  ['MacKay & Somps Civil Engineers, Inc.', 'msce.com', 'mackay-&-somps'],
  ['Moore Colson', 'moorecolson.com', 'moore-colson'],
  ['Yonex', 'yonex.com', 'yonex-co-ltd-'],
  ['Optimize Health', 'optimize.health', 'optimize-health'],
  ['Assist World', 'assistworld.com', 'assistworld'],
  ['Stanley Consultants', 'stanleyconsultants.com', 'stanleyconsultants'],
  ['Wayground (formerly Quizizz)', 'quizizz.com', 'quizizz'],
  ['Progressive Physician Associates, Inc.', 'progressivephysicians.com', 'progressive-physician-assoc'],
  ['Until', 'untillabs.com', 'untillabs'],
  ['Presto', 'prestolabs.io', 'presto-official'],
  ['Windsor Management', 'windsorm.com', 'windsorm'],
  ['Electric Mind', 'electricmind.com', 'electricmind'],
  ['United Aesthetics Alliance', 'unitedaestheticsalliance.com', 'united-aesthetics-alliance'],
];

// 3) TechChecker: full public list (domains from the company table)
const TECHCHECKER_DOMAINS = [
  'marksandspencer.com', 'nationwide.com', 'loblaw.ca', 'appen.com', 'iwgplc.com', 'baptistjax.com', 'udemy.com', 'plexusworldwide.com', 'dassault-aviation.com', 'plannedparenthood.org', 'wynnresorts.com', 'riverisland.com', 'welocalize.com', 'palantir.com', 'zoox.com', 'jobandtalent.com', 'sharkninja.com', 'kitopi.com', 'yle.fi', 'allsaints.com', 'aprio.com', 'pointclickcare.com', 'krohne.com', 'lsa.inc', 'qonto.com', 'zeta.tech', 'netlight.com', 'flashapp.com.br', 'ajax.systems', 'alephholding.com', '3pillarglobal.com', 'bpm.com', 'cirrus.com', 'malt.com', 'girlswhocode.com', 'ghjadvisors.com', 'modeln.com', 'elfbeauty.com', 'hashtagweb3.com', 'hms-networks.com', 'avalerehealth.com', 'metopera.org', 'athletetoathlete.com', 'aka-brands.com', 'pcna.com', 'jupiter.money', 'stanleyconsultants.com', 'cimgroup.com', 'grail.com', 'thereformation.com', 'sakon.com', 'shield.ai', 'safe.security', 'cfs.energy', 'cfgi.com', 'decolar.com', 'gmo.com', 'envato.com', 'bhhc.com', 'okanagan.bc.ca', 'shopback.com', 'airslate.com', 'waterworks.com', 'educative.io', 'getmidas.com', 'mbrdna.com', 'kippsocal.org', 'yummysuperapp.com', 'expeditions.com', 'hcvt.com', 'safetyculture.com', 'entrata.in', 'loblawdigital.co', 'ixom.com', 'obsglobal.com', 'vercel.com', 'applydigital.com', 'parallelwireless.com', 'vevo.com', 'mindtickle.com', 'princesspolly.com', 'jobandtalent.co', 'coda.co', 'equativ.com', 'greenlight.com', 'complex.com', 'bestegg.com', 'icc-cricket.com', 'cambiumnetworks.com', 'caseware.com', 'canvasworldwide.com', 'royalambulance.com', 'riocan.com', 'brightedge.com', 'pip.global', 'impossiblefoods.com', 'amiri.com', 'sosv.com', 'ippon.tech', 'singerlewak.com',
];

// 3b) TechChecker: demo names
const TECHCHECKER_NAMES = [
  'Shopify', 'LinkedIn', 'Remote.com', 'Klarna', 'Palantir', 'Rackspace Technology',
  'TechStars', 'Xero', 'Getty Images', '1Password',
];

// Known slug aliases (name -> lever slug) where slug != kebab(name)
const SLUG_ALIASES = {
  'ci&t': 'ciandt', 'cit': 'ciandt', 'dun & bradstreet': 'dnb',
  'rackspace technology': 'rackspace', '1password': '1password', 'remote.com': 'remote',
  'shield ai': 'shieldai', 'vohra wound physicians': 'vohrawoundcare',
  'lifestance health': 'lifestance', 'techstars': 'techstars', 'winncompanies': 'winncompanies',
  'life stance health': 'lifestance',
};

function slugAlias(name, slug) {
  const n = String(name || '').toLowerCase().trim();
  const s = String(slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (s.length > 2) SLUG_ALIASES[n] = s;
}

function slugify(name, domainHint) {
  const n = String(name || '').toLowerCase().trim();
  if (SLUG_ALIASES[n]) return [SLUG_ALIASES[n]];
  const out = [];
  if (domainHint) {
    const d = String(domainHint).toLowerCase().split('.')[0].replace(/[^a-z0-9-]/g, '');
    if (d.length > 2) out.push(d);
  }
  const base = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (base && base.length > 2) out.push(base, `${base}-inc`, `${base}-corp`, `${base}-2`);
  return [...new Set(out)];
}

async function verifySlug(slug) {
  try {
    const r = await fetch(`https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`, {
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!r.ok) return { ok: false, jobs: 0 };
    const d = await r.json();
    return { ok: true, jobs: Array.isArray(d) ? d.length : 0 };
  } catch {
    return { ok: false, jobs: 0 };
  }
}

async function main() {
  const bb = await bloomberrySlugs();
  console.log('bloomberry exact slugs:', bb.length);
  const { names: tsNames, domains } = await theirStackNames();
  console.log('theirstack names:', tsNames.length);

  const candidates = new Map(); // slug -> { source, jobs }
  for (const s of bb) candidates.set(s, { source: 'bloomberry' });
  for (const d of TECHCHECKER_DOMAINS) {
    const root = d.split('.')[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (root && root.length > 2) candidates.set(root, { source: d });
  }
  for (const [name, domain, uname] of BLOOMBERRY_APP_PAIRS) {
    if (!domains.has(name)) domains.set(name, domain);
    if (uname) slugAlias(name, uname);
  }
  for (const [name, domain] of TS_API_PAIRS) {
    if (!domains.has(name)) domains.set(name, domain);
  }
  for (const name of [...tsNames, ...TECHCHECKER_NAMES]) {
    for (const s of slugify(name, domains.get(name))) {
      if (!candidates.has(s)) candidates.set(s, { source: name.slice(0, 30) });
    }
  }
  console.log('total candidates:', candidates.size);

  const existing = readFileSync(resolve(__dirname, 'jobs-sync.mjs'), 'utf8')
    .match(/'[a-z0-9-]{2,40}'/g).map((m) => m.slice(1, -1));
  const existingSet = new Set(existing);

  const list = [...candidates.keys()].filter((s) => !existingSet.has(s));
  const verified = [];
  const concurrency = 10;
  let idx = 0;
  async function worker() {
    while (idx < list.length) {
      const slug = list[idx++];
      const res = await verifySlug(slug);
      if (res.ok && res.jobs > 0) {
        verified.push({ slug, jobs: res.jobs, source: candidates.get(slug)?.source });
        console.log(`  ✓ ${slug} (${res.jobs} jobs, ${candidates.get(slug)?.source})`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  verified.sort((a, b) => a.slug.localeCompare(b.slug));

  writeFileSync(OUT, JSON.stringify(verified.map((v) => v.slug), null, 1));
  console.log(`verified new slugs (with active jobs): ${verified.length} -> ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
