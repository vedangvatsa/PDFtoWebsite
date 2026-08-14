/**
 * Canonical banned-job title patterns for CVin.Bio.
 *
 * Single source of truth used by EVERY surface:
 *   - ingestion (jobs-sync.mjs)      — never lands in the DB
 *   - site board + company pages      — src/lib/job-apply-source.ts shouldListJobOnBoard
 *   - sitemap gate                    — src/lib/job-assemble.ts jobQualifiesForSitemap
 *   - Telegram posters                — telegram-post.mjs, telegram-ai-jobs.mjs
 *   - cleanup tooling                 — scripts/delete-banned-jobs.mjs etc.
 *
 * Policy: NEVER surface low-level / hourly / service / blue-collar roles
 * anywhere (website, sitemap, JobPosting schema, Telegram, LinkedIn cross-post).
 */
export const BANNED_PATTERNS = [
  // Healthcare / clinical (medical assistants etc.)
  '\\btherapists?\\b', '\\bpsychiatric\\b', '\\bpsychiatrist\\b', '\\bnurse\\b',
  '\\bphysician\\b', '\\bmedical assistant\\b', '\\bphlebotomist\\b',
  '\\bbehavior technician\\b', '\\brbt\\b', '\\bdentist\\b', '\\bdental\\b',
  '\\bpharmacist\\b', '\\bpharmacy\\b', '\\bparamedic\\b', '\\bsurgeon\\b',
  '\\bclinician\\b', '\\boptometrist\\b', '\\bveterinarian\\b', '\\bveterinary\\b',
  '\\bpsychologist\\b', '\\bcounselor\\b', '\\btelemedicine\\b',
  '\\bcertified nursing assistant\\b', '\\bcna\\b', '\\blpn\\b', '\\bemt\\b',
  '\\bemergency medical\\b',
  // Retail / store / sales floor
  '\\bretail ambassador\\b', '\\bstore (opening|associate|manager|lead|director)\\b',
  '\\bbarista(?:s)?\\b', '\\bcashier(?:s)?\\b', '\\bbookkeeper\\b', '\\bsales rep\\b',
  '\\bsales associate\\b', '\\bstore manager\\b', '\\bassistant.*manager\\b',
  '\\bretail\\b', '\\bbrand ambassador\\b', '\\bdispensary\\b',
  '\\bcustomer service representative\\b', '\\bcall center\\b', '\\bkeyholder\\b',
  '\\bfront desk\\b', '\\bsupervisore\\b', '\\bsupervisora\\b', '\\bbutikschef\\b', '\\bshiftleader\\b', '\\bgreeter(?:s)?\\b', '\\busher(?:s)?\\b', '\\bpromoter\\b',
  '\\btelemarketer\\b', '\\bdoor-to-door\\b', '\\bshopper\\b', '\\bstocker\\b',
  '\\bmerchandiser\\b', '\\bvisual merchandiser\\b', '\\bplanogram\\b',
  '\\bretail sales\\b', '\\bshopkeeper\\b', '\\bshop assistant\\b',
  // Food service / hospitality / venue
  '\\bbarback(?:s)?\\b', '\\bbartender\\b', '\\bwaiter(?:s)?\\b', '\\bwaitress(?:es)?\\b',
  '\\bchef(?:s)?\\b', '\\bcook(?:s)?\\b', '\\bdishwasher(?:s)?\\b', '\\bbusser(?:s)?\\b', '\\bhostess(?:es)?\\b',
  '\\bhost\\b(?=[\\s,.-]*$)', '\\bcommis\\b', '\\bsteward(?:s|ing)?\\b',
  '\\bsous chef\\b', '\\bline cook\\b', '\\bprep cook\\b', '\\bkitchen (assistant|hand|porter|staff|team)\\b',
  '\\bfood (runner|server|service|prep|handler)\\b', '\\brestaurant (staff|team|server|host|manager)\\b',
  '\\bbanquet\\b', '\\bcatering\\b', '\\bbar (staff|tender|back|ista)\\b',
  '\\bpastry\\b', '\\bbakery\\b', '\\bice cream\\b', '\\bfast food\\b',
  '\\bwaste (collector|management)\\b', '\\btrash\\b', '\\bgarbage\\b', '\\brecycling\\b',
  '\\breceptionist(?:s)?\\b', '\\brecepci\\w*\\b', '\\bconcierge\\b', '\\bporter(?:s)?\\b',
  '\\bbellhop(?:s)?\\b', '\\bvalet(?:s)?\\b', '\\bdoorman\\b', '\\bbellman\\b',
  '\\b(?:storeroom|restroom|room|bathroom|pool|deck) attendants?\\b', '\\bfront of house\\b', '\\bback of house\\b',
  '\\bserver\\b(?=[\\s,.-]*$)', '\\bhousekeeper(?:s)?\\b', '\\bhousekeeping\\b',
  '\\bmaid\\b', '\\bcleaning\\b', '\\bcleaner(?:s)?\\b', '\\bjanitor(?:s|ial)?\\b', '\\bcustodian\\b',
  '\\bfacilities (assistant|worker|technician)\\b', '\\bmaintenance (worker|tech|technician|assistant|person|staff|crew)\\b',
  '\\bgroundskeeper\\b', '\\bgrounds\\b', '\\blandscap\\b', '\\bhorticultur\\w*\\b',
  '\\bgardener\\b', '\\bgarden center\\b', '\\bnursery\\b',
  '\\bticket (agent|seller|taker)\\b', '\\bparking (attendant|lot)\\b',
  '\\bsecurity guard\\b', '\\bbouncer\\b', '\\blifeguard\\b', '\\bcash collector\\b',
  // Warehouse / logistics / blue collar
  '\\bwarehouse (associate|supervisor|worker|manager|operator|lead|staff|team|person)\\b',
  '\\bwarehouse\\b', '\\bdelivery driver\\b', '\\btruck driver\\b', '\\bdriver(?:s)?\\b',
  '\\bdelivery\\b', '\\bdispatch rider\\b', '\\bdelivery rider\\b', '\\bfood delivery\\b',
  '\\bforklift\\b', '\\bpicker(?:s)?\\b', '\\bpacker(?:s)?\\b', '\\bloader(?:s)?\\b', '\\bunloader\\b',
  '\\bsorter(?:s)?\\b', '\\bpallet\\b', '\\bshipping and receiving\\b', '\\binventory\\b',
  '\\breceiving\\b', '\\bfulfillment\\b', '\\bstockroom\\b', '\\bgrocery (?:associate|associates|clerk|bagger|worker|team)\\b',
  '\\bproduce\\b', '\\bdeli\\b', '\\bmeat\\b', '\\bfishmonger\\b', '\\bbakery associate\\b',
  '\\bmanual labor\\b', '\\bgeneral labor\\b', '\\blaborer\\b', '\\bconstruction (worker|laborer|crew)\\b',
  '\\bconstruction\\b', '\\bpainter\\b', '\\bcarpenter(?:s)?\\b', '\\belectrician\\b',
  '\\bwelder\\b', '\\bmason\\b', '\\broofing\\b', '\\broofer(?:s)?\\b', '\\bpaving\\b', '\\bexcavat\\b',
  '\\bpipefitter\\b', '\\bironworker\\b', '\\bscaffold\\b', '\\bconcrete\\b',
  '\\bdrywall\\b', '\\binsulation\\b', '\\bplumbing\\b', '\\bplumber(?:s)?\\b', '\\bhvac\\b',
  '\\bmechanic(?:s)?\\b', '\\bauto technician\\b', '\\btechnician(?:s)?\\b', '\\bfield service\\b',
  '\\bfield tech\\b', '\\bshop tech\\b', '\\bservice tech\\b', '\\bline tech\\b',
  '\\binstaller\\b', '\\bfabricator\\b', '\\bassembl\\w*\\b', '\\bfactory\\b',
  '\\bmanufacturing\\b', '\\bsoldering\\b', '\\brobot operator\\b', '\\bequipment operator\\b',
  '\\bmachine operator\\b', '\\bproduction\\b', '\\boperator\\b', '\\bforeman\\b',
  '\\bforewoman\\b', '\\bforeperson(?:s)?\\b', '\\bjourneyman\\b', '\\bapprentice\\b', '\\btradesman\\b',
  '\\bcurb\\b', '\\bpowerline\\b', '\\bautocad\\b', '\\bsurvey\\b', '\\bmetal\\b',
  '\\boriginations?\\b', '\\bprep\\b', '\\bdispensary\\b',
  // Security / safety / facilities operations
  '\\bsecurity guard\\b', '\\bcrossing guard\\b', '\\bsafety (officer|attendant)\\b',
  '\\bfire (watch|marshal)\\b', '\\bdispatcher\\b',
  // Support / admin / hourly services
  '\\bdata entry\\b', '\\bclerk(?:s)?\\b', '\\bfiling\\b', '\\btypist\\b', '\\bsecretary\\b',
  '\\badministrative assistant\\b', '\\badmin assistant\\b', '\\boffice (assistant|clerk|boy)\\b',
  '\\bpersonal assistant\\b', '\\bexecutive assistant\\b', '\\bvirtual assistant\\b',
  '\\breception\\b', '\\bswitchboard\\b', '\\boperator, switchboard\\b',
  '\\bteacher\\b', '\\btutor\\b', '\\bteaching assistant\\b', '\\bteacher aide\\b',
  '\\bcaregiver(?:s)?\\b', '\\bnanny\\b', '\\bchildcare\\b', '\\bdaycare\\b', '\\bpreschool\\b',
  '\\bsitter\\b', '\\bpet (care|sitter|groomer|walker)\\b', '\\bdog walker\\b', '\\bgroomer\\b',
  '\\bfitness instructor\\b', '\\bpersonal trainer\\b', '\\byoga instructor\\b',
  '\\bmassage\\b', '\\besthetician\\b', '\\bsalon\\b', '\\bspa\\b', '\\bnail\\b',
  '\\bbarber\\b', '\\bhairstylist\\b', '\\bcosmetologist\\b', '\\bmakeup artist\\b',
  '\\btattoo\\b',
  '\\bpastor\\b', '\\bclergy\\b', '\\bchaplain\\b', '\\bpriest\\b',
  '\\bmonk\\b', '\\bnun\\b', '\\bimam\\b', '\\brabbi\\b',
  // Seasonal / temp / fractional / low-level generic
  '\\bshift (supervisor|leader|manager|lead)\\b', '\\bpart.time\\b', '\\bseasonal\\b',
  '\\btemporary\\b', '\\b1099\\b', '\\bfreelance\\b', '\\bgig\\b', '\\bhourly\\b',
  '\\bentry.level\\b', '\\bno experience\\b', '\\bstudent\\b', '\\bteen\\b',
  '\\bcrew (member|leader|supervisor|team)\\b', '\\bteam member\\b', '\\bteam lead\\b',
  '\\bsupervisor(?:s)?\\b', '\\bassistant manager\\b',
  '\\bstore manager\\b', '\\bassistant store\\b',
  '\\bassistant general\\b', '\\bmanager on duty\\b', '\\bshift manager\\b',
  '\\bkey carrier\\b', '\\bcounter (staff|assistant)\\b', '\\bservice advisor\\b',
  '\\bparking\\b', '\\bcar wash\\b', '\\bdetailing\\b', '\\bauto (detailer|cleaner)\\b',
  '\\bdriver operations\\b', '\\bdashmart\\b', '\\blabri\\b',
  '\\bpeloton expert\\b', '\\bhousekeeping\\b', '\\brunner\\b',
  // Removed-from-site legacy junk
  '\\bwarehouse worker\\b', '\\bwarehouse supervisor\\b',
  '\\bagent, critical incident response\\b', '\\broute to market\\b',
  '\\bsales associate\\b', '\\bretail associate\\b', '\\bcashier(?:s)?\\b',
  // Listing / placeholder titles (RemoteOK nav scrapes, not roles)
  '^jobs?$', '^vacancies$', '^openings$', '^positions$', '^careers$',
  '^opportunities$', '^job title$', '^hiring process$', '^now hiring$',
  '^test job\\b', '\\bpermanent jobs\\b', '\\bwanted jobs\\b', '\\bcasual jobs\\b',
  '^remote jobs$', '^current jobs$', '^open (vacancies|positions|roles|jobs)$',
  '^multiple positions$', '^current(?:ly)? jobs? openings?$',
  '^vacancies [a-z]+$',
];

export const BANNED_REGEX = new RegExp(BANNED_PATTERNS.join('|'), 'i');

/** True when a job title matches any banned low-level / service / hourly pattern. */
export function isBannedJobTitle(title) {
  return BANNED_REGEX.test(String(title || ''));
}
