// Remote Jobs Sync Script — fetches from 9 sources, deduplicates, upserts to Supabase
// Run via: node .github/scripts/jobs-sync.mjs
// Env: SUPABASE_URL, SUPABASE_KEY (service role)

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY');
  process.exit(1);
}

// ─── Tech keywords for tag extraction (regex-matched against descriptions) ───
const TECH_KEYWORDS = [
  'javascript','typescript','python','java','ruby','go','golang','rust','c\\+\\+','c#',
  'swift','kotlin','php','scala','elixir','haskell','perl','lua','dart','r\\b',
  'react','next\\.js','nextjs','vue','angular','svelte','nuxt','remix','gatsby',
  'node\\.js','nodejs','express','fastify','nest\\.?js','deno','bun',
  'django','flask','fastapi','rails','spring','laravel','asp\\.net',
  'aws','azure','gcp','google cloud','firebase','supabase','vercel','netlify',
  'docker','kubernetes','k8s','terraform','ansible','jenkins','ci/cd','github actions',
  'postgresql','postgres','mysql','mongodb','redis','elasticsearch','dynamodb','cassandra',
  'graphql','rest api','grpc','websocket',
  'machine learning','deep learning','nlp','computer vision','tensorflow','pytorch',
  'llm','langchain','openai','gpt','claude','gemini','ai','ml',
  'figma','sketch','adobe xd',
  'tailwind','css','sass','html',
  'git','linux','nginx','apache',
  'solidity','web3','blockchain','ethereum','smart contract',
  'ios','android','react native','flutter','mobile',
  'data engineering','data science','etl','airflow','spark','kafka','hadoop',
  'security','penetration testing','devsecops','soc','compliance',
  'agile','scrum','kanban','jira','confluence',
  'sql','nosql','sqlite','oracle','snowflake','bigquery','dbt',
  'tableau','power bi','looker','metabase',
  'microservices','serverless','event-driven','saas',
  'product management','ux','ui','design system',
  // Role-based keywords
  'sales','marketing','finance','accounting','legal','hr','human resources',
  'operations','support','customer success','business development','partnerships',
  'analyst','recruiter','recruiting','talent','people ops','enablement',
  'content','copywriter','writer','editor','communications','pr',
  'revenue','growth','strategy','consulting','solutions',
  'devrel','developer relations','evangelist','community',
  'program manager','project manager','chief','vp','director',
  'engineer','engineering','architect','infrastructure','platform','sre','reliability',
  'qa','quality assurance','test','testing','automation',
  'intern','internship',
  'frontend','backend','full.?stack','fullstack',
].map(kw => new RegExp(`\\b${kw}\\b`, 'i'));

const KEYWORD_LABELS = [
  'JavaScript','TypeScript','Python','Java','Ruby','Go','Golang','Rust','C++','C#',
  'Swift','Kotlin','PHP','Scala','Elixir','Haskell','Perl','Lua','Dart','R',
  'React','Next.js','Next.js','Vue','Angular','Svelte','Nuxt','Remix','Gatsby',
  'Node.js','Node.js','Express','Fastify','NestJS','Deno','Bun',
  'Django','Flask','FastAPI','Rails','Spring','Laravel','ASP.NET',
  'AWS','Azure','GCP','Google Cloud','Firebase','Supabase','Vercel','Netlify',
  'Docker','Kubernetes','Kubernetes','Terraform','Ansible','Jenkins','CI/CD','GitHub Actions',
  'PostgreSQL','PostgreSQL','MySQL','MongoDB','Redis','Elasticsearch','DynamoDB','Cassandra',
  'GraphQL','REST API','gRPC','WebSocket',
  'Machine Learning','Deep Learning','NLP','Computer Vision','TensorFlow','PyTorch',
  'LLM','LangChain','OpenAI','GPT','Claude','Gemini','AI','ML',
  'Figma','Sketch','Adobe XD',
  'Tailwind','CSS','Sass','HTML',
  'Git','Linux','Nginx','Apache',
  'Solidity','Web3','Blockchain','Ethereum','Smart Contract',
  'iOS','Android','React Native','Flutter','Mobile',
  'Data Engineering','Data Science','ETL','Airflow','Spark','Kafka','Hadoop',
  'Security','Penetration Testing','DevSecOps','SOC','Compliance',
  'Agile','Scrum','Kanban','Jira','Confluence',
  'SQL','NoSQL','SQLite','Oracle','Snowflake','BigQuery','dbt',
  'Tableau','Power BI','Looker','Metabase',
  'Microservices','Serverless','Event-Driven','SaaS',
  'Product Management','UX','UI','Design System',
  // Role-based labels
  'Sales','Marketing','Finance','Accounting','Legal','HR','HR',
  'Operations','Support','Customer Success','Business Development','Partnerships',
  'Analyst','Recruiter','Recruiting','Talent','People Ops','Enablement',
  'Content','Copywriter','Writer','Editor','Communications','PR',
  'Revenue','Growth','Strategy','Consulting','Solutions',
  'DevRel','Developer Relations','Evangelist','Community',
  'Program Manager','Project Manager','Executive','VP','Director',
  'Engineering','Engineering','Architect','Infrastructure','Platform','SRE','Reliability',
  'QA','QA','Testing','Testing','Automation',
  'Intern','Internship',
  'Frontend','Backend','Full Stack','Full Stack',
];

// ─── Banned Jobs Filter ───
const BANNED_PATTERNS = [
  '\\btherapists?\\b', '\\bpsychiatric\\b', '\\bpsychiatrist\\b', '\\bnurse\\b',
  '\\bphysician\\b', '\\bmedical assistant\\b', '\\bphlebotomist\\b',
  '\\bbehavior technician\\b', '\\brbt\\b', '\\bretail ambassador\\b',
  '\\bstore (opening|associate|manager|lead|director)\\b', '\\bbarista\\b',
  '\\bjanitor\\b', '\\bcashier\\b', '\\bbookkeeper\\b', '\\bhvac\\b',
  '\\bplumbing\\b', '\\bplumber\\b', '\\bwarehouse\\b',
  '\\bdelivery driver\\b', '\\btruck driver\\b', '\\bteacher\\b', '\\btutor\\b',
  '\\bcaregiver\\b', '\\bnanny\\b', '\\bhousekeeper\\b', '\\bcleaner\\b',
  '\\bdentist\\b', '\\bdental\\b', '\\bpharmacist\\b', '\\bpharmacy\\b',
  '\\bparamedic\\b', '\\bsurgeon\\b', '\\bclinician\\b', '\\boptometrist\\b',
  '\\bveterinarian\\b', '\\bveterinary\\b', '\\bmassage\\b', '\\besthetician\\b',
  '\\bsalon\\b', '\\bspa\\b', '\\bfitness instructor\\b', '\\bpersonal trainer\\b',
  '\\bpastor\\b', '\\bclergy\\b', '\\bmechanic\\b', '\\bforklift\\b',
  '\\bbartender\\b', '\\bwaiter\\b', '\\bwaitress\\b', '\\bchef\\b', '\\bcook\\b',
  '\\bdishwasher\\b', '\\bbusser\\b', '\\bhostess\\b', '\\bcounselor\\b',
  '\\bpainter\\b', '\\bcarpenter\\b', '\\belectrician\\b', '\\bwelder\\b',
  '\\bmason\\b', '\\bconstruction\\b', '\\bsecurity guard\\b', '\\bbouncer\\b',
  '\\bkeyholder\\b', '\\bretail\\b', '\\bdispensary\\b',
  '\\bpsychologist\\b', '\\bdashmart\\b',
  '\\bshift (supervisor|leader|manager)\\b', '\\bcall center\\b',
  '\\bsoldering\\b', '\\bmanufacturing\\b', '\\brobot operator\\b',
  '\\bequipment operator\\b', '\\bassembl\\w*\\b', '\\bfactory\\b',
  '\\bdispatcher\\b', '\\bdriver\\b', '\\bdelivery\\b',
  '\\binventory\\b', '\\breceiving\\b', '\\bfulfillment\\b',
  '\\btechnician\\b', '\\bbrand ambassador\\b', '\\bpart.time\\b',
  '\\bseasonal\\b', '\\b1099\\b',
  // Additional patterns for junk slipping through
  '\\bforeman\\b', '\\bforewoman\\b', '\\bjourneyman\\b',
  '\\banimal\\b', '\\bhusbandry\\b', '\\binfusion\\b', '\\bmicrobiology\\b',
  '\\blaboratory tech\\b', '\\blab tech\\b',
  '\\bfield service\\b', '\\bfield tech\\b',
  '\\bshop tech\\b', '\\bservice tech\\b',
  '\\binstaller\\b', '\\bfabricator\\b', '\\bmaintenance\\b',
  '\\broofing\\b', '\\bpaving\\b', '\\bexcavat\\b', '\\blandscap\\b',
  '\\bpipefitter\\b', '\\bironworker\\b', '\\bscaffold\\b',
  '\\bconcrete\\b', '\\bdrywall\\b', '\\binsulation\\b',
  '\\bsales rep\\b', '\\bsales associate\\b',
  '\\bstore manager\\b', '\\bassistant.*manager\\b',
  '\\bRN\\b', '\\bLPN\\b', '\\bCNA\\b', '\\bEMT\\b',
  '\\bcustodian\\b', '\\bgroundskeeper\\b',
  // Round 3 — still slipping through
  '\\bproduction\\b', '\\boperator\\b', '\\bpilot\\b', '\\bsurvey\\b',
  '\\bsupply chain\\b', '\\bgrounds\\b', '\\bline tech\\b',
  '\\bcurb\\b', '\\bpowerline\\b', '\\bice cream\\b',
  '\\bhelicopter\\b', '\\bautocad\\b',
  '\\boriginations?\\b', '\\bmetal\\b', '\\bprep\\b',
  '\\btelemedicine\\b',
];
const BANNED_REGEX = new RegExp(BANNED_PATTERNS.join('|'), 'i');


// ─── Greenhouse company slugs to fetch ───
const GREENHOUSE_SLUGS = [
  '10xgenomics','6sense','able','abnormalsecurity','absci','accuweather','acumen','adahealth','adaptivebiotechnologies','adyen',
  'adzuna','affinipay','affirm','aftership','agoda','airbnb','airship','airtable','alayacare','algolia',
  'allegro','alpaca','alphasights','amount','amperity','amplitude','anthropic','apollo','applovin','appsflyer',
  'apptronik','aptoslabs','arizeai','asana','attentive','augury','aura','automox','autoscout24','axios',
  'b12','bandwidth','bark','baton','betterment','binance','bird','bitgo','bitly','bitmex',
  'bitpanda','bitso','bitwarden','blend','block','blockchain','bloomworks','branch','branchmetrics','braze',
  'brex','bringg','bugcrowd','builder','buildkite','builtin','butterflynetwork','buzzfeed','bybit','c3iot',
  'c6bank','cabify','cabin','calendly','calm','cameo','capitolis','carbon','careem','cargurus',
  'caribou','carta','carvana','censys','cerebral','cerebrassystems','checkr','cheddar','chime','circ',
  'circleci','civisanalytics','clarifai','classpass','clear','cloudflare','cloverhealth','cloverly','clutch','coactive',
  'cockroachlabs','codex','cognism','coinbase','collectivehealth','collibra','community','conga','consensys','contentful',
  'contextualai','convene','corescientific','coreweave','coterieinsurance','coursera','crayon','cresta','cribl','crowdstreet',
  'crunchyroll','cts','cultureamp','curative','customerio','cuyana','cybereason','cypressio','d2l','dagger',
  'databricks','datadog','datarails','deepmind','degreed','descript','developmentseed','dialpad','digimarc','digitalservice',
  'disco','discord','disney','dispatch','doctolib','dollarshaveclub','doma','dominodatalab','doordashusa','drivewealth',
  'dropbox','duolingo','earnin','ebanx','elastic','emarketer','embroker','epicgames','equalexperts','equityzen',
  'ethoslife','eucalyptus','everlane','extend','faire','fandom','fastly','feedzai','figma','figureai',
  'finitestate','fireblocks','fireworksai','five9','fivetran','fleetio','flexport','flickr','form3','formhealth',
  'forward','founders','fourkites','fubotv','gather','gemini','genesis','genius','getyourguide','ghost',
  'gitlab','glassdoor','glossier','goatgroup','gocardless','godaddy','gofundme','gostudent','govtech','grafanalabs',
  'grailed','gramgames','graphcore','greenhouse','grin','groupon','grovecollaborative','grover','gumgum','gusto',
  'gympass','happymoney','helium','hellofresh','heycar','heygen','highradius','hologram','homechef','homelight',
  'homeward','hootsuite','hopskipdrive','housemarque','hubspot','icon','ideo','idme','ifit','ignition',
  'iherb','imgur','indigo','inflectionai','infosum','inmobi','innovid','instacart','intercom','iterable',
  'jamasoftware','jetbrains','jfrog','jumia','jumio','justworks','kaggle','karat','karbon','khanacademy',
  'kiavi','kickstarter','kite','klaviyo','knock','komodohealth','kungfuai','labelbox','later','lattice',
  'launchdarkly','layerzerolabs','lead','leaflink','learnupon','lendingtree','letsgetchecked','life360','liftoff','lightningai',
  'lightricks','linkedin','lithic','liveperson','lob','lokalise','loop','lucidmotors','luno','lyft',
  'magic','magicleap','mark43','marqeta','masterclass','mattermost','medium','mejuri','melio','mercari',
  'mercury','messari','mindbody','misfitsmarket','mixmax','mixpanel','mmhmm','mongodb','monzo','motional',
  'motive','mozilla','myheritage','mythicalgames','n26','natera','nativeinstruments','neo4j','nerdy','netlify',
  'newrelic','newton','nextiva','nextroll','nomadhealth','noredink','novacredit','nubank','nuro','observeai',
  'odeko','offerup','okta','okx','omadahealth','onemedical','onestudyteam','onetrust','openweb','oportun',
  'orchard','oscar','outschool','outside','pacaso','pagarme','pagaya','pagerduty','pandadoc','papa',
  'partnerstack','pathai','payoneer','pebblepost','peloton','pendo','philo','phonepe','picsart','pieinsurance',
  'pinterest','planetscale','platformsh','pleo','poshmark','postman','postscript','prisma','project44','protonai',
  'qualtrics','quintoandar','quip','reach','recharge','redbadger','reddit','relativity','remesh','remote',
  'renttherunway','rigup','riotgames','ripple','ritual','robinhood','roblox','roku','roofstock','route',
  'rubrik','ruggable','sada','salesloft','salsify','sambanovasystems','samsara','saucelabs','scaleai','science37',
  'scopely','seatgeek','seesaw','send','sendbird','sendcloud','sendle','sertis','sezzle','shakepay',
  'showpad','sidecarhealth','similarweb','sisense','skyscanner','smartlyio','smartsheet','snorkelai','sofi','sojern',
  'solarisbank','spaceship','spacex','spin','splice','spothero','stabilityai','stackexchange','stitchfix','stockx',
  'stone','storyblocks','stripe','submittable','sumup','sweetgreen','swingeducation','taboola','tailscale','tanium',
  'taxbit','tempo','temporal','tenstorrent','tes','textio','thedutchie','theiconic','thinkific','thirdlove',
  'thirtymadison','thoughtworks','tifin','toast','togetherai','tomorrow','touchbistro','traderepublic','transmitsecurity','tripactions',
  'tripadvisor','triplelift','trivago','trove','truelayer','truepill','twilio','twitch','typeform','uberfreight',
  'udacity','udemy','udio','unbounce','unity3d','updater','upgrade','upstart','upstatement','upwork',
  'urbansportsclub','vacasa','vectara','vedantabiosciences','vercel','veriff','verkada','verve','vicarioussurgical','videoamp',
  'vonage','voxmedia','vtex','wallapop','warp','waymark','waymo','webflow','weee','weploy',
  'wheely','wildlifestudios','wizeline','wonderschool','workato','workstream','wunderkind','xai','xendit','yext',
  'yld','yotpo','zenbusiness','zenoti','zenrows','zestai','ziprecruiter','zola','zoominfo','zscaler',
  'zuora','zwift'
];

// ─── Ashby company slugs ───
const ASHBY_SLUGS = [
  '0g','10xteam','1password','1sphere','3imembers','8fleet-inc','9-mothers','9fin','Cyberhaven','a-place-for-mom',
  'a-team','abby-care','abe','abound','abridge','absentia-labs','academia','accurx','achira','acorns',
  'acquisition','activesite','adaption','adaptive','adaptive-ml','adaptivesecurity','addi','additiveai','adonis','adtucon',
  'afterquery','agent','agentio','agi-inc','aiand','aida','aidkit','airapps','airbound','airbyte',
  'airgarage','airops','airspace-intelligence.com','airtasker','airwallex','aiwyn','alan','alcazar-energy','alchemy','alembic',
  'aleph','alephalpha','alexai','alleviatehealth','allium','alljoined','allspice','almabase','almedia','alpenlabs',
  'alternativepayments','altimate','ambiencehealthcare','ambient.ai','ambrook','ami','amo','amperos','amplitude','amplo',
  'anagram','anatomy-financial','anglehealth','anima','anrok','ansiblehealth','answersnow','antares','anterior','antithesis',
  'anyscale','anysignal','anything','anyvan','apex-technology-inc','apexgrowth','applied','applied-behavioral-services','april','aqua-voice',
  'aquarianlp','arago','arb-interactive','arbiter-ai','arbor','arcade','arcade-ai','arch.co','archive','arena',
  'arkenstonedefense','arlo','array-behavioral-care','artemis','artisan','asari.ai','ascertain','ashby','ashgro','asimov',
  'aspora','assembledhq','assorthealth','assured','assured-health','astera','astral','astro-mechanica','astronomer','asymmetric.re',
  'ataraxis-ai','athena-hq','athenaactuarial','atlan','atlas','atlasresidential','atob','atomic','atomicindustries','atroposhealth',
  'atticus','attio','august-health','aurelian','aurorasolar','authzed','ava-labs','aven','avid4','avida',
  'away','axelera','axiom','axiombio','axion','axle-health','baba','backflip','backflip.ai','backmarket',
  'bankjoy','barkbus','barnes','barti','base','base-power','baseten','basiccapital','basis-ai','basis-research',
  'bastion','baton','bayesianhealth','beam','beamery','beamimpact','bedrockocean','ben','benchling','bespokelabs',
  'bestow','better-mortgage','betterup','bevel','biconomy','binance.us','bioptimizers','blackbird-labs-inc','blacksmith','bland',
  'blissway','blockhouse','blockworks','blossom-health','blp-digital','blueberrypediatrics','blumen','bobyard','bookkeeper360','boost',
  'botcrew','bounce','brainco','brainly','braintrust','branchlab','bravehealth','bree','brellium','brightstar-ai',
  'brightwheel','brigit','brinc','brisk-teaching','bubble','buffer','build','buildout','bullpen-talent','bunch',
  'bunkerhillhealth','bureau','burklandassociates','buspatrol','camber','cambio','cambly','campfire','campus','camunda',
  'canals','candidhealth','cantina','canvas-medical','cape','carbonx','cardless','careers.azx.io','cargado','cargo-one',
  'cartesia','cas','casap','casca','causal','causaly','cbai','cchn','centivo','chainalysis-careers',
  'chalkboard','chambercardio','chapter','character','charthop','chatbase','checkly','chestnut','chromatic','chronospherejobs',
  'circuithub','citizen','civilgrid','claim-health','claritypay','claritypediatrics','clarium','clasp-group','claylabs','clearco',
  'clearvector','clerk','clickup','clipboard','clipbook','close','cloudzero','clubhouse','cluely','coactive',
  'coalesce','cobot','coder','coderabbit','codes-health','coefficientgiving','cognition','cohere','coinflow','coinhako',
  'cointracker','colonist','column','comfy-org','comity','commonroom','commons','commure','company','composio',
  'compound','concourse','conduct','conduit','confiant','confluent','conscious-talent','continue','contra','convey',
  'coreflow','coreoftheheart','cortea','cosmos','counsel','coursecareers','cow-dao','cradlebio','creatify','critical-energy',
  'crosby','crusoe','cruxclimate','cryptio','cubby-beds','cube','cubesoftware','curri','cursor','cuspai',
  'cybcube','cyber.fund','cyberhaven','cylinderhealth','cytora.com','cyvl','d-matrix','dailypay','dakota','dandy',
  'darkroom','dash0','datacurve','dataguard','dataplor','datasnipper.com','datologyai','dave','david-ai','davidenergy',
  'davistechnologymanagement','day9','daydream-ai','decagon','decart-ai','decimal','deel','deepgram','deepl','deepnote',
  'deepsky','deepslate','deeptune','definelycareers','dehazelabs','delinea','deliveroo','delphi','delve','demandbase',
  'depthfirst','develop-health','devsavant','dexmate','diagrid','directive','dispatch','distributed-spectrum','ditto','diversified-botanics',
  'docker','doppler','doss','dottxt','double','doxy.me','drata','dreamthree','dualentry','dubclub',
  'duck-duck-go','duckbill','duet','duna','dune','dust','dyna-robotics','e2b','earthforce','easygenerator',
  'easyllama.com','echo','ecosia.org','edia','edra','edsights','edvisorly','egra','eigen-labs','eightsleep',
  'ekho','ekumenlabs','electric','element451','elevenlabs','eliseai','eliza','elliptic','ello','eloquentai',
  'ema','embedding-vc','emerald-ai','emora-health','empirical-security','empora','endex','endgame','endurance-energy','ens-labs',
  'equal-ventures','equip','ernest','espa','espresso','essentialai','etched','ether.fi','ethereum-foundation','ethglobal',
  'eventual','everai','everfield','everops','everself','everstar','evertune','every-io','exa','exegy',
  'expressable','extend','eyebot','ezhealth','eztexting','factory','faculty','far.ai','farmraise','farsight',
  'fathom.video','featherlessai','feathr','fernstone','fieldguide','figure','filmhub','fin','finch','finni-health',
  'firecrawl','firstmate','firstround','firststreet','fitt','fizz','flagright.com','flai','flashbots.net','fleetline',
  'fleetpulse','fleetworks','flint','flipturn','floatme','flora','flowengineering','flowhub','fluency','flux',
  'focused','found','foundry-for-good','fourier','fourth-power','fractional-ai','freed','frequence','freshpaint','frontcareers',
  'fuel-cycle','fulcrum','fullstory','fundamentalresearchlabs','fundwell','further','furtherai','fuse','futurefitai','futureproofing',
  'g2','g2i','gamechanger','gamma','garage','general-medicine','generalintelligencecompany','generalist','genomics','geoforce',
  'gigaml','gitbook','givebutter','glacis-ai','glide','glimpse','global-x-etfs','glomo','glow25','go-nimbly',
  'goanagram','goldsky','golinks','goodship','goodstack','goody','gorgias','gotphoto','govdash','goveagle',
  'govsignals','govwell','gptzero','granola','graphite','graphitehq','gravityclimate','greatquestion','green-tree-school-and-services','greenlitecareers',
  'gridcare','gridunity','gruntwork','grvt','gt-bio','haast','hackerone','hadrian-automation','halliday','handshake',
  'handspring','hang','hanover-park','happyrobot.ai','harmonic','harvey','hatch','haus','hawk','hawkeyeinnovations',
  'haydenai','haystacknews','hcompany','healthaxis','healthprogresshub','healthsherpa','hedra','heidihealth.com.au','heirloomcarbon','helion',
  'helius','hellobrightline','hellohera','hellopatient','helm-ai','helpscout','heron-power','heyjobs','higharc','highbeam',
  'highlightai','hightouch','hiive','hims-and-hers','hirehangar','hive.co','hivehealth','hivesmart-consulting','hiya','hockeystack',
  'homebase','homebound','homevision','honeydew','hopper','horizon3ai','hotspexmedia','hoxtonfarms','hubstaff','hud',
  'hudu','humaans','human','human-computer-lab','humans-and','humatahealth','hyperbolic','hypercubic','hyperexponential','hyperhug',
  'ideals','ideogram','idler','illumio','immersivelabs','imprint','improbable','impulse','inertia','inference',
  'infinite','infinity-constellation','infisical','injective','innate','inngest','insitro','inspectiv','instructure','intellistack',
  'interaction','interface','interplay','interrahealth','intro','intus','ironcladhq','iverify','jampack-ai','january',
  'jbs-dev','jellyfish','jellyfishcareers','jerry.ai','jimdo.com','join9am','joinbetter','joinsherpa','joor','joyfulhealth',
  'judgmentlabs','juicebox','julius','jump','jump-app','junction','junior','junipersquare','justplay-gmbh','k-id',
  'kale','kalibri-labs','kalshi','kamiwaza','kayak','keep','kernel','kilocode','kin','kindred',
  'kirin','kit','kiwi','known','knox-systems','kodex','kognitos','kognity','kojo','kombo',
  'kong','kraken.com','krea','kueski','kustomer','ladder','lambda','lancedb','langchain','lap',
  'lark','latamcent','latitudecareers','laurel','lawhive','layerfi','leadbank','leandata','leantechniques','leap',
  'leapsome','ledger','legionhealth','leland','lemlist','lemonade','lendable','leona','level','levelpath',
  'lgads','li.fi','libra','lido.fi','life-space-digital','lightdash','lightning','lightspark','lilt-corporate','limble',
  'linda','lindy','linear','linera.io','linqapp','liquid-ai','listenlabs','liv-golf','livekit','livinghr',
  'lm-studio','loancrate','logiqal','loom','loot-labs','lottie','lovable','loveholidays','lpadesignstudios','luminai',
  'luminary','lydian','lynk','lyric','m-kopa','mach','mach9','macroscopic','madhive','magic.dev',
  'magical','magiceden','magicschool','maincode','mainstay','mandolin','mangomint','manifest-law','manusai','mapbox',
  'maple','marble','marianaminerals','mariner-careers','marloo','marshmallow','masabi','maticrobots','matter-intelligence','matter-labs',
  'maximustribe','maybern','mazedesign','mazehq','mebe','mechanize','medely','medraai','medscout','meetmarvin',
  'megazone','menlosecurity','mercor','merge','meridianlink','meshy','metaforms','metaview','meter','method',
  'mexdigital','midstream','mindbeam','mindly','mindvalley','mintlify','mirage','miri','miro','miter',
  'mobasi','mobbin.com','modal','modernfi','moderntreasury','modus','moego','molecule-software','monaco','monarchmoney',
  'monsters','montecarlodata','moonlake','moonshot-ai','moonvalley-ai','moraleshr','mosaic','mosey','motherduck','motorway',
  'moxfive','moxie','mubi','mudflap','multiply','multiverse','mural','mux','mystenlabs','mytomorrows',
  'n1','n8n','nabihealth','nango','nash','nationgraph','nectar-social','nelo','neon','nerdwallet',
  'nest-health','nestmed','nestveterinary','netboxlabs','netgear','nethermind','netic','netwealth','neuroscale','nevoya',
  'new-story','newform','newfront','newlantern','nextpatient','nexus.xyz','nexxa','nightfall-ai','nimbl','nivoda',
  'noda-ai','noise-labs','nomos','norm-ai','northwoodspace','nory','notable','notion','novita-ai','novo',
  'nucleus','nudge','numeral','numeric','nuna','nursa','oakland-feather-river-camp','observable-space','obviant','obvio',
  'obvious','ocra','odys-aviation','odyssey','office-hours','omaze','omnea','omni','omniscient','one-pass-solutions',
  'oneapp','onebrief','onecrew','oneleet','onepot','onereach.ai','oneschema','onhires','onramp','opal',
  'openai','openevidence','opengov','openhands','openhomefoundation','openrouter','opensea','opfoundation','oplabs','opslevel',
  'optimum','optro','opus1','opusclip','orb','orbit','orbital','orca','orchard','orum',
  'osmo','oso','oumi','outpost','outpostnow','outset','outsmart','outtake','overflow','overviewenergy',
  'owner','oxio','oxman','oyster','p2p.org','paddle','palette-media','palmstreet','pano-ai','panoptyc',
  'parabola-io','paradigm','paradox','parafin','paraform','paragon','parallel','parashift','pareto-ai','parity',
  'parker','partiful','partsbase','passage','passport','patch.io','patreon','payabli','pebl','peek',
  'people-culture-talent','peppr','perchwell','perk','permitflow','perplexity','persona','persona.ai','phantom','phia',
  'phil','phoebe','phoebe-work','phoenix','phonic','physicalintelligence','pika','pinecone','plaid','plain',
  'planehr','plantingspace','plasma','plasmidsaurus','plaud','playground','playson','pleo','pluralfinance','pmmalliance',
  'pod-network','podium-automation','poesis','polaranalytics','polymarket','poolside','popl','posh','posh-ai','poshmark',
  'posthog','powerus','pravah','prefect','prelim','primary','primeintellect','primer','primer.io','prior-labs',
  'procurementsciences','procurify','prodigy-education','product-now','profound','project-expedition','prokeep','promise','promise-studios','prompt',
  'propelus','protege','provable','proxima-fusion','puzzle.io','pylon','pylon-labs','pythnetwork','quadrivia','qualified',
  'quant-aq','quantware','quarks-tech','quartermaster','quicknode','qumis','quora','quotewell','rabot','radai',
  'raiku','railway','rain','ramp','range','raspberry','raycast','reacher','read-ai','ready',
  'real','rebecca-school','recraft','red-gate','redpine','reducto','reedsy','reevo','reflect-orbital','reflectionai',
  'reflexrobotics','reflow','reframesystems','regent','rehire','reindeer-ai','reinforce-labs-inc','reka','reklamehealth','relay',
  'relayfi','relayprotocol','remarcable-inc','remedyrobotics','render','renuity','replit','replo','reprally','reprise',
  'rerun','rescale','resend','resq','restream','retell-ai','rev','reve','revenuecat','revic',
  'reviserobotics','revv-hq','rewind','rho','ridealso','rilla','rillet','river','riveron','roadsurfer.com',
  'roboflow','rogo','roo-code','roompricegenie','rothys','rowan','ruby-labs','rula','rundoo','runna',
  'runway','rwazi','rythm','s2','safelease','sagelabs.ai','sahara','salesape-ai','salient','sanctuary',
  'sandbar','sandboxaq','sanity','sapiom','sardine','satispay','savvy','scalemath','scaler','scan-com',
  'scarlet','scorewarrior','scribdinc','scribe','sdsc','seamflow','seconddinner','sellfire','semgrep','seneca',
  'sensmore','sent','sentient','sentra','sentry','seon','sequence','serverobotics','sesame','sevaro',
  'sevenai','sfcompute','shepherd','shiftkey','shortstory','sibill','siena','sierra','sierra-studio','sieve',
  'siftstack','signalwire','sigp','silver','sim','simular','siro','sisu','sitemate','siteminder',
  'skimmer','skydio','skymavis','skynrg','slant','slash-financial','sleeper','slingshotai','slope','smallest',
  'smalls','smallstep','smartleaf','snappy','snd','snowball','snowflake','snyk','sobek-ai','socure',
  'softwarevision','sola','solace','solanalabs','somethings','somnia','sonio','sourgum','span','span.app',
  'spare','speak','speakeasy','spear-ai','spearbio','specter','spexi','spherical','spiral','squads',
  'squint.ai','ssi','st-labs','stable','stacker','stackone','stainlessapi','standardfleet','starbridge','starpath.space',
  'startvim','stash','statista','statsig','stay22','stayai','staycation','steel','stellar-health','stepful',
  'stickermule','strategic-growth-partners','stream','streetgroup','strongdm','stronghold','stuut-ai','stytch','substack','subzero',
  'suite-studios','sunday','sunflower-sober','suno','supabase','super.com','superdial','superhuman','superlinear','superpower',
  'suzy','swans','swarmer','sweedpos.com','sweep','swoop','sydecar','symbiotic','symmetry','synquery',
  'synthesia','synthflow','synthpop','tabs','tabz','taekus','tajir','take2','taktile','talentsafari',
  'talkiatry','talos-trading','tarro','tavahealth','tavily','tavus','taxfix.com','teal-health','teambridge','teamworks',
  'technimove','teleskope','tem','tempo','tempo-xyz','tenexlabs','tennr','tensorwave','teraswitch','terraai',
  'terranova','tessera-labs','texture','the-exploration-company','the-flex','the-global-talent-co','the-learning-spectrum','the-studio','theflex','themindcompany',
  'thesis','thewfsgroup','theydo','thndr','thought-machine','thrill-labs','tigerdata','tilthq','timely','tin-can',
  'titan','titan-ai','tldr.tech','toma','toms','toogeza','topline-pro','toposbio','traba','trainline',
  'transfr','transgrid-energy','traversal','trawa','treeswift','tremendous','triumph-arcade','truelogic','trust-wallet','truthsystems',
  'tryalma','tunnl','turnstile','turquoise-health','twelve','twelve-labs','twenty','twin-so','tyba','udisc',
  'uipath','unify','union','union-tech','uniswap','unit','unit410','unitxlabs','universalagi','unlearn',
  'unstructured','unwrap','uplane','upside','upside-tech','uptimeai','upvest','usekernel','usul','vanilla',
  'vanta','vantageanalytics','vapi','vector','vegaclaims','vellum','vendelux','vercel','versemedical','vertical-aerospace',
  'verto','vetcove','vibe','vibecode','vibiz','vinci4d','virtahealth','virtuous','vitalize','vitvio',
  'viz.ai','voldex','vori','vow','voxel','vynca','wagmo','walrus','warp','watershed',
  'wealth-com','wealthsimple','weave','weaviate','webai','weekend','wellth','what3words','wheel','whetstoneresearch',
  'whippy','winona','wisp','wispr-flow','wistia','withclutch','withdaydream','withdefault','withpulley','withwisdom',
  'witnessai','woflow','wordsmith','workweave','workyard','worldly','wrapbook','writer','wundergraph','xbowcareers',
  'yeet','yendo','yondr','you-health','yourco','zapier','zayzoon','zed','zeely','zello',
  'zencastr','zenjob','zero','zerorfi','zettabyte-space','zip','zippymh','zyphra'
];

// ─── Workable company slugs ───
const WORKABLE_SLUGS = [
  '15five','3pillarglobal','6sense','9fin','a-team','abe','able','abridge','academia','accurate',
  'accurx','achievers','achira','acorns','activecampaign','acumen','adaptive','huggingface','midjourney','oysterhr',
  'writesonic'
];

// ─── Lever company slugs ───
const LEVER_SLUGS = [
  '15five','1inch','3pillarglobal','accesssoftek','accurate','achievers','activecampaign','addx','aeratechnology','aero',
  'agiloft','air-tek','airalo','aircall','airtasker','aleph','allegiantair','alltrails','ambergroup','analyticpartners',
  'anchorage','angellist','animocabrands','anomali','apolloagriculture','appen','appen-2','applydigital','appzen','arcadia',
  'arrivelogistics','artera','articulate','assist-world','ataccama','atlassian','basis','bazaarvoice','benchsci','better',
  'binance','blablacar','bloom','bluebottlecoffee','bluecatnetworks','bluelightconsulting','bounteous','brevo','brighte','brightmachines',
  'brightwheel','brilliant','brillio-2','bumbleinc','businesswire','butcherbox','cagents','capital','captivateiq','carbonhealth',
  'celestia','cellares','centrifuge','cents','certifyos','chownow','ciandt','cic','civitech','clari',
  'clarifyhealth','cleanspark','clearcapital','cloudinary','coalfire','coingecko','coinmarketcap','coins','collabora','color',
  'comply','connectly','contentsquare','cred','crowdriff','crypto','d2l','datalabusa','deleteme','deliverect',
  'demo','deputy','digimarc','digitalmediamanagement','disher','dlocal','doola','dreamgames','drivetrain','dronedeploy',
  'educative','elfbeauty','emitwise','emma-sleep','employ','enable','enki','equativ','erg','esper',
  'eternal','everbridge','everlywell','ezcater','factor','fampay','farfetch','fatetherapeutics','fevo','fi',
  'field-ai','filevine','finch','find','finn','fiscalnote','floqast','freedompay','freeletics','fresha',
  'freshworks','gearset','genesis','getlabs','getwingapp','gopuff','greenlight','h1','happyco','happyhiller',
  'harmony','hcvt','healthcare','heartbeathealth','highspot','hightechhigh','ion','ivo','jamcity','jetbrains',
  'jobandtalent','jumpcloud','justwatch','kabam','kavak','kepler','kiddom','kinsta','klivvr','kogan',
  'kpler','kraken','kraken123','kubra','labelbox','ladders','lalamove','lamudi','latch','lemon',
  'lendbuzz','levelai','levelup','lever','leverdemo-8','linkedin','loadsmart','logz','lucidworks','lumivero',
  'lumotive','luxurypresence','lyrahealth','mactores','mahmee','masterycharter','matchgroup','matillion','medium','meesho',
  'megaport','mendix','merklescience','metabase','metaprise.ai','metopera','metr','mindbloom','mindtickle','minted',
  'mistral','morningbrew','morningconsult','musixmatch','nava','neighbor','neon','netflix','netomi','newton',
  'nielsen','nimblerx','ninjavan','nium','nominal','novatalent','numeris','offchainlabs','omnisend','openx',
  'outreach','owner','palantir','palo-it','parallelwireless','patsnap','pattern','payjoy','paytm','pditechnologies',
  'peakgames','peerspace','penumbrainc','people-ai','peoplegrove','perforce','petvisor','picklerobot','pipedrive','pivotal',
  'placemakr','plaid','planettechnologies','planner5d','plexus','plusgrade','pointclickcare','poki','polleverywhere','pp-la',
  'ppfa','ppgny','prismic','proof','proper','prosper','protective','protolabs','provi','qonto',
  'quantcast','quantummetric','questanalytics','quokka','rackspace','rainfocus','realself','redsox','regrello','relay',
  'researchgate','restaurant365','revel','revhealth','rhombus-systems','rise','rivr','ro','robust-ai','rover',
  'safe','sanabenefits','sanctuary','sandboxvr','saviynt','sensortower','shieldai','shopback-2','signal','simplybusiness',
  'singerlewak','skyslope','smarsh','smart-working-solutions','snaplogic','snowplow','sonatype','sophos','spotify','spreedly',
  'spreetail','sprucesystems','stackblitz','standtogether','stax','suger','supermove','superpedestrian','superside','sure',
  'surglogs','swordhealth','symplicity','synthego','sysdig','tackle','tala','talkwalker','tapasmedia','tealbook',
  'teamsnap','tecton','teikametrics','teleport','telesat','terminus','textnow','theathletic','theblockcrypto','thimble',
  'thinkahead','thinkingbox','toku','tonkean','topanga','torchdental','trueml','trunkio','trustly','ttecdigital',
  'txidigital','uberflip','unico','upguard','vacancies','veeva','vendavo','venteur','veo','vergesense',
  'versapay','vevo','vida','vivrelle','voodoo','vrchat','walkme','waveapps','wealthfront','wealthsimple',
  'whereby','whoop','willowinc','wisdomai','wonolo','workramp','workwave','wr','z1tech','zensurance',
  'zeta','zinier','zocks','zoox'
];

// ─── Helpers ───
function dedupHash(company, title) {
  const normalized = `${company.toLowerCase().trim()}|${title.toLowerCase().trim()}`;
  return crypto.createHash('md5').update(normalized).digest('hex');
}

function extractTags(text) {
  if (!text) return [];
  const found = new Set();
  for (let i = 0; i < TECH_KEYWORDS.length; i++) {
    if (TECH_KEYWORDS[i].test(text)) found.add(KEYWORD_LABELS[i]);
  }
  return [...found];
}

function normalizeJobType(raw) {
  if (!raw) return null;
  const t = raw.toLowerCase().replace(/[_-]/g, ' ').trim();
  if (t.includes('full') && t.includes('time')) return 'full_time';
  if (t.includes('part') && t.includes('time')) return 'part_time';
  if (t.includes('contract')) return 'contract';
  if (t.includes('freelance')) return 'freelance';
  if (t.includes('intern')) return 'internship';
  return raw;
}

async function fetchExistingKeys() {
  // Wait for connection pool to drain after massive parallel fetches
  await sleep(2000);
  
  // Fetch all existing dedup_hashes AND external_ids from DB to skip duplicates client-side
  const allHashes = new Set();
  const allExternalIds = new Set();
  let offset = 0;
  const pageSize = 1000;
  let retries = 0;
  while (true) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/jobs?select=dedup_hash,external_id&offset=${offset}&limit=${pageSize}`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      if (!res.ok) break;
      const rows = await res.json();
      if (rows.length === 0) break;
      for (const r of rows) {
        allHashes.add(r.dedup_hash);
        if (r.external_id) allExternalIds.add(r.external_id);
      }
      offset += pageSize;
      retries = 0; // reset on success
    } catch (e) {
      retries++;
      if (retries > 5) { console.error('  ❌ fetchExistingKeys failed after 5 retries'); break; }
      console.log(`  ⚠ fetchExistingKeys retry ${retries}/5: ${e.message}`);
      await sleep(3000 * retries);
    }
  }
  return { allHashes, allExternalIds };
}

function isProbablyEnglish(title) {
  if (!title) return true;

  // 1. Block non-Latin scripts completely (Cyrillic, Chinese, Japanese, Korean, Arabic)
  const nonLatinRegex = /[\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hangul}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Arabic}]/gu;
  if (nonLatinRegex.test(title)) {
    return false;
  }

  // 2. Common non-English job title role keywords
  const nonEnglishKeywords = [
    // French
    'développeur', 'développeuse', 'logiciel', 'logiciels', 'ingénieur', 'ingénieure', 'ingénieurs',
    'alternance', 'alternant', 'alternante', 'stagiaire', 'stagiaires', 'concepteur', 'conceptrice',
    'chef de', 'stage de', 'chargé de', 'chargée de', 'collaborateur', 'collaboratrice',
    // Spanish / Portuguese
    'desarrollador', 'desarrolladora', 'desarrolladores', 'desenvolvedor', 'desenvolvedora', 'desenvolvedores',
    'ingeniero', 'ingeniera', 'ingenieros', 'ingenieras', 'engenheiro', 'engenheira', 'engenheiros', 'engenheiras',
    'estagiário', 'estagiária', 'estagio', 'becario', 'becaria', 'prácticas', 'practicas',
    // German
    'entwickler', 'entwicklerin', 'entwicklers', 'softwareentwickler', 'softwareentwicklerin',
    'ingenieur', 'ingenieurin', 'praktikant', 'praktikantin', 'praktikum', 'werkstudent', 'werkstudentin',
    'leiter', 'leiterin', 'mitarbeiter',
    // Italian
    'sviluppatore', 'sviluppatrice', 'sviluppatori', 'ingegnere',
    // Dutch
    'ontwikkelaar', 'ontwikkelaars', 'stagiair', 'stagiairs', 'stagiaire'
  ];

  // Normalize by removing diacritics
  const normalizedTitle = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const normalizedNonEnglishKeywords = nonEnglishKeywords.map(w => 
    w.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  );

  for (const word of normalizedNonEnglishKeywords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalizedTitle)) {
      return false;
    }
  }

  return true;
}

async function supabaseUpsert(jobs) {
  // Deduplicate by external_id in-memory (prefer external_id over dedup_hash)
  // Also discard jobs matching the BANNED_REGEX or non-English titles
  const seen = new Map();
  let bannedCount = 0;
  for (const job of jobs) {
    if (job.title && (BANNED_REGEX.test(job.title) || !isProbablyEnglish(job.title))) {
      bannedCount++;
      continue;
    }
    const key = job.external_id || job.dedup_hash;
    if (!seen.has(key)) {
      seen.set(key, job);
    }
  }
  const unique = [...seen.values()];
  console.log(`   Dropped ${bannedCount} banned/irrelevant/non-English jobs.`);
  console.log(`   After in-memory dedup: ${unique.length} unique jobs`);

  // Pre-fetch existing keys to skip duplicates client-side
  console.log(`   📥 Fetching existing keys from DB...`);
  const { allHashes, allExternalIds } = await fetchExistingKeys();
  console.log(`   📥 Found ${allExternalIds.size} existing external_ids, ${allHashes.size} hashes in DB`);

  // A job is new only if BOTH its external_id AND dedup_hash are absent from DB
  // This prevents cross-source duplicates (same company+title from RemoteOK vs Greenhouse)
  const newJobs = unique.filter(j => !allExternalIds.has(j.external_id) && !allHashes.has(j.dedup_hash));
  const skippedCount = unique.length - newJobs.length;
  console.log(`   🆕 ${newJobs.length} new jobs to insert (${skippedCount} already exist)`);

  if (newJobs.length === 0) {
    return { inserted: 0, skipped: skippedCount };
  }

  // Batch insert only new jobs — 200 per batch, 50 concurrent
  const batchSize = 200;
  const concurrency = 5;
  let inserted = 0;
  const batches = [];

  for (let i = 0; i < newJobs.length; i += batchSize) {
    batches.push(newJobs.slice(i, i + batchSize));
  }
  console.log(`   📤 Inserting ${batches.length} batches of ~${batchSize} (${concurrency} parallel)...`);

  async function insertBatch(batch) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?on_conflict=external_id`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates,return=representation',
        },
        body: JSON.stringify(batch),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const result = await res.json();
        return result.length;
      } else {
        const err = await res.text();
        // If dedup_hash conflict, try row-by-row (slower but handles cross-source dupes)
        if (err.includes('dedup_hash')) {
          let count = 0;
          for (const job of batch) {
            try {
              const r2 = await fetch(`${SUPABASE_URL}/rest/v1/jobs?on_conflict=external_id`, {
                method: 'POST',
                headers: {
                  'apikey': SUPABASE_KEY,
                  'Authorization': `Bearer ${SUPABASE_KEY}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'resolution=ignore-duplicates,return=representation',
                },
                body: JSON.stringify([job]),
              });
              if (r2.ok) { const r = await r2.json(); count += r.length; }
            } catch {} // silently skip individual dupe failures
          }
          return count;
        }
        console.error(`  ❌ Batch error: ${err.substring(0, 200)}`);
        return 0;
      }
    } catch (e) {
      console.error(`  ❌ Batch failed: ${e.message}`);
      return 0;
    }
  }

  // Fire all batches with concurrency limit
  for (let g = 0; g < batches.length; g += concurrency) {
    const group = batches.slice(g, g + concurrency);
    const results = await Promise.all(group.map(b => insertBatch(b)));
    for (const r of results) inserted += r;
    console.log(`   ✅ Group ${Math.floor(g / concurrency) + 1}/${Math.ceil(batches.length / concurrency)} done (${inserted} inserted so far)`);
  }

  return { inserted, skipped: skippedCount + (newJobs.length - inserted) };
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Source: RemoteOK ───
async function fetchRemoteOK() {
  console.log('\n── RemoteOK ──');
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'Mozilla/5.0 (CVin.Bio job aggregator)' }
    });
    const data = await res.json();
    // First element is metadata, rest are jobs
    const raw = Array.isArray(data) ? data.slice(1) : [];
    const jobs = raw.map(j => ({
      source: 'remoteok',
      external_id: `remoteok_${j.id}`,
      dedup_hash: dedupHash(j.company || '', j.position || ''),
      title: (j.position || '').trim(),
      company: j.company || 'Unknown',
      company_logo: j.company_logo || j.logo || null,
      location: j.location || 'Remote',
      job_type: normalizeJobType(j.type) || 'full_time',
      salary: j.salary_min && j.salary_max ? `$${j.salary_min}-$${j.salary_max}` : (j.salary || null),
      description: (j.description || '').substring(0, 5000),
      tags: j.tags?.length ? j.tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)) : extractTags(`${j.position || ''} ${j.description || ''}`),
      apply_url: j.apply_url || j.url || `https://remoteok.com/remote-jobs/${j.slug || j.id}`,
      category: j.tags?.[0] || null,
      published_at: j.date || null,
    })).filter(j => j.title && j.company);
    console.log(`  Found ${jobs.length} jobs`);
    return jobs;
  } catch (e) {
    console.error(`  ❌ RemoteOK error: ${e.message}`);
    return [];
  }
}

// ─── Source: BambooHR (per-company) ───
const BAMBOOHR_SLUGS = [
  '100percentgroup','1010games','10squared','10tengaming','10web','116andwest','12thstreetauto','12thtribe','1648factory','17capital',
  '17live','17triggers','1inch','1milk2sugars','1office','1steps','1stforawarding','1stmile','1stnationalbankslu','1to1',
  '1upnw','1valet','2020mobile','206toursold','211nemichigan','211tampabay','21stcenturyrehab','22bet','22w2','2centricllc',
  '2circleinc','30fe','31greenltd','350','360communityservices','3ap','3cat','3fs','3keel','3peaksadvisors',
  '3yourmind','401auto','42crunch','434marketing','4dmedical','50can','50north','5icloudsolutions','603legalaid','826boston',
  '8rivers','97thfloor','98ventures','99drive','a4hc','aaalandscape','aamci','aap','aapchr','aasafetyinc',
  'aatransporting','abasolutions','abaxx','abd','abellgroup','abfnhc','abiresearch','able','ableartswork','aboitiz',
  'abortionfunds','aboutenergyuk','abpharmacy','abqcf','absci','absedu','absidefense','abyss','academielafayette','academyofalameda',
  'accelbyte','accelion','accesscommunitycare','accessnow','accessreproductivejustice','accessstar','accesssupportnetwork','acclaro','accountable2you','accuratetemps',
  'accwis','acddirect','acecaremgmt','aceinc','acelabio','acemetal','acerta','acgf','achievebh','achieveit',
  'acino','ackard','acleddata','aclions','acludc','aclunv','acolin','acord','acornbiolabs','acornstrategy',
  'acsinspiroz','actionaidinternational','actionaidzimbabwe','actionsquared','activeviam','actonadu','acts29','adamsindustries','adamsmiles','adcraft',
  'addi','addictiontreatmentservices','addium','adeptag','adhdonline','adi','adinstruments','adistec','adna','adsalarm',
  'adsignal','adso','adtechholding','adterra','advancemetrics','adventgroup','adventistmediaministries','adventservices','adverscale','advertisepurple',
  'aecc','aeis','aeratechnology','aerialcanvas','aero','aerobotics','aerodynamics','affinitydigital','afg','afhs',
  'aflatoun','afn','africanclimatefoundation','africansafariwildlifepark','africastalking','afteam','aftership','ageofunion','agilebridge','agilityfeat',
  'agnesirwinschool','agorocarbon','agriconnect','agritechnovation','agua','ahandyhomeinspector','ahcmo','ahkgroup','ahpd','aicadium',
  'aicdac','aim','aimhigh','aimsnei','aiopsgroup','airapps','aircall','aircontrolaz','aircraftperformancegroup','airprodiagnostics',
  'airthings','airwallex','airx','aisle518','aisobservers','aiu','aivo','ajmenvironmental','akcelo','akerbiomarine',
  'akinox','akjchem','aklamio','akoyabio','akselos','alabamaagcredit','alabamapublictv','alan','alaskacenter','alaskacf',
  'alaskaspca','alayacare','albanycountygov','albertagrains','albertamt','alchemab','alclvma','aldridgesecurity','alembic','aletheiahp',
  'alexandriasheriffsoffice','algaktiv','algolia','algorandfoundation','alicetechnologies','alimentiv','aline','alkira','allbeauty','alleghenycounty',
  'allhabitat','allianceaba','alliancebuilds','alliancehhcs','alliancetrustco','alliedgold','allinenergy','alloptions','alloralabs','allout',
  'allpressespresso','allsopsoftware','alltogetherrecovery','alminerech','alnafrica','alpaca','alpega','alphabrandmedia','alphafx','alphahousecalgary',
  'alphasights','alt21','alta','altaconstruction','altenar','alterainvestments','alterian','alterome','altitudegroup','altrogco',
  'altusincii','aluminiumstewardship','alumis','alzheimerjourney','amadeuscapitalaccount','amanacare','amazeeio','amazingmagnets','amazonfrontlines','ambank',
  'ambergroup','americanalpineclub','americanbankmontana','americandatanetwork','americanflyers','americanlumber','americanrivers','americansunited','ameripharma','amgmed',
  'amii','amnestykenya','amo','amputeecoalition','amsm','amwhealth','anaergia','anapaya','anaqua','anchoragelandtrust',
  'anchorageparkfoundation','anchorqea','andaria','andava','andersonair','andglobal','anecdotes','anew1','anewhope','angelhost',
  'animalercare','animalsasia','animaltrust','animalz','animassurgical','anixe','anmut','ann','anonm','anonyome',
  'answerport','antare','antares','anteristech','anthem','anthill','anthonyharper','anufamilyservices','anvilsecure','anyon',
  'anyvan','aoasis','aoicorp','aoracing','ap10','apaa','apadventista','apcawl','apexbuilding','apexdki',
  'apexgcs','apexkhomecare','apextraderfunding','apfc','apgecommerce','apichaya','aplusgaragedoors','apngroup','apollo','apolloscooters',
  'appalachian','applewoodfixit','applied','approvepayments','apr','aprime','aptose','aqt','aquaexpeditionshr','aquanty',
  'aquaterra','aqueoussolutions','arca','arcadian','arcetyp','archagana','archford','archipelagocos','arcoirisschool','arcpower',
  'arcprograms','arctickingdom','arctiq','ardeneng','ardenwood','ardmac','arenko','ariateurope','arielre','arisehomes',
  'arkeabio','arksen','armakuni','arraymarketing','arroyotrabuco','artbio','artidea','artistsreenvisioningtomorrowinc','artivabio','arubahemotionalhealth',
  'arvore','asana','asbell','ascendenthealth','ascendigo','ascensionrecovery','ascentprostaff','asemio','asfg','asgi',
  'ashememorial','ashesi','ashteadtechnology','asimo','asmllc','aspenfire','aspennature','aspenridgell','aspireearlylearningacademy','aspireeducationalservices',
  'aspiretech','assemblybioinc','assistambulance','associatedambulance','astcorp','astrak','asuresoftware','asylumaccessco','asyousow','atabus',
  'atchleycpas','atex','athena','athenastudio','athenslifefellowship','atheycreek','atiinc','atijet','atlantaglow','atlanticdigital',
  'atlanticoralsurgery','atlas','atlascredit','atlasexcavating','atlasgroupcos','atlashotels','atlatl','atlbeltline','atomic','atomicroastery',
  'attendanceondemand','attentivecareservice','atthegrounds','audax','audimute','audoo','augury','augustrosehc','auipower','aura',
  'auriens','ausland','australeducationgroup','autocab','autochlor','autograph','autonettv','avaindustries','avantinsurance','avantpage',
  'avanzallc','avenuefive','avenuetwotravel','avfrd','aviationrepair','avidbots','avina','avjet','avnan','avon',
  'awcc','awcsolutions','awesomemotive','awh','awhnet','awp','axiom','axios','axjs','axya',
  'aypa','azayaranch','azerion','azolver','b2xcare','b4networks','babyscripts','backyardbookkeeper','bag','bahamas',
  'bahras','bahspets','baileyharris','baileylauerman','baileynelson','bakerave','bakertillyrsg','balancetreatment','baldwinemc','baldwinfamilyhealthcare',
  'baldwinshell','balfour','balladgroup','ballerinafarm','balticapprenticeships','baltimorewatertaxi','bamstrategy','banac','bandc','bandsintown',
  'baptist','bare','bark','barnacleparking','barnstormvfx','barrinc','barringtonstageco','barristonlaw','bartowbuilders','base',
  'basemakers','basicresearch1','basigo','basketballengland','batimoinc','battenkill','baumtech','bayesianhealth','bayfarm','bayswater',
  'bayvenues','baywasolarsystems','bb4ck','bbagency','bbbne','bbcontracting','bbf','bbmrieric','bc2','bcca',
  'bcinvasives','bcndpcaucus','bcocpa','bddec','bdhall','bdozambia','beaconconnections','beadindustries','beam','beamery',
  'bearingbronze','beatyctech','beatymasonry','beauregard','beckautogroup','becore','bedc','beeflambnz','beehivepr','beelineloansinc',
  'bekhealthcorp','belaircare','belaydiagnostics','bellgroup','belmar','beltonmo','bemyguest','ben','benchmarkdatasolutions','benderuk',
  'beneng','bengenro','benjipays3','bentleyschool','bentonvillear','beqom','bergstrom','berkeleyfirststeps','berkshiregrey','berlinpackaging',
  'bermudaskyport','bestow','bethanyassemblymi','bethebusiness','betonalfa','beverlysbirthdays','beyondexpectation','beyondplay','bfaglobal','bforeai',
  'bfweng','bga','bgcengineering','bgcgarfield','bgmgroup','bhrrc','bhspc','bickhamservices','bidayamedia','bigleap',
  'bigstonecounty','bigtimepestcontrol','bikesonline','billigence','bimeda','binera','binnie','binsentry','binsky','bioconnect',
  'biofiredefense','biolite','biologicaldiversity','biomeafusion','biophorum','bioratherapeutics','birchcreekenergy','birchmeregroup','bird','birdbuddy',
  'birdcontrolgroup','birdscanada','bisc','bison','bitaksi','bitcoin','bitgo','bitly','bitrise','bitsinglassca',
  'bitso','bitwerxinc','bitwizards','bkimechanical','bklconsultants','blackfeministfuture','blackhillsblend','blackmountainroadpet','blackrock','blackrockasphalt',
  'blackrockresort','blackstoneenergy','blacksunplc','bladmin','blairfamilysolutions','blanclabs','blank','blastone','bleems','blinknow',
  'block64','blockaero','bloedelreserve','bloomadsglobalmedia','bloomapp','bloomtherapycenter','bluearray','bluecadet','bluecanyontech','bluelayer',
  'bluelotuschai','blueorchard','bluepi','blueprintsubsea','bluestonepim','blufftonfd','blumetric','blunierbuilders','bmcc','bmeinsurance',
  'bmit','bn','bnktothefuture','bnrconsulting','bobpultechevrolet','boffoproperties','bofish','boilermasters','boilerroom','boldcommerce',
  'boldprogressives','boltontechnology','bonaventurelab','bonhams','bonnessinc','bontonassociates','bookouture','boombit','boomerconsulting','boonesupportedliving',
  'boostcyac','bosta','bostonanalytical','bostonlyricopera','botpress','boulderruralfire','boundarystonepartners','boundless','bowery','bowtie',
  'boxpower','boxtlimited','bprd','bpsbioscience','bradfordearlyed','bragggaming','brainbox','brainrocket','brainstorm','braintrusttutors',
  'branch','branchtechnology','branco','brandlive','brankas','bravebe','bravebison','bravehealth','bravomedia','brdaelectric',
  'breakthroughmontessori','brekhustile','breuckelenathletic','brevo','brhd','bricartsmedia','bridgephilanthropicconsulting','bridgespcs','bridgetownnaturalfoods','brigadebgc',
  'brightbeginningskids','brighthope','brighthouse','brightiron','brightline','brightmachines','brighttax','brighty','brinerbuilding','bringoz',
  'brinkersjewelers','britishvethospital','brittradius','brms','broadcastmgmtgroup','broadviewnetworks','broadway','broccolini','brockpest','brokerchooser',
  'brooklynlaboratoryschool','brooks','brotherhoodsistersol','brpcc','brydens','bsi','bspcpa','bsr1','bssd','bta',
  'bucketlist','buddle','buddlefindlay','buddyboss','budge','budgetease','budibase','buffalogardens','build','buildcommonwealth',
  'buildinghopeinthecity','buildology','buildsafe','bulmanndock','buoyhealth','burai','burdgdunham','burnsandfarrey','burrowslightbourn','busbud',
  'businessinstincts','businessprocessingsolutions','bustransportation','butlerlaw','button','buttonis','buyken','bvifinance','bvifsc','bvitourism',
  'bvmcapacity','bxcc','byassociationonly','byrnezizzi','c3tricities','c40','caahep','caanv','cabinetpeaks','cabinforestry',
  'cachet','cacindinc','cacjamaica','cadencetranslate','caedpartners','cafairplan','cagc','cahull','cairo','calartscap',
  'calbright','calcasieulibrary','caleja','calgary','calgaryjohnhoward','callabco','callenlenz','calproinspectiongroup','calsolarinc','caltog',
  'caltrout','calvarypsl','calvoices','calyanwaxco','cambridgeaudio','campbelltaylorwashburn','campeon','campfireak','campfireco','campharborview',
  'campuskey','canacad','canadahanson','canadapooch','canadianallianceofphysiotherapyregul','canadianclimateinstitute','canadianfiberoptics','cancersupportcommunity','candide','candisolar',
  'caninecraze','canyoncontracting','canyonhills','cap','capcade','capegroupca','capitafinancialnetwork','capitollanguageservices','caplena','capnz',
  'caporegon','capricornholdings','capstonesolutions','captivateiq','carbon60','carboncure','cardijncollege','cardinal','cardinaleducation','carebook',
  'carecounseling','careertech','carehousing','careoworld','carepay','carepros','caribou','caringacross','caringnetwork','caristo',
  'caritasau','carleycorp','carlsmed','carms','carolinasolarservices','carval','cas','casadolcecasa','casc','caseiq',
  'caseys','cassini','castoredc','catalystcounseling','catchmaster','catconsult','catface','catholiccharitiesdiocese','catulpa','cawh',
  'caymanentcity','cb20','cbaytrust','cbcl','cbi','cbtreatmentcenter','ccasantafe','ccawpa','cccnetwork','cccnip',
  'ccegolfcars','ccem','ccetompkins','cchihr','cchs','ccic','cciemployment','ccim','ccinc','cciottawa',
  'ccmalta','ccncp','ccocanada','ccosda','ccpa','ccsamerica','ccsao','cctc','cd','cdcw',
  'cdcyukon','cdental','cdg','cdispaces','cdpl','cdsi','cece','cedarstone','cedp','ceis',
  'celearningsystems','cellulant','celsius','celticchicago','cenfri','centerforcoalfieldjustice','centerforlargelandscapeconservation','centerpoint','centracom','centralcalasthma',
  'centralchurch','centralchurchnyc','centralozarks','centralvalleyelectric','centralwindowcleaning','centricmarketing','centro','centron','centurysolutionsgroup','ceporg',
  'ceras','cerbexa','cercanomanagement','ceresai','ceresproject','certex','certifiedangusbeef','certifiinc','cet','cexio',
  'cfci','cfe','cfef','cfgch','cfhd','cfltreatmentcenters','cfmni','cfmt','cfpbmc','cfsconsulting',
  'cfvc','cgcd','cgfag','cgibson','cgs','chainstack','chalmerscenter','channelassistca','chantengineering','chapal',
  'chapelpointe','characterstrong','charadance','chargelab','chargy','charitonvalley','charlestoncollegiate','charlottecentercitypartners','charmfertility','charter',
  'charteroakhomecare','chasf','chci','checkcenters','checkoffyourlist','chemcosystems','chemtek','chenbro','chereeberry','cheryindustrial',
  'chespenn','chfbc','chgroup','chi','chickaloon','childcareaware','childpeace','childrensgym','chime','chimp',
  'chinooktx','chnw','choicelunch','choiceptc','chowdeck','christiancountylibrary','christianheritage','christianpost','christireece','chrysos',
  'chugachts','ci2','cialdnb','cicc','ciellos','cielorg','cifar','cigrovestx','cihadf','cilaschool',
  'ciltd','cim','cinc','cineflix','cinesitelondon','cinesitemontreal','cinesitevancouver','cira','circahr','circlecardiovascularimaging',
  'circleccdc','circledesk','circuit5','ciri','cirm','cisnwmi','ciswo','citherapies','citizengo','citwa',
  'citykidz','cityofbeavercreek','cityofhamilton','cityofhorseshoebay','cityofjackson','cityoflakeport','cityofmarion','cityofrockport','cityofstmarys','civicainfrastructure',
  'civicus','civilians','civitascapital','cjairport','cjc','clarity','claritycx','claritytech','clarkconstruct','clarkre',
  'clarkwilsonllp','classicfls','classifiedcycling','classtechnologies','clayclerk','cleaningconcierge','cleanriteri','cleantekinc','clear','clearbridge',
  'clearcapital','clearobject','clearspace','clearwaterconstructioninc','clearwaygroup','cleio','clemonsmgmt','clevermethod','cleverprofits','clfns',
  'clgs','clhmentalhealth','clickandgrow','clickfunnels','climartis','climatech','climatefocus','climatefundmanagers','climatepolicy','climatiqtech',
  'climbingcentregroup','clincloud','clinicaromero','clinicforspecialchildren','cliosnacks','clockwork','close','closedloop','closertohome','cloudbrigade',
  'cloudfirst','cloudheadgames','cloudhop','cloudland','cloudmargin','cloudsmith','clovealliance','cludo','clutch','clvgroup',
  'clward','cmciks','cmecorporation','cmgt','cmhaca','cmhahkpr','cmhapeel','cmhawecb','cmis','cmlabs',
  'cmsllc','cmtsllc','cnas','cnwr','coachem','coactive','coaf','coastalclaims','cobizcpa','cobot',
  'coc','cochraneco','codafication','codecool','codemettle','codimitepvt','cofchurch','cognira','cognitivesystems','cognits',
  'cogo','cohere','cohocollective','coinmarketcap','coins','cokerlegal','colden','colearn','collectiveacegmbh','collegehill',
  'collinsmachine','color','coloradolegalservices','colorsxstudios','comlinksolutions','comlux','commercialpaintingco','commissionaires','commonhealthaction','commonjustice',
  'commonpurpose','commonscompany','commonsensenetworks','commonsku','commonwise','communityactionskagit','communitybiblechurch','communitylifellc','communitylivingdufferin','communityoutreach',
  'communitytransitws','company','company119','compassdevco','compassionandchoices','compasspathways','compgihealth','compinghr','completesol','compulsiongames',
  'compuraymedical','computerdataservices','concirrusltd','concord','concretetech','condley','condoauthorityontario','conduit','conetec','conexiom',
  'congerbuilt','connectchildcare','connectcpa','connectionsforfamilies','connellypartners','connorconsulting','conrado','consensus','consensusinc','consol',
  'consolidated','constantine','constellaintelligence','constructdigital','constructivebio','consultssda','consulum','contentguru','context1','contextglobal',
  'contextlabs','contexture','contfinco','continentalmanufacturing','contractexteriors','controlledenviro','convergenceisrael','cookbrothersbars','cookingwithkids','coolchurch',
  'coollaw','coople','copacino','coppertreesolutions','coralbeachandtennisclub','core3','coregeomatics','coretransformers','coreuk','coria',
  'cornelisnetworks','cornelltechnicalservices','cornerstonefader','cornerstonesupportservices','cornerstonevalley','corovets','corpcareservices','corpsnetwork','cortina','coschedule',
  'cosgravelaw','cosmos','costofwisconsin','cotn','couch','counciloneducationforpublichealth','counseling4kids','counterpoint','countrysidevetcare','countyrescueservices',
  'couriernewsroom','coutoconstruction','covechurchministries','covenanttech','coveocean','covergenius','covertswarm','coviance','covu','coxecurry',
  'coyoterock','cpehn','cpjorg','cppi','cqfluency','cr2','crccsvic','crcfo','cre','createto',
  'creativechurch','creativemarketing','creativeresearchsolutions','creativespeechsolutions','creatoraccountabilitynetwork','creatv','credentcare','creditbook','creditrepaircloud','creditsystemsintl',
  'cressetgroup','creweadvisors','crholdingslimited','cribl','crinsurance','criscpa','crisisaction','criteriacorp','croftsystems','cronometer',
  'cronoseuropa','cronoslabs','crosscreeknursery','crosslcms','crossroadscharterschools','crossroadshealth','crossroadsmission','crowdriff','crowebgk','crownautogroup',
  'crtriangle','crystaltravel','csgeneticsltd','csidmc','csiltd','csipacific','csjax','cssindustrial','csswashtenaw','csusai',
  'ctgbrands','ctherm','cthumanities','cti','ctiinc','ctmins','cubecare','cubelabs','culturalsurvival','cultureamp',
  'cunninghamcontracts','cureepilepsy','currenxie','curriegroup','curtinmaritime','cusointernational','customhomemedic','custominterface','customsoftwaresystems','cutwel2',
  'cuunderconstruction','cva','cvg','cvha','cvims','cvnm','cvos','cvsc','cvssvets','cwcos',
  'cwlt','cxfort','cybcube','cyc','cydaptivsolutions','cygcap','cylynt','cynwavesolutions','cyrc','cys',
  'cysec','d1g1t','d2x','d3systems','dagarchitects','dailypay','dakcs','dakotacarrier','dakotawoodlands','dakwakada',
  'dalee','dalstudentunion','damstratechnology','danacole','danaid','dandgcompanies','danica','danielfraimanconstruction','dappradar','darkslope',
  'darrschackowinsurance','daso','data4','databox','datacoresystems','datalabusa','datameer','datapelago','dataprophet','datascience',
  'datavalet','dauphin','davidkohn','davidnicebuilders','daviesallen','davismoore','dawnaerospace','dayoneintegrativeservices','daytranslations','dbgroup',
  'dcara','dcbel','dccollaborative','dciconsult','dcmol','dcs','ddcos','deciphex','decisivedividenduni','deckwise',
  'decode','deepgram','deepisolation','deepsea','deepwindoffshore','defiant','definitionchurch','degservices','dehamerlandscaping','delegatesolutions',
  'delinebox','delphidigital','delta40','deltagroup','deltasecurity','deltavinc','delvedc','demariabuildingcompany','demersbeaulne','demetres',
  'demmelearning','demo','denizen','denova','dentistadvisors','depaul','derevo','dermalogica','deserttech','designeradvantage',
  'designlab','designs','destinationbc','destinyrescue','detroitit','detroitparentnetwork','developmentaloptions','devhd','deville','devnw',
  'dfn','dfnetresearch','dga','dgi','dharmannstudios','dhdc','dhjj','diagnostykadigitalhub','dicamlandscaping','dietzlerconstruction',
  'digco','digdeep','diginex','digitainsoftware','digitaldays','digitaled','digitalfrontiers','digitalplanet','dijeauconstruction','dileonardo',
  'diligentpharma','directaccessathome','directagents','directcareresources','directom','discoursemedia','discoverafricagroup','discoverylandco','discussio','dispatch',
  'displaydata','displaysweet','distillersr','ditto','diverseworkspdx','dividedsky','divinityfamilyservices','dizolve','dlocal','dmgblockchain',
  'dnadesign','docaid','docker','docsdiesel','doctoranywhere','doctorshospital','dodsgroupltd','dogwoodalliance','dogwoodmedia','dohop',
  'dolinsgroup','domogroup','dontpaniclabs','dorepartnership','dorot','dotcms','doublemaviation','douglasguardian','douglaspcs','doverco',
  'doveschoolsoklahoma','doveschoolstulsa','dovetailandinterlakes','dovevirtual','doyle','dps','dpworldvancouver','drainedge','drapercity','drbarbarasturm',
  'drclean','dreaam','dreamcenterevansville','dreamcorps','dreamgames','dreamhaven','dreamprogram','dropgroup','dropsuite','drruscio',
  'drugpolicy','druidhillscdc','dsqtechnology','dssasia','dstaffing','dstllc','dteehf','dtpd','dtree','dualinventive',
  'dubak','ducker','duco','dune','dunetechnology','duplo','duradigital','duxburybeach','duxtoncapital','dvmelite',
  'dws','dxs','dymin','dynamicconcepts','dywidag','e360','e3g','e7solutions','eaglebuilderslp','eaglequest',
  'eaie','eajservices','earlymedical','earthalivect','earthbalance','earthbound','earthcraft','earthfreshatl','earthoptics','earthrightsinternational',
  'earthshotprize','eastdilsecured','eastlandfood','eastoaklandcollective','eastpointenergy','eastwestcenter','eastwestcollege','ebiquity','ecallogy','ecglasshr',
  'echotechnologies','eco','ecogra','ecokedu','ecologyproject','ecomwise','econoler','ecosulis','ecotech','ectcharity',
  'ectel','edenroc','edgeworks','edifyorg','editshare','edpro','educationstrategyconsulting','educative','efifoundation','efmpc',
  'eggfarmersofcanada','ehcc','eikenhout','eiminc','eisgroup','eiturbanmobility','ejscenter','ekohe','ekonapower','eksobionics',
  'elanorhotels','elaw','electropagesltd','electroroute','elementalenzymes','elementalled','elementary','elementthree','elephas','eleventhhourgames',
  'elfbeauty','elfuturo','elicio','elitecamps','elitedanceacademy','elitedigital','elitehomerehab','elitestaffingandconsulting','elitetm','elkgroveparks',
  'elmdenegroup','eltropy','elvh','embed','embers','embroker','emedgroup','emeraldcloudlab','emergentclimate','emgacquisitions',
  'emilanderson','emilyshope','emitknowledge','emmanuelcommunitychurch','emoryday','empirepls','emporix','empoweredservices','emptor','ems',
  'emtd','emvs','enable','enablenetworks','enablingqapital','encepta','encircleapp','encompasssupport','endace','endcitizensunited',
  'endeavoursolutions','energiseenergy','energyexemplar','energyroofingco','energyworldnet','energyx','enfinite','engage3','engagestar','engageware',
  'enghouse','enginedigital','enlightenoperationalexcellence','enlyft','enpowered','enscharterschool','ensiteusa','ensurge','entratus','envhh',
  'enviolo','environmentalleague','envisioninggreen','envitia','eo','eoeveryone','eonhealth','eosaircraftinc','epicchq','epicpharmacy',
  'epperheimerinc','epsgroupinc','epsilonassociates','eptec','equalexperts','equalityfund','equalrights','equantiis','equativ','equilliumbio',
  'equiposoventix','equity','erdosmiller','ereztech','ergosolutions','eriemutual','eriksen','erling','esglobalsolutions','eskasonischoolboard',
  'esoppartners','espositoconstruction','espositoelectric','espressive','essiejusticegroup','etax','eteamsponsor','ethereum','ethicalpower','ethixbase360',
  'ethos','ethoscare','ethoseng','etika','etr','etsllc','eugenecascadescoast','eugenechamber','euna','europa',
  'evalan','evangel','evanshunt','evconstruction','eventconnect','eventmobi','eventsair','eventussystems','everettsautoparts','evergreenefficiency',
  'evergreenoutdoorcenter','everguard','everstake','eversum','everydata','everydaymassive','everymanjack','everymarket','evidenceaction','evisions',
  'evoketechnologies','evolutionq','evolutionwellnessnc','evolve','evolvemkd','ewbinc','exa','exceldriverservices','excelpropane','excelsiorwellness',
  'exceptionalwellnesscounseling','exclusivecleaning','executiveoption','exocelbio','exogroup','exostellar','expedock','expivia','explorance','exportpackers',
  'expreecu','expressiongames','extonsfoods','extracellular','extrastaff','extremitycare','eystwales','ezypay','fabledata','facit',
  'factorytechnologies','fai','fairoakspark','faithcoenterprises','faithlife','fallriverelectric','familyark','familyfutures2','familypromiseinc','familyreliefresources',
  'familytransitionplace','fanbase','fapeinado','farharoofing','fariscapital','faristeam','farmersstatebank','farmlandfoods','farnsworthartmuseum','farotech',
  'fastepp','fasthorseinc','fatiguescience','faxoutreach','fbcs','fbtax','fcaa','fcchudson','fcds','fe',
  'fedsoc','feisst','felicianservices','felix','felixforyou','fellowapp','fems','fenetresconcept','fertifa','fesslerbowman',
  'fevertree','ffbd','ffcbfundingcorp','ffoxservices','fhtechnc','fibersmith','fido','fieldinstitute','fightinequality','figure',
  'figure1','filamentgames','fileinvite','finalstrikegames','financeincorporated','finbourne','finceptiv','finchmaloney','fincoreltd','finitecarbon',
  'finnomena','finoragroup','finsana','finsolutia','finspec','fintechos','fireflynw','fireflypartners','firmanirrigationandtreeservice','firmo',
  'firrp','firstalliancechurch','firstamendmentcoalition','firstcareservices','firstfederalcommunitybank','firstlightai','firstnationscapital','fiscalfx','fishingpointhc','fispan',
  'fittes','fitzmaurice','fivejars','fivestones','fivetran','fixposition','fl0','flagshipbio','flagstaffshelterservices','flashfood',
  'flaviar','flchealth','fleetalliance','fleetio','flemingmedical','flextrade','flightschedulepro','flint','flipany','floomenergylaw',
  'florenceeiseman','flourishventures','flutterwavego','flxpoint','flyingbark','fmsaerospace','fnsb','foe','foho','fontisenergy',
  'foodbanksmississauga','foodee','foodhero','foodhub','foodpeople','foodrecoverynetwork','forcemanager','forecasthq','forefrontpower','forensicaccess',
  'formulafig','forsite','fortehealth','fortris','fortunatemedia','fortwhyte','forvismazarssingapore','forward','forwardcareers','fosfeminista',
  'fossilfuelnpt','fotokite','fourgen','fourinc','foxgroupcanada','foxlogistics','foxnspfra','fpchq','fpwa','frac',
  'framecad','fransenpittman','fraserco','fraserengineering','fraxion','fray','freakoutglobal','fredolivieri','fredrogers','freedmanhealth',
  'freedomchurchsc','freedomhomecarellc','freedomprep','freemanlandscape','freepress','fremontbrewing','frequency','freschesolutions','freshstart','freshtrackscanada',
  'freshworks','fresnelsoftware','freudigmanbillings','friendsofacadia','friendsofbroomfield','friendsofruby','friendsofwaterfrontpark','friendswoodcc','fringebenefitplans','frontieraerospaceaccount',
  'frontiercfo','frontiercooperative','frontierrailroad','frontierschools','frontlinecallcenter','frontlinevc','frontlogix','frost','fryeartmuseum','fscpa',
  'fsp','fsstechnologies','fstichem','fswe','ftkcs','ftoc','fudo','fuel','fuelpositive','fulcrum',
  'fulcrumairinc','fullbeaker','fullcircle','fullcircle1','fullersgroup','fullsupportgroup','fundcount','fundsdlt','funnow','furniturerow',
  'fusang','fusethree','futurecarecorp','futureon','futuresbc','futuresforall','futureswithoutviolence','fvcdc','fwdthink','fwslash',
  'fxcollaborative','fxpro','fz','g2','g2cap','gabordesignbuild','gadellnet','galaxygaming','galeassociates','galeckisearch',
  'galenband','galtfoundation','galvion','gambyt','gamelounge','gamemodeone','gangverk','ganintegrity','gardnerbuilders','gargle',
  'garrtool','gasketgames','gasproservices','gatewayepc','gatewaypublicschools','gatewayvet','gbdevco','gbl','gblhr','gbsgroup',
  'gbta','gcph','gcsjanitorial','gearsforbreakfast','geaugapublichealth','geckogreen','geekbot','gemco','geminiams','gems',
  'gemtec','generatecanada','generation','genesis','genesisdigital','genesiselectrical','genomecanada','genpride','genserenergy','gentrack',
  'geoscan','geospectrum','gerhart','geta','getjusto','getrepowered','getzhealthcare','gf55','gfainc','gfef',
  'gfgholdings','ggreeneconstruction','ggtworldwise','ghgsat','ghid','giagy','giatecscientific','gibraltar','gifted','gigastar',
  'gilbert','gilbertcentre','gillespies','girlscoutsosw','girlsincofchicago','girlsincofsantafe','git','gitkraken','givecloud','gk',
  'gladinc','gladstone','glas','glassborochilddevelopmentcenters','glasscanvas','glassesusa','glavinsured','gleim','glenarbour','glendimplexau',
  'glimpse','glm','globalcitizen','globalenergymonitor','globalfundforwomen','globalinitiative','globalland','globalprairie','globaltel','globalwatercenter',
  'glopal','glovergroupltd','glowacademy','glucode','gmci','gmfsteel','gmgi','gminingventures','gnbac','gnwkcf',
  'goasg','goatgroup','gobiquityinc','gocavs','goctc','godbyhpe','gofly365','goforhr','gogebicmedical','goglobal',
  'gohighlevel','goldbugtrial','goldenhills','goldenstate','goldenstatecider','goldenstatetriad','goldstandard','gomedstar','goodwell','goodwillready',
  'goodwilltnva','gorilla76','gorillatech','gosaas','goservpro','gospooky','gotouche','gotrminnesota','gpmena','graberpost',
  'gracefellowship','gracefellowshipchurch','gradient','grafixarts','grainchain','grainpro','gralpharchitect','granitereit','grapecityindia','graphem',
  'graphiant','graphitedigital','graphwise','grassrootsinternational','gravyty','grcompany','greatamericanmediaservices','greatario','greaterminnesota','greatwhitenorth',
  'greenco','greenempowerment','greenhousecomms','greenlakecountyus','greenlatinos','greenlifeenergy','greenlightworldwide','greenparkcontent','greenpeaceorg','greenschool',
  'greensolarsystems','greenspacerecycling','greenspoonsales','greentomatomedialimited','greenview','gregoryfca','gregslawn','grey','greybrook','greyeaglepork',
  'greystoneconstruction','grhsmo1','grid4','gridbeyond','gridedge','gridgain','gridx','griffith','grounded','groundworkusa',
  'group161','groupegibault','grover','growingkidslearningcenter','growingroomcdc','groworxglobal','growpath','growpublicschools','growthleads','grpride',
  'gruberlaw','grubstreet','grubtech','grunenthal','grupoantolin','grvt','gs1nz','gsba','gsbusinesscommunications','gsdngo',
  'gsengineering','gsolegal','gssi','gsvam','gta','guardhouse','gudel','guelphchc','guesthouse','gungho',
  'gupta','gurustudio','gvhs','gvi','gvl','gvrd','gwek','gwinc','gworks','gwp',
  'gwpsanpc','gxpcc','gympluscoffee','h2','haasf1team','hacademy','haccnet','hagerman','hailsolve','hakluyt',
  'halfmoon','halifaxfanusa','halo','haloprime','hambletonhandyman','hamilton','hamiltonbrown','hammondengineers','hamptonroads','hamptonroadscommunity',
  'hanzo','happyfinish','harambee','harbordesignsmanufacturing','hardwirellc','hardycorp','hardyserv','harmonicfundservices','harpergc','harperrainsknight',
  'harrisgroupcpa','harvestusa','haslams','hatalom','haugimp','haven','haverfordtownship','haviland','hayessolicitors','haymonhomes',
  'hazendalwineestate','hcahamilton','hcchospital','hdsilga','headspin','headway','healthandcommerce','healthcaringkw','healthcoga','healthpreneur',
  'healthresearchbc','healthwaregroup','heanet','heartlandcounseling','heartstrings','hedgepointglobal','heightslife','heimdalsecurity','heirloom','heirloomproperty',
  'heliosenergia','helixkc','hellochef','helloflynn','helloproducts','hellskitchen','helmes','helmsandsons','helpcloud','helpscout',
  'hematologics','herbalgoodness','heritagehealthservices','heritageis','hetheringtongroup','hexens','heyjobs','hhendy','hhnw','hhofet',
  'hickenair','hicksmanufacturing','highstreet','hightechhigh','highwaybaas','hilite','hillrobinson','hillsidefellowship','hillsonguk','hiphopcaucus',
  'hireops','historicnewengland','hitstrat','hiveway','hivos','hkm','hla','hlc','hlunitedway','hmarkets',
  'hmr','hnmc','hochiki','hocsinc','hoffmanagency','hokanson','holtbrothersinc','homefirstservices','homerule','homesforgood',
  'hoovershatchery','hopecm','hopecommunityservices','hopefarm','hopeofeastcentralillinois','hopper','horticulturenz','hospicecarepartnersusa','hospiceofredmond','hotelbethlehem',
  'hotelco51','hotosm','houlak','houlihancapital','housebuyersofamerica','housingassistance','housingcalifornia','houstonlandscapesetc','hrblis','hrdc',
  'hrfh','hrmidwest','hrnetrefer','hrsynergyllc','hshihc','hsnri','hssv','hsvarc','htminsurance','htmniseko',
  'htoemp','hualapai','hubtechnologysolutions','hubtel','humanafterall','humane','humanevet','humanexventures','humanityfinancial','humanyze',
  'humecenter','hummingbirdresources','hunchads','hungerfordproperties','huntelectric','hunterhealth','hutchcc','hutchpaving','hwcm','hycu',
  'hyperlayer','hypernative','i3pd','iar','iasb','ibabel','ibc','ibs','ibsco','iccbpo',
  'icct','icdrilling','icibuilds','icic','icolohr','iconcreative','icron','ictcctic','idbank','ideallivingmanagement',
  'identityfusion','idex','idfive','idfusion','idiguam','idnerd','idplans1','ie2construction','ieefa','ifesworld',
  'ifpim','igamingidol','igamingplatform','igcc','igg','ignitepositivechanges','ignition','igopeople','ihbs','iipay',
  'iisd','ikamper','ikeja','ilgpa','illuminatefinancial','illumynt','ilsc','imagecarecenters','imageengine','imagineenglewoodif',
  'imaginellc','imbank','imhotepcharter','imi','imk','immiland','impactcap','impactcs','impactenv','impalastudios',
  'imrg2000','inclusioncayman','inco','incomdirect','indicalab','indiegraf','indigenousclimateaction','indigoconsulting','indinero','indrarenewabletechnologies',
  'industriallouvers','inetco','infiniteglobal','infiniteviewsllc','inflowhi','infosum','infrafly','infravision','infrrd','ingenious',
  'ingeniumschools','ingenuitydesign','ingletonwood','ingotbrokers','inheritingearth','initiate','inlumi','innercityweightlifting','innovahealth','innovateatlanta',
  'innovationhighschool','innovations','innovativeautomation','innovex','innovid','innovobenefits','innovu','innpower','insightsoftmax','insighttimer',
  'insomnialabs','inspera','inspirefoundation','instadeep','insticator','instructionalcoaching','insuco','insurancecaredirect','insurancemarket','insurancetechnologyservices',
  'intec','intechopen','integratedwaterservices','integrity360','intel471','intellecteu','intellihartx','intelmatix','interaction','interadcorp',
  'interiorhealthalaska','internetalchemy','internetsociety','interplay','interprenet','interworkscloud','intouchinsight','intragen','intrinsicdigital','introhive',
  'intuitech','intuitsolutions','intuji','inuitcircumpolar','invendagroup','inventprise','investmentadviser','investorcom','investottawabayviewyards','investure',
  'involvedgroup','inxile','iodigi','iodparc','iommediaventures','ion','iontra','iownit','ipd','ipeople',
  'ipinfo','ipme','iqgeo','iraclub','ircp','irgra','iridium','irishtitan','irisworldwide','ironbridge',
  'ironsideinsurancegroup','irtn','irvinepartners','isacybersecurity','isbusan','iserv','isl','islandinstitute','islandwood','isoutsource',
  'israaid','issgh','issueonereform','isth','it360','it8','itabo','itadltd','itassolutions','itavg',
  'itcap','itproactive','itps','itsolutionsco','ittf','itworks','iugo','ivycharge','ivyfarm','iworq',
  'iwpr','iyield','j2solutionsinc','jacksonthornton','jackspoint','jajafinance','jam','jamasoftware','jamboree','jammiesenvironmental',
  'january','jarrold','jarvis','jaspa','javavino','jbconsulting','jbenton','jbssolutions','jcaero','jccscpa',
  'jcescvla','jconnelly','jctind','jeffcolib','jeffersonrise','jema','jemgroup','jemhr','jetdirectmortgage','jetfly',
  'jewettcameron','jfcspgh','jfedstl','jfklaw','jfknto','jgmusa','jhlconstructors','jhstbay','jiko','jimdent',
  'jmanuel','jmanuellille','jmanuelparis','jmaportal','jmcope','jmelectronicengineering','jmsequipment','jnl','jobandtalent','jobbatical',
  'jobswithjusticesanfrancisco','jobzonedemploi','jodymiller','johnmcneilstudio','johnmini','johnsonsriverside','johnwallisacademy','joinpdx','jokake','joliethospice',
  'jonesanddemille','jonesmandel','jordanpark','jorsek','josephjacobjewelers','journeycapital','joycefoundation','joymo','jpiifoundation','jpisolutions',
  'jpr','jrandco','jrbarger','jsheld','jstreet','jubileefc','judicialco','juicekeys','juliansanderslaw','junipercreates',
  'justicedemocrats','justicelawcorp','justicenorth','justmystyle','justo','justwatch','jwv','kac','kadince','kairoscanada',
  'kalambagames','kalcodrywall','kami','kandou','kanrad','karamfoundation','karat','kartchner','kashainc','kaskocattle',
  'katanox','kathairos','katzie','kawacapitalmanagement','kawanti','kaybenlandscaping','kaydongroup','kbebuilding','kbfmagiccabinet','kbra',
  'kcconline','kcglobalmedia','kciconstruction','kcrcommunity','kearneygroup','keeldigital','keepersadvisory','keepit','keishenv','kellerassociates',
  'kelleyuustal','kenora','kentohealth','kepler1','keptpro','kermitppi','kernel','kettering','keway','keymediahr',
  'keyrussa','keystonerailrecovery','kff','kfmed','kicksite','kidneymn','kidsu','kierwright','kiln','kimoby',
  'kinbro','kindred','kineticedgept','kingandqueenco','kings','kingscott','kingsleymontessori','kingstonist','kingsway','kinposselected',
  'kinsley','kiosoft','kirkegaard','kirkmarket','kirkpatrickprice','kitchenmag','kiverdi','kkday','klar','kleankanteen',
  'kleocommunitylifecenter','klsearthworks','kmahealthva','kmedigital','kmicro','knak','knappett','kneat','knickerbockergroup','knkx',
  'knockinginc','knovalearning','knoxtoronto','koala','kobalt','kodem','koehnpainting','kogerhomecare','kohlfelddistributing','kohort',
  'kohr','kolkfarms','kolmeo','konfio','korem','korowai','korte','korumlegal','kotahi','koydol',
  'kpmcpa','kraunelectric','krausebrokerageservices','krazy','kredi','krfr','krmdev','kruxanalytics','kryptonfs','krysglobal',
  'kslcapital','ktf','kubermatic','kungfuai','kurtosys','kuttatech','kuunda','kvg','kvp','kyra',
  'kytn','l2cyber','laamistadinc','laborie','labx','lacahsa','laesf','laivly','lakegregory','lakesidefire',
  'lambertandassociates','lambtonkent','lami','lanciaconsult','landisllc','landmarksolutions','landr','lanesgroup','languagebird','lano',
  'lansdaleborough','lanubiaconsult','laprairie','laprc','lapromisefund','laramieairport','larcheerie','lark','larvol','lasbest',
  'lasroc','lastresortrecovery','lastwall','later','launchglobal','laurentisenergy','lautenbachrecycling','lavanda','lawfoundationbc','lawnandpestsolutions',
  'lawny','lawpath','lawrenceburg','lawsocietyie','lawsonlundell','lawvu','lba','lbmx','lbphd','lcmo',
  'lcr','lcslab','lct','lda','ldsafetymarking','leaco','leadbank','leadexsystems','leaf','leandata',
  'leanpath','leap','leap29','leapca','leapfrog','leapsquare','learnd','learningforward','learnlife','learnupon',
  'leedsalabama','leemontessori','leetrans','leevin','legacybuildingsolutions','legato','legendboats','leighenterprises','lekoil','lemonedge',
  'lemonio','lemonskystudios','lencorex','lendable','lendesk','lenhartmason','leparvet','lethbridgepolice','letsgetchecked','lettusgrow',
  'levanders','level','level9virtual','levellegal','lgbtfunders','lgmeats','lhcmt','lieberman','lifeenhancement','lifeinsight',
  'lifelenstechnologies','lifelenz','lifemi','lifepushllc','lifesitenews','lifestraw','lifewave','liftcommunityservices','liftinteractive','ligadata',
  'lightasinglecandle','lighthouse','lighthouseelectric','lighthousetechio','lightshipsec','limelightconsulting','limelightmarketing','lindsayconstruction','linear','linearit',
  'linkfire','linkupteletherapy','linkusawi','lisbongroup','lisleparkdistrict','listentech','liveforlifeutah','liveglam','livepayments','livespot360',
  'livwellchs','lklp','lmaweb','lminternational','lmpgroup','lmrtechnicalgroup','lnsresearch','loancouk','locafy','locationcollective',
  'loftwork','logansimpson','logelhomes','logmet','logpoint','loka','lolared','londonsquare','lonsec','loopbackanalytics',
  'looperinsights','lootrentals','lorennancke','lorisystems','lottiefiles','lotuswater','lovascogroup','lovelandexcavating','lowerstreet','loweswholesale',
  'lpfas','lt','ltlgroup','lucastree','lucidlink','luckysaint','luckyspot','lucyd','ludicrum','luf',
  'lukka','lumency','luminarybakery','luminate','luminus','luna','lunacon','lunaroutpost','lupl','lushomo',
  'luvbridal','luxaviation','luxeparkingmanagement','lvt','lwcc','lxt','lyon','lyonspaint','lyric','lyssna',
  'm2dot','m3dm','m5utilities','maamwesying','mabeyhire','macbracey','macc','macdonaldshhc','macrobond','madebysway',
  'madeincookware','madhive','maestrotech','magmalabs','magnapower','magnetic','magnoliamedical','magnumphotos','mailchannels','maineconservationvoters',
  'mainframe','mainstay','mainstreamrp','maintair','maishameds','makeship','makola','makorecruiting','maksystem','malalafund',
  'malcolmdrilling','malingroup','malonesolutions','maltorg','mammothtv','manahan','manaosoftware','mangaroafarms','mangomaterials','mangrovelithium',
  'mann','mantrafitness','mapa','mapbrewing','maple','mapservices','maracalearning','marant','marblehead','marcopololearning',
  'mare','marianaoncology','marinedrive','marinelife','marinopr','marioncountyclerk','mariostowing','maritimehelicopters','marketingessentials','markstein',
  'maropost','marqueebrands','marquettemi','marqvision','marshallutilities','marshallwhite','marss','martello','martinconcrete','marvelmarketers',
  'masabi','masalto','masonamerica','masonkorea','massago','massdevelopment','masterclass','masterscapes','masv','materialexchange',
  'matiss','matpelbuilders','matter','matthew25','mattr','maverickeng','mavericksoftware','maxa','maxbetonline','maxcarehrs',
  'maxion','maxxis','mbcparksrec','mbdaus','mbdesign','mbfoundation','mboone','mcbcorp','mccallumrock','mccinc',
  'mcfa','mcfcs','mcfn','mcgregoreba','mchcwi','mckinleyadvisors','mcleanschool','mcontracting','mcprep','mcss',
  'mcsteelnorth','mdanalytics','mdif1','mdn','mdotm','meadowbrookchurch','meadowridgeschool','mealticket','measurabl','meatable',
  'meatymeats','mec','mechanicalsolutions','meda','medallionbank','medasf','medcommsexperts','medelite','medenterprises','mediadesign',
  'medialab','medirect','medium','mednet','mednetworkak','medstarambulance','medsurvey','meedan','megaphone','megazebragmbh',
  'memiah','meniga','menlo','menlosecurity','meq','merakicreativegroup','merakihealth','merciaassetmanagement','mercuryfilmworks','mercuryo',
  'mercyurgentcare','merge','mergon','meridianllc','merrick','mesh','messagepoint','messengeravl','metacompliance','metalenz',
  'metalquest','metricmindsgmbh','metricstrategies','metrogolf','metromechanical','metronews','metrooneservices','metroplanning','metroservicegroup','metrowestnutrition',
  'meyerspetcare','meyocks','meysen','mfd','mfgsci','mgbeveragesystems','mgnevents','mhfnz','mhiuk','miadvocacy',
  'michaelsenergy','michif','michiganlabs','microharvest','micrometrics','microvellum','midcoast','midminnesotaentertainment','midsuncassociation','midwestrailcarrepair',
  'miedema','mighty','mii','miinto','mikisewgroup','milbarhydrotest','milestable','milestonehealthpartners','millscnc','milrem',
  'milyli','mindbridge','mindfullifeproject','mindgrub','mindsightbehavioral','mindvalley','minneolahealth','miquido','miraclefeet','miraterra',
  'miscs','miseenplace','missionagency','missionaz','missioneast','missiongroup','mitacs','mitchellwhale','mitto','mixmax',
  'mjdau','mjolnirsecurity','mkbholdings','mlacanada','mmcaa','mmfa','mmg','mndiscoverycenter','mobilizegreen','mocanyc',
  'modernautobody','modo','modoccontracting','modus','moises','moldeddimensions','molecularyou','monarchcabinetry','monarchfamilyservices','mondaycreativeinc',
  'monge','montanainternet','montanalegalservices','montanapartyrentals','montanasupplyco','montclairhospitality','montrose','montroseholdings','montway','moonsailnorth',
  'moontideagency','mordencollege','morganindustries','morleybuilders','morlocknoren','morningbrew','morpc','morrisassociates','morrisonexpress','morrisonshearer',
  'mortongroveparks','mosaic','mosaicbc','mosaichr','moscadesign','mosers','most','mothershipcoffee','motorsandcontrols','motorsport',
  'motorway','mountainhumane','mountainland','mounthorebchristian','movaci','moveplangroup','mozilla','mpatime','mpsbaltic','mptcs',
  'mrbway','mrelief','mrghr','mrjohnpit','mrsassociates','ms3','msc','msf','msfltd','msfsa',
  'mslogisticsltd','mspbots','msrs','msu','msvotes','mtlebanon','mtmdesign','mtsa','mtwyouth','muddycreek',
  'muensterhospital','mulilo','muros','murphybrosdesign','murrayco','musixmatch','mustardseedca','mutualone','muwa','mvaz',
  'mvcredit','mvmhr','mwmech','mwss','mybambu','myccu','mydrcu','myeloidtherapeutics','myersbillion','myhcd',
  'myhopeair','mylogically','mymoria','mynorthside','mypatientspace1','mypicture','myrvla','mytbas','mythicalaccount','mytlc',
  'nacca','nadc','naeh','naisiouxfalls','naitsa','nalhd','naminh','nanomosaic','nanushka','napervillepl',
  'narrativestrategies','nathab','nationalbank','nationaldelivery','nationaledu','nativeforward','nativegov','nativeinstruments','nativeproject','nativeunion',
  'natronacountylibrary','naturaldes','navconsulting','navinurses','navipartner','navitas','nayakcorp','nbn','nca','ncaz',
  'ncfire','nciins','ncns','ncose','ncuk','ncwlibraries','ndcam','ndp','neareast','nearmap',
  'neboces','necsda','nectar','neighbor','neighborhoodsun','nelp','nemely','neo4j','neofonie','neoimmunetech',
  'neptunelines','nequinoxstudios','nerdware','neservices','nesst','nestcoin','nesthealth','netadmins','netbeez','netcenter',
  'netcraft','netdigix','netint','netlify','netsweeper','netvendor','neuanalytics','newbirthoffreedom','newchildrensmuseum','newcityus',
  'newcomienzos','newelhealth','newfts','newhopecorps','newicon','newkd','newlandmke','newlifepainting','newlondonarchitecture','newmans',
  'newmomsinc','newpath','newroadstreatment','newsmatics','newton','newtopia','newvisionhealth','newzoo','nexforduniversity','neximhealthcare',
  'nexjhealth','nextenvironmental','nextgenamerica','nexusinno','nfb','nftcouncil','ngaiteranginz','nhainc','nhc247','nheincteam',
  'nhtinc','niceshops','nicindustries','nicklpass','nideckergroup','nilus','nimbleactivewear','nimbusconsulting','nimonik','ninjatrader',
  'ninthplanetbev','nitha','niyamit','niyel','njhrc','nkarchitects','nkpr','nksfb','nmflb','nnapf',
  'noanet','noblerot','noelasmar','noema','nofraud','nomecc','nonviolentpeaceforce','noones','nopecinfo','nordersupply',
  'norson','northbayindigenous','northbrooklib','northcentralelectric','northeastvolleyballclub','northern','northernlightsvet','northstar','northwindgrp','northwindtechnicalservic',
  'nosp','nourish','nourishinghopechi','novasphere','novatecheng','nove','novelmicrodevices','novo','novumbank','nowcircular',
  'nowports','nozebra','npe','npfc','npffpn','nprc','nptandcrc','nrs','nsifoods','nslegalaid',
  'nssra','ntara','nti','nubimetrics','nucleus','nureva','nursenextdoor','nursiecosmeticsbeauty','nurturaveda','nutrigreentulsa',
  'nutriquest','nvision','nvva','nwaccessfund','nwaea','nwave','nwbt','nwch','nwcpud','nwgb',
  'nwpd','nwra','nycavp','nylontechnology','nymbus','nymcard','nymi','nyobolt','nysefc','nystromelectric',
  'o180','oaciq','oaec','oag','oakbrookpark','oakmi','observeai','obyteshr','ocasa','occboyscouts',
  'occrp','oceansidecove','oconnormortuary','oct','octaviacarbon','ocuco','odkmedia','odonata','odyssey','offchainlabs',
  'officeprinciples','officernd','offstreet','ofntsc','ohioambulance','ohiosportsacademy','oicdtpac','oicr','okaloosatax','okarthritis',
  'okaymedia','okta','olddominiongroup','olivebranch','oliversolutions','olparks','olsonsteel','omeat','omnibridgeway','omnigroup',
  'omnimed','omnitechnologies','omnitherapeutics','one','oneacadiana','oneapp','onebeyond','onecomm','onedesignco','onefinestay',
  'oneil','onejustice','oneplanai','onestoppoolpros','oneteamonedream','onetechcapital','onetreeplanted','oneviewhealthcare','onferope','onindia',
  'onlea','onramplab','onsharp','onsiteconstructionllc','onsiteenergyinc','ontariohospitalassociation','ontheclock','onthemoney','ontinue','onwa',
  'onwardsearch','ooma','oomphinc','ooni','opalfoodandbody','opecmd','opench','opencosmos','opendoorexperience','opendorse',
  'openenglish','openfieldx','openjawtech','openmindt','opensea','openspaceforartsandcommunity','openstay','openweb','operaphiladelphia','operative',
  'operatorsunlimited','oppl','opportunityknocksnow','optimalnetworks','optimalworkshop','optimerainc','optimum','optiom','optionsit','opus3artists',
  'opusclip','opuscoffee','orag','orangeinvestments','orangeloops','orangeskyau','orases','orbitapps','orchard','orcid',
  'ordergroup','oregonhospitals','origamirehab','origina','origindigital','ork','orphalan','orw','osborn','osbornbarrparamore',
  'osirisgroup','otcflow','other','ott','ottawakent','ottawasenators','otus','ounalashka','ourhouseshelter','outfittersint',
  'outlierventures','outpost','outreachworks','outschool','outsurance','outyouth','ovclawyermarketing','ove','oversightboard','overstory',
  'overwatchimaging','ovou','ovphealthcare','owi','owner','ownsolutions','oxbow','oxfordbiotherapeutics','oxio','oxipitalai',
  'oxya','ozarkopp','oze','ozoneproject','p31','p38','p3group','pachamamacoffee','pacific','pacificmentalhealth',
  'pacrimmarketing','pactfi','paga','pagaya','paginemediche','paizo','pal','paladininc','palantir','paleycenter',
  'palisadepest','palmettoyachtmanagement1','pandagm','pandpglass','panmure','panteleon','papa','paq','paradigmae','parallel',
  'paralympic','parametricsmedical','parealtors','parentingplace','parkinsurance','parkview','parkvwchurch','parsectechnologies','parser','parttimecfo',
  'pasedfoundation','passage','passbolt','passion','patchstack','pateam','pathcrisis','pathways','patspastured','pauktuutit',
  'paulbunyancommunications','paulrobeson','pave','pawilds','pay','payara','paybyphone','payfacto','payjoy','payoneer',
  'payrange','paytabs','paytm','payzli','pbhha','pbsengineers','pcateam','pccharter','pchs','pcm',
  'pcsglobal','pctelincorp','pdms','pdp','pdrcpa','pdrvirginia','peak','peakgames','peakgroup','peakinitiative',
  'peariverelectric','pearldairy','pearlmeyer','peatix','pebc','pechangatribalgovernment','peddle','peekvision','peelenv','pegllc',
  'pelion','pemcco','pen','pencil','pencor','pendletonsolutions','penfoldstime','peninsulacleanenergy','penningtonparkchurch','people',
  'peopleai','peopleglobalpraxis','peoplelovingnashville','peoplesaction','peoplesclinic','peoplesolutions','peoplevisor','perfectpallets','performancesolutions','peridotgroup',
  'perimetermed','perplexity','persimmony','pestx','peterstownship','petwow','pexapark','pfscm','pgl','ph2',
  'phantomspace','phase3mc','phe','phigenics','philadelphiaballet','phillipj','philo','phippsconservatory','phoenixhealthcare','phoenixlaser',
  'photofax','piano','picateam','pickit','pictures','piedmontlube','pierpont','piletilevi','pinehavenfarm','pinkcallers',
  'pinnacle','pinnaclestaffing','pinteam','pinteamgmbh','pioneeraerosupply','pioneergen','pipedrive','piranhanightclub','pitchpointsolutions','pivotal',
  'pivotalfuture','pivothr','piwapan','piworks','pixeltoysltd','pizzadelicious','pjhm','plainfieldchristianchurch','plainstowing','planitmars',
  'plank','plantwithpurpose','platformsh','platinumpreowned','playnorth','plextrac','pliant','plugandplaytechcenter','plusgrade','plusonerobotics',
  'plymouthdistrictlibrary','pmacanada','pmat','pmgintelligence','pminternational','pmiworldwide','pmsi','pndengineers1','pneco','pnecycle',
  'poainternet','poc','pocketpills','podimetrics','pointeadvisory','polaramp','polestaream','policingequity','pollination','polyunity',
  'pomelogroup','pontosense','poopourri','populusgroup','portagecybertech','portlandgirl','portlandinternetworks','portofmorrow','portofskagit','portsmouthva',
  'portwest','positiveintelligence','positrace','possolutions','postedcompanies','posthog','potentialproject','pottermore','power4pilates','powercalifornia',
  'powermonitors','powerplay','powervision','ppsriverregion','pra','pracedo','praekelt','praxisinstitute','prcc','prci',
  'prco','preciseley','precisiondev','precisionnutrition','precizionpartners','preface','pregnancyjustice','premiere','premiermarketing','premierservice',
  'pressentergroup','pressurekleen','preti','preventionworks','preventx','prex','prezi','pria','priceindustrial','primaryfreight',
  'primeproperty','principal1','principleone','printerlogic','priorityonepayroll','prismfly','prismmaritime','privateai','privatelabelstaff','proavsolutions',
  'proavsolutionsqld','probi','procarehm','proctorandstevenson','prodigyeducation','productops','profast','profitandgrowth','profitero','profoundtreatment',
  'progresif','progressmfg','progresso','prohns','projectable','projectbread','promed','prominentedge','promise','promise686',
  'propelus','properstar','propertyme','propharmausa','proscia','prospect','prospection','prospera','protectgroup','proteinsources',
  'proteq','protocase','provectus','provectusalgae','provideinc','provincialcu','provoc','provoke','proximity','proximitydesigns',
  'prpl','prtc','psasystems','psbhq','psignite','psrassociates','pssmsi','psychologyspecialistsofmaine','ptac','ptla',
  'ptpla','publictrustadvisors','pughcpas','pulsemedica','punchcut','puregrenada','purelogicit','pushsecurity','pyramidtransport','q3restaurantgroup',
  'qalipu','qcairport','qcatalyst','qehome','qms','qoyod','qs','qtcinc','qtu','qualitytempstaffing',
  'qualityworksconsulting','quandri','quantanite','quantifi','quantinium','quantumbrilliance','quantumclinic','quantumdice','quantumspace','quartermaster',
  'questel','quintuscorporation','quora','quotewerks','qvt','r2net','rabbies','racc','racerocks','radcliffe',
  'radianaerospace','radiancemedspa','radiantvs','raenest','rafn','rahf','rahr','rainbowvillage','rainierscholars','ralcoelectric',
  'rallynet','ralmax','ralphmoyle','randomstudio','range','rangeforce','ranovus','raona','rapaport','rapidratings',
  'ravalli','ravenadvisory','raybourn','rayelectric','razor','razoredgesystems','rba','rbotechnology','rccp','rcdrv',
  'rchpahc','rcmississauga','rcmtransport','rcpconstruction','rcsinc','rct','rdcnc','rdmlawyers','reachfortomorrow','reachmobi',
  'reachu','ready5restoration','readyedu','readymode','realeyes','reasonone','reataeandmw','rebcsc','rebeccakitsonlaw','rebuy',
  'receptionhouse','recognisebank','recollective','recordpoint','redbarrels','redcaffeine','redcirclelodge','redcom','redefiners','redemptionplus',
  'redflag','redlodgejobs','redmondconstruction','redpointmedia','redrover','reductioninmotion','redwinghra','refractionpoint','refractoryservice','refugeesinternational',
  'regionalgroup','rei','relaxgaming','relay','relayr','reliablemn','reliato','relicentertainment','remixtx','remoteli',
  'remotepartneraccount','renewableresourcesgroup','renewbeauty','renewcares','renocavanaugh','reorbit','reospartners','resaroai','rescale','researchgate',
  'researchsol','researchtrianglehighschool','resilienttoday','resman','resolvetosavelives','resourcegeneration','responselabs','restaurant365','restlessdevelopment','restoreoaklandinc',
  'resurgo','retinaconsultantssandiego','retiresmart','reubensbrews','revantage','revantageasia','revau','revium','revolgy','revoltbi',
  'rewind','rewire','reynoldsrestorationservices','rgbarry','rgroupla','rhinolabs','rhinox','rhstrategic','ri','rica',
  'ricepsychology','richmondvona','richtech','ricketyroo','rickhansenfoundation','ridango','ridgeandvalley','rightbrainnetworks','rightlane','rightsline',
  'ripplecompanies','ripplefiber','risecpa','risevest','risilience','riveancapital','riverkeeper','riversedgeadvisors','rivr','rize',
  'rjcapital','rjkielty','rlb','rlg','rmautogroup','rmgcllc','rmhcbayarea','rms','robertslack','robinsontech',
  'robo','rock','rocketmedia','rockinrudys','rockportnetworks','rockride','rockys','roclub','rocrents','rogii',
  'rolla','rollee','ronbouchard','ronhoover','ronmor','roofingcompany','roomtogrow','rooof','rootedwi','ropelpaso',
  'rosadogroup','rosanopartners','rosecityrollers','rosenthalproperties','roulant','rouyapr','rovd','rowecasaorganics','royalroofinginc','royercorp',
  'rpmautocenter','rpmglobal','rr46','rracapital','rrgs','rsecoop','rsllhr','rslogistics','rt7digital','rtccom',
  'rtfnetwork','ruddresources','ruffwear','rumbleup','rumpl','runwithitsynthetics','russellmcveagh','rustcompanycpa','rustyparrotlodge','ruthmiskintraining',
  'rvbs','rwaengineering','ryangootee','s4','saaia','saalt','sac','sacredsociety','safeharborsc','safenetwork',
  'safetrust','safetychain','safransed','sagamokanishnawbek','sagesse','sai360','salalsvsc','salinahealth','salinapublic','saltandsmoke',
  'saltchurch','saltmine','salzmannhughes','samaritanlancaster','samesunbanff','samnutrition','samsters','samu','sanavida','sandbox',
  'sandboxvr','sandler','sandylane','sankuphc','sans','sapi','sarssm','sasso','sastairs','satellogic',
  'satispay','satorihealthca','saucecommunications','saucelabs','savanta','save','savetheredwoods','savethesound','savinggracepreschool','savvymoney',
  'sawdaysandcanopyandstars','sawtoothsoftware','sbcfs','sbdautomotive','sbquantum','sbr','sbw','sc811','scaffolding','scaleai',
  'scalepad','scancom','scarsellabros','scbc','scbuildersinc','scccl','sccm','sccommunityloanfund','scgreencharter','scharheating',
  'scicominfrastructureservices','sciris','sciteam','sconstruction','scorpiogroup','scottytechnologies','scppa','scs','scudamores','sdaihc',
  'sdfair','sdgcounties','seabrooknh','seadream','seakeeper','sealandbuildinggroup','sealeharris','seaoatsgroup','searchandgather','searchlight',
  'searchstax','seasideplumbing','seattlefoodtech','sebastiancorp','seccl','secdev','secnewgateuk','secondmind','seconduse','section6',
  'securelending','securis','securitize','securitymetrics','securitypal','securonix','sedarotech','seealliance','seechange','seekonk',
  'seismicsquirrel','seiulocal521','seiuusww','sekcap','sekon','selectorsoftware','semaphore','seminal','sempac','sempltd',
  'sendbird','seniorhomehelp','seniorlawcenter','seniorpsych','sensestreet','sensorup','senstar','sentra','seochc','seoplus',
  'seqserv','sequence','sequencebio','serasanadrippingsprings','serasanakaty','serasanasw','serolife','servicetec','servicethread','sesnet',
  'sestek','sfcb','sfo','sg','sgcompany','sgi','sgservices','shadowfax','shaferbros','shankmanandassociates',
  'sharedhope','sharedvaluesolutions','sharesies','sharetown','shareword','sharphueinc','shawscott','sheplersferry','sherocommerce','sherpa',
  'sherpadesign','sherrillpestcontrol','shg','shibumi','shifttransit','shimanoaustralia','shinebrightcare','shiner','shiningstarpcs','shipex',
  'shipshewana','shondaland','shopback','shopgate','shorthand','showcasedancestudio','showpass','sidefx','sidekickhealth','sidwater',
  'sierra','sifft','signal','signal1','signsandlinesbystretch','siliconranch','silkcommerce','silverhill','silvericing','silverliningaba',
  'silverlogic','silverstar','silverstripe','simetrik','simpligov','simpsonhousingservices','singhal','singlesourcesystems','singleton','siouxmanufacturing',
  'siprocal','sirestoration','sirex','siro','sistemaaccount','sixthman','sjs','skift','skillcast','skilledtradesofwestalabama',
  'skillfield','skillsusatexas','skilresourcecenter','skinmds','skispainting','skuuudle','skybound','skydweller','skydwellerus','skyfire',
  'skylineeducation','skylum','skymavis','slicelabs','slintegrated','slite','smardt','smarsh','smartacre','smartbox',
  'smartfrogandcanary','smartocto','smartskin','smashtess','smedia','smiletrain','smith','smokingguninc','smoothcommerce','smosh',
  'smrsi','smyal','snicsolutions','snpolytechnic','soar','soas','socbox','socialdriver','societebrewing','sofascore',
  'softiron','softube','sohodragon','solace','solex','solidaridadnetworkeca','solidaritycenter','solidatus','solink','solmillenniummed',
  'solon','solutionsdriven','solutionsmetrix','solv4ex','solvewithvia','somamedicalcenter','somichcpa','sonatafytechnology','songtradr','sonomalandtrust',
  'sopecoh','sorensengross','sorensoncapital','sorgecpa','soteranalytics','soundplanninggroup','soundstripe','southallchurch','southbridge','southpointeacademy',
  'southwestflfence','sovsc','spacebound','spacecentre','spacedrip','spaceinternational','spalah','sparklemafia','sparkmicrogrants','sparksmc',
  'sparkthejourney','sparrowsnest','sparsolutions','spartan7','spartancarriergroup','spc1','spcawc','spcawestchester','spcm','speakeasyinc',
  'speakup','spearbio','specialtycounseling','spectacle','spectrumhealth','spevco','spin','spineart','spinielloco','spiralscout',
  'spirii','spirithealth','splice','spm','spokanetribe','sportable','sportglobal','sportlogiq','sporttrade','spotlesscleaningnc',
  'spottersecurityinc','spreporting','springfieldleather','springfinancial','spsconnect','sqfin','squirro','sscva','ssdigitalmedia','sseguras',
  'sta','stackexchange','staffzone','stalbansclub','stambros','stammbio','stamped','stance','standardfiber','standrewsturi',
  'standwithus','starcjc','stardock','starelectric','stargatehydrogen','starlimna','startouch','starzplayarabia','statelinechurch','statesuniteddemocracy',
  'statflo','stclairsrc','steadpoint','stebby','stedmunds','steelway','steerstudios','steigerwaldt','stellaralgo','stellarcare',
  'stellatechnology','stengelhill','sterlingfire','stewarttalent','stfranciscenter','stichtingicfg','stillwatersci','stmarg','stockdalecapital','stoneshot',
  'stop','storj','stormagic','storyconstruction','stpcs','strade','stranddev','strategicdefensesolutions','strattoncraig','stream',
  'streamlinestudios','streimer','strivegaming','strongbridge','structuretx','stscapital','studios','studiotf1america','studiowildcard','studyprograms',
  'studytube','substance','suburbanenterprises','successbc','successfinderinc','sucittastealth','sudburycu','sugarwish','sui','sullivanhauling',
  'sullivanmotors','sullivanstanley','summaequity','summercollab','summitfire','summitproducts','summittech','sundae','sungas','sunriseexpress',
  'sunriseproductions','sunshineacad','sunshinegospel','sunwealth','super7','superiorairmanagement','superiorpak','supertext','supplywisdom','supportersdk',
  'supportiv','supportiveci','supremeservices','surepoint','surescreengroup','suscotland','svante','svcc','svdpdisaster','swanky',
  'swartzrestoration','swat','swchc','sweetcow','swiftnav','swirees','switchboardlgbt','switchmediaau','swoyfc','swssedh',
  'swyfft','sybridgetech','syncra','synergillc','synergysettlements','synergywellnesscenter','syntasauk','synthego','synthesia','syrcl',
  'syreon','system73','systemcrew','systemera','systemicjustice','systemxi','taager','tachyus','tadsl','tagmedia',
  'tailormadecompounding','tailormadelawns','tailscale','taipeimsf','takefivedogcare','tala','talentgarden','talkatoo','talkingpts','tango',
  'tangramflex','tanhealthcareaccount','taskize','tatrasgroup','tavily','taxaoutdoors','taxistudio','taytosnacks','tbmentalhealth','tbs',
  'tchdnow','tcsasia','tct','tctcost','tctnetwork','tcypher','tdcpagroup','tdec','tdg','tdgc',
  'tdh','teachforarmenia','teachingattherightlevel','teamblueox','teamcamelot','teamchildfund','teamconnection','teamcubation','teamintegrity','teamjapa',
  'teamlewis','teamrailsr','teamturnkey','tearaahungaora','techcyte','techdinamics','technalink','technosylva','teckro','teg',
  'tegritycontractors','tehama','teikametrics','tekla','teknicor','tekwav','telarus','telecomp','telegraphcreative','tempo',
  'tentbox','tenth','tentree','terasakiinstitute','teravisiongames','terranovanow','terrasense','terrestrialenergy','tes','teslarsoftware',
  'tevalis','texelairconz','texmed','textileexchange','tfcc','tfgnet','tgccpa','tggaccounting','thapremierclientkp','thatcompany',
  'the10group','theaccessproject','theapplabb','thearchco','theascotpartnership','theauditgroup','thebao','thebestgroup','thebiggsgroup','thebiome',
  'thebrandguild','thebrasserie','thecallgurus','thecenturyfoundation','theclassiccenter','thecommons','thecommonschurch','thecompasscenter','thecontemporaryaustin','thecoregroup',
  'thecpin','thecrossingatbigcreek','thefooddepot','theforage','theharbourschool','theheinzendowments','theinnbetween','thejeffersonhealthplan','thekey','thelabnyc',
  'thelastmile','thelightinggroup','theliocegroup','themantheigroup','themaxfoundation','themedicalsg','themeljrmartyzajacfoundation','thememoryclinic','themetchurch','thenationalobserver',
  'theneatocompany','thenewgen','thenewly','thentia','theoneill','theottawafoodbank','thepathschool','thepeopleschurch','thepublicsa','theranches',
  'therapycare','therealizationgroup','therefineryhouse','therishercompanies','thermalrs','thermalspecialties','thesecondstep','theshiftnetwork','thesource','thestop',
  'thestrategicfirm','thetablecsa','thethinkingtraveller','thethrivenetwork','thetimothycenter','theurgentcare','thevanguardschool','thevetcentre','thewatertrust','thewaveint',
  'theweitzcompany','thewellnesscentre','thewitmergroup','thinkanalytics','thinkcyber','thinkglobalschool','thinkific','thinkkaleidoscope','thinkmagellan','thirdhorizonstrategies',
  'thirdspaceproperties','thisisredflag','thomasjpaul','thompsonriverlumber','thomsongordongroup','thorup','thousandcurrents','threesixtygroup','threespot','thresholdhousing',
  'thrivetc','throneentertainment','tiendamia','tiereleven','tigoenergy','tildencoil','tiled','timberlinedrillinginc','timezest','timistours',
  'timoneygroup','titan','titanoil','tiugo','tknife','tlaaminfirst','tlcenter','tlcsolutions','tlichoic','tmcamping',
  'tmde','tmgworld','tmtgolf','tnps','tnr','tnuck','toebeconstruction','tof','togetherforgirls','tohonooodham',
  'toku','tombras','tomgov','tompkinswake','toolbx','topdata','topdown','topemployers','tornbanner','torontobluejays',
  'torrero','totalis','totalpoliticsgroup','toters','tototheo','toughcommerce','tourismemtl','tourjasper','toursbylocals','towermarketing',
  'townofdanville','townop','tpf','tpud','traceinternational','trackfive','tractionrec','traderphdllc','tradspestcontrol','trafficorp',
  'transimeksa','transitionbio','transoftsolutions','travelzoo','treasurecoastaba','treasuryprime','treble','treetime','treetrust','trendyminds',
  'trentvineyard','trevipay','trezz','tria','tribecapediatrics','tricountyhealth','tricrobotics','trident','tridenttransport','triggerfish',
  'triggerise','trilogy','trimgroup','trinityhospice','triplecreekranch','triplelift','tristaterestores','tritech','triumph','triverustrijet',
  'trodo','trondek','trophiai','tropicana','tropicbioscience','trove','trowbridge','trpr','trtglobalsolutions','trualta',
  'trudynamic','trueaero','truecontext','truelogic','truenorthitg','truevo','truewealth','truleap','trupropel','truspace',
  'trusscore','trussvet','trustana','trustly','trustwallet','truthcollective','trycycledata','tsf','tsn','ttacorp',
  'ttcmg','tthi','ttisi','tttstudios','tubman','tuckerdisability','tuffiassandberg','tuj','tula','tulip',
  'tunnelit','turbineai','turfandtreecare','turinganalytics','turn','turnkeyafrica','tvsinc','twelve','twelvelabs','twelvetonemusicschool',
  'twinlakescounseling','twinportsderm','twinstake','twohat','tympahealth','tympahealthtechnologiesinc','tymusbeverlypllc','tysonmendes','tyto','u10',
  'u1sports','uasu','ubawellness','ubco','ubongo','ucemc','udacity','ufinet','ufs','uge',
  'uhlco','uja','uken','uledger','ulnoowegca','umatillaelectric','umbralab','unacast','unbelievablemachine','unboundnow',
  'understandingwar','undivided','unetsafe','unionchurch','uniquemanagement','unitedbeautysupply','unitedcapmn','unitedec','unitedsmarttech','univisioncomputers',
  'unleashedacademy','unode50','unrvld','unsm','untiedtsvegetablefarm','uovowine','upacjenta','upequity','upguard','uphill',
  'uphold','uppai','uppartners','uppervalleyhaven','uprisingcenter','upsidepreschool','upstateforever','uptakestrategies','uptime','upwithwomen',
  'urang','urbanecologycenter','urbanest','urbania','urbansharing','usaforunhcr','usboell','uscdcb','uscreen','usepilot',
  'userpilot','utahlegalservices','utahwarriors','utd','utech','utg','utorg','utrs','uwswva','v12footwear',
  'vaccibody','valentureinstitute','valeonetworks','validic','valleybankofkalispell','valleymedical','valleyne','valocityglobal','valuebuildersystem','vamanufacturers',
  'vamonosit','vancouverfarmersmarket','vandenrecycling','vanguardclinical','vanier','vanigentbiopharm','vanmoof','vantagelogistics','vantagepointchurch','vaporministries',
  'vartega','vausa','vayaspace','vcchc','veganuary','vellum','venarisecurity','vendasta','venn','venosnh',
  'ventientenergy','venture','venturechristian','ventureforcanada','ventureslab','venuee','veracityid','vercel','veriday','vermontcatholiccharities',
  'verodcapitalmanagement','versafile1','versasec','vertexca','vertexroofing','verticalscope','vertigis','vertis','verto','verveit',
  'vervetx','vevo','vexxhost','vfs','vgsystems','viaevaluationaccount','viagiotech','vicpark','victimsupportscotland','victoriasexualassault',
  'victorychurch','vida','videoslots','vidoshnorth','vie','viewsonic','vifr','vilcap','villagepresbyterianchurchofnorthbrook','vincentinc',
  'viotas','virgalawfirm','virginiamoca','virtualpeaker','virtualworkernow','virtuoso','virtuozzo','visagetechnologies','viscaweb','visionsourcehendersonville',
  'visitseattle','visitspokane','vistacapitalpartners','vistairhr','vistamusic','visterrainc','vitalhub','vitalresearch','vivanaturals','vivecrop',
  'vividmachines','vivtechnologies','vizxglobal','vizzuality','vkey','vmccny','vocel','void','voigtie','voldex',
  'voneus','voodoo','vortexcompanies','vpcl','vptpower','vrify','vrscorporation','vshb','vsi','vtcsm',
  'vuehealth','vueplanner','vuereal','vulcanx','vyos','vytelle','wabanakipublichealth','wachteltree','wagwalking','waibel',
  'waidininggroup','wallapop','wallbox','wallfabrics','wallop','wangengroup','washingtonco','watchtowr','wateraidamerica','waterfirst',
  'waterloofiber','watersconst','watersedge','wattglobal','wattselectric','waveaquatics','wavefrontsoftware','waveworks','wavo','waysidepress',
  'waystone','wbmelback','wcdhd','wcgconstruction','wciinc','wcscanada','wcwcd','wearecda','wearediamond','wearerosie',
  'wearewmx','weatherstream','webreality','webtools','wecommerce','wecp','wego','weishauptdesign','welab','welbi',
  'welchllp','wellcentricdc','wellnessspa','wellpointe','wellspring','welove9am','wep','weseedchange','wesley','wessexinternet',
  'westair','westendfamilycounselingservice','westendstrategy','westernbuildingsupply','westernrestaurantsupply','westernsteel','westlandsuk','westlibertyuniversity','westsidejustice','westtexasautorecovery',
  'westvalleydetox','wgames','wgtv','wha1','wharrisgsc','whca','whcchome','wheel','wheely','whisk',
  'whisperingpines','whitbywood','whiteboardmarketing','whitecapsfc','whitelabelcasinos','whiteroom','whitewaterwest','whitinger','whitman','wholegraindigital',
  'wieucaroadbaptistchurch','wildanimalsanctuary','wildcatoiltools','wildix','wildplay','wiley','wilken','willamalanedistrict','willbee','williscc',
  'williston','willplumb','wilsonconst','winandwinnow','winchestercarlisle','winchesterinterconnect','windenergyoftexas','windmilldevelopmentgroup','wingsofhope','wingsrecovery',
  'winktechnologies','winonaareaambulance','winterholben','wipliance','wisav','wiseworld','wisharemedia','wisltd','wisor','wistia',
  'wizeline','wkrecc','wkt','wmaviation','wmtdigital','wnaengineering','wncinc','wolcenstudio','wolfgangdigital','wolfsdorf',
  'wolfsteel','womenemployed','womenforwomen','wonderacademy','wonderstate','woodbridgehomes','woolwichcommunityhealthcentre','woom','work4u','workingfamilies',
  'workshop','worksmartgroup','workunlimited','worldbenchmarkingalliance','worldbicyclerelief','worldhopeinternational','worldmobile','worldreader','worldvision','worldwinner',
  'worldwrapps','worthwhile','wpga','wpgov','wqscc','wraparoundmd','wrapbook','wrlgold','wrs','wrxgrp',
  'wsb','wtci','wtcpl','wusc','wwhf','wwnc','wyo','wyomingbusiness','wyomingcda','wyomingoutdoorcouncil',
  'xapo','xata','xavierlawfirm','xciting','xendit','xlabsystems1','xs','xscion','xtm','xtrm',
  'xypro','xyz','yardsticktechnologies','ycbm','ychgov','yellomedia','yellowcard','yempo','yeshouse','yess',
  'yfc','ylabs','ylc','ylemenergy2','yli','ymcacayman','yoganandaseva','yorkgroup','youroutdoorlivingspace','youthguidance',
  'youthopportunity','yrh','ysbiv','ysm','ytid','ytt','yuppiechef','ywcautah','zaelot','zafin',
  'zaizi','zaloni','zapier','zbg','zeframllc','zelp','zencastr','zendesk','zendrop','zenetec',
  'zentalis','zephyrtoolgroup','zeropoint','zgmemployees','ziarecoverycenter','zibber','zigabyte','zilia','zimmermanmulch','ziosk',
  'zivid','zmactransport','zocks','zogics','zoomph','zoonewengland','zpesystems','ztr','zurb','zutacore',
  'zwick'
];

// ─── Personio company slugs ───
const PERSONIO_SLUGS = [
  'agile-robots-se','alan','alchemy','arweave','atlas','aurora','banxware','basis','bunch','cabify',
  'carbon','cas','celonis','cic','clark','codex','contabo','cosmos','deepslate','demo',
  'digitalservice','egym','emma-sleep','finn','forward','framer','freeletics','gnosis','govtech','julius',
  'kit','kiwi','lalamove','leap','merantix','monday','neon','opal','ottonova','penta',
  'phoenix','planradar-gmbh','powerus','quantpi','quantware','raiku','researchgate','scroll','sim','skynrg',
  'smava','solarisbank','sunday','tado','teleport','tonies','tractable','traderepublic','trawa','twelve',
  'upstart','urbansportsclub','usercentrics-gmbh','vivid','wandelbots','wunderflats'
];

// ─── Breezy HR company slugs ───
const BREEZY_SLUGS = [
  'a-team','absentia-labs','airbound','aircall','algolia','amo','anyscale','assist-world','astera','attentive',
  'ava-labs','axion','axle-health','beam','bitpanda','bloom','bookkeeper360','brainly','braintrust','brilliant',
  'brinc','bugcrowd','build','cabin','cargado','caribou','centrifuge','chime','clearco','clipboard',
  'cts','curri','delve','dialpad','disco','dispatch','diversified-botanics','duolingo','eigen-labs','ema',
  'enslabs','everstar','finch','flipturn','further','fuse','ghost','gopuff','gruntwork','gusto',
  'happyco','helion','human','ideals','infinite','inngest','ion','jump','kalibri-labs','kamiwaza',
  'kite','kombo','ladder','levelup','loot-labs','lucidworks','manifest-law','mercor','metaforms','motive',
  'nango','nelo'
];

async function fetchBambooHR() {
  console.log('\n── BambooHR ──');
  const allJobs = [];

  const tasks = BAMBOOHR_SLUGS.map(slug => async () => {
    try {
      const res = await fetch(`https://${slug}.bamboohr.com/careers/list`, {
        headers: { 'Accept': 'application/json' },
        redirect: 'manual',
      });
      if (res.status !== 200) { console.log(`  ⚠ ${slug}: ${res.status}`); return []; }
      const data = await res.json();
      const openings = data.result || (Array.isArray(data) ? data : []);
      const companyJobs = openings.map(j => {
        const loc = j.location || {};
        const location = [loc.city, loc.state, loc.country].filter(Boolean).join(', ') || 'Unknown';
        return {
          source: 'bamboohr',
          external_id: `bhr_${slug}_${j.id}`,
          dedup_hash: dedupHash(slug, j.jobOpeningName || ''),
          title: (j.jobOpeningName || '').trim(),
          company: slug.charAt(0).toUpperCase() + slug.slice(1),
          company_logo: null,
          location: j.isRemote === '1' ? `Remote - ${location}` : location,
          job_type: j.employmentStatusLabel ? normalizeJobType(j.employmentStatusLabel) : null,
          salary: null,
          description: null,
          tags: extractTags(j.jobOpeningName || ''),
          apply_url: `https://${slug}.bamboohr.com/careers/${j.id}`,
          category: j.departmentLabel || null,
          published_at: null,
        };
      }).filter(j => j.title);

      // --- TECH COMPANY HEURISTIC FILTER ---
      const isTechCompany = companyJobs.some(j => 
        /engineer|developer|swe|software|frontend|backend|fullstack|data scien|machine learning|ai\b|product manager|ux design|qa /i.test(j.title)
      );
      if (!isTechCompany) return [];

      if (companyJobs.length) console.log(`  ✅ ${slug}: ${companyJobs.length} jobs (Tech)`);
      return companyJobs;
    } catch (e) {
      console.log(`  ⚠ ${slug}: ${e.message}`);
      return [];
    }
  });

  const results = await workerPool(tasks, 20);
  results.forEach(r => { if (Array.isArray(r)) allJobs.push(...r); });

  console.log(`  Total: ${allJobs.length} jobs from BambooHR`);
  return allJobs;
}

async function fetchPersonio() {
  console.log('\n── Personio ──');
  const allJobs = [];

  const tasks = PERSONIO_SLUGS.map(slug => async () => {
    try {
      const res = await fetch(`https://${slug}.jobs.personio.de/xml`, {
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) { console.log(`  ⚠ ${slug}: ${res.status}`); return []; }
      const text = await res.text();
      const positions = text.split('<position>');
      const companyJobs = [];
      for (let i = 1; i < positions.length; i++) {
        const pos = positions[i];
        const idMatch = pos.match(/<id>(.*?)<\/id>/);
        const nameTagMatch = pos.match(/<name>([\s\S]*?)<\/name>/);
        if (!idMatch || !nameTagMatch) continue;
        const id = idMatch[1];
        const title = nameTagMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim();
        const officeMatch = pos.match(/<office>([\s\S]*?)<\/office>/);
        const office = officeMatch ? officeMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() : '';
        const cleanCompany = slug.replace(/-(gmbh|se|sas|ag|io|ltd|ab|bv|nv)$/i, '')
          .split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        companyJobs.push({
          source: 'personio',
          external_id: `po_${slug}_${id}`,
          dedup_hash: dedupHash(slug, title),
          title,
          company: cleanCompany,
          company_logo: null,
          location: office || 'Remote',
          job_type: 'full_time',
          salary: null,
          description: null,
          tags: extractTags(title),
          apply_url: `https://${slug}.jobs.personio.de/job/${id}`,
          category: null,
          published_at: null,
        });
      }
      const isTechCompany = companyJobs.some(j => /engineer|developer|swe|software|frontend|backend|fullstack|data scien|machine learning|ai\b|product manager|ux design|qa /i.test(j.title));
      if (!isTechCompany) return [];
      if (companyJobs.length) console.log(`  ✅ ${slug}: ${companyJobs.length} jobs (Tech)`);
      return companyJobs;
    } catch (e) { console.log(`  ⚠ ${slug}: ${e.message}`); return []; }
  });

  const results = await workerPool(tasks, 20);
  results.forEach(r => { if (Array.isArray(r)) allJobs.push(...r); });
  console.log(`  Total: ${allJobs.length} jobs from Personio`);
  return allJobs;
}

async function fetchBreezy() {
  console.log('\n── Breezy HR ──');
  const allJobs = [];

  const tasks = BREEZY_SLUGS.map(slug => async () => {
    try {
      const res = await fetch(`https://${slug}.breezy.hr/json`, {
        redirect: 'manual', signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) { console.log(`  ⚠ ${slug}: ${res.status}`); return []; }
      const data = await res.json();
      const companyJobs = (Array.isArray(data) ? data : []).map(j => ({
        source: 'breezy',
        external_id: `br_${slug}_${j.id}`,
        dedup_hash: dedupHash(slug, j.name || ''),
        title: (j.name || '').trim(),
        company: slug.charAt(0).toUpperCase() + slug.slice(1),
        company_logo: null,
        location: 'Remote',
        job_type: 'full_time',
        salary: null,
        description: null,
        tags: extractTags(j.name || ''),
        apply_url: j.url,
        category: null,
        published_at: j.published_date || null,
      })).filter(j => j.title);

      const isTechCompany = companyJobs.some(j => /engineer|developer|swe|software|frontend|backend|fullstack|data scien|machine learning|ai\b|product manager|ux design|qa /i.test(j.title));
      if (!isTechCompany) return [];
      if (companyJobs.length) console.log(`  ✅ ${slug}: ${companyJobs.length} jobs (Tech)`);
      return companyJobs;
    } catch (e) { console.log(`  ⚠ ${slug}: ${e.message}`); return []; }
  });

  const results = await workerPool(tasks, 20);
  results.forEach(r => { if (Array.isArray(r)) allJobs.push(...r); });
  console.log(`  Total: ${allJobs.length} jobs from Breezy HR`);
  return allJobs;
}

// ─── Source: Remotive ───
async function fetchRemotive() {
  console.log('\n── Remotive ──');
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=500');
    const data = await res.json();
    const jobs = (data.jobs || []).map(j => {
      const tags = j.tags?.length ? j.tags : extractTags(`${j.title} ${j.description || ''}`);
      return {
        source: 'remotive',
        external_id: `remotive_${j.id}`,
        dedup_hash: dedupHash(j.company_name, j.title),
        title: j.title,
        company: j.company_name,
        company_logo: j.company_logo || null,
        location: j.candidate_required_location || 'Remote',
        job_type: normalizeJobType(j.job_type),
        salary: j.salary || null,
        description: j.description?.substring(0, 5000) || null,
        tags: Array.isArray(tags) ? tags : extractTags(`${j.title} ${j.description || ''}`),
        apply_url: j.url,
        category: j.category || null,
        published_at: j.publication_date || null,
      };
    });
    console.log(`  Found ${jobs.length} jobs`);
    return jobs;
  } catch (e) {
    console.error(`  ❌ Remotive error: ${e.message}`);
    return [];
  }
}


// ─── Source: Arbeitnow (Paginated) ───
async function fetchArbeitnow() {
  console.log('\n── Arbeitnow ──');
  let allJobs = [];
  try {
    for (let page = 1; page <= 5; page++) {
      console.log(`  Fetching page ${page}...`);
      const res = await fetch(`https://arbeitnow.com/api/job-board-api?page=${page}`);
      const data = await res.json();
      const jobs = (data.data || []).map(j => ({
        source: 'arbeitnow',
        external_id: `arbeitnow_${j.slug}`,
        dedup_hash: dedupHash(j.company_name, j.title),
        title: j.title,
        company: j.company_name,
        company_logo: null,
        location: j.remote ? 'Remote' : (j.location || 'Unknown'),
        job_type: (j.job_types || []).join(', ') || 'full_time',
        salary: null,
        description: j.description.substring(0, 5000),
        tags: j.tags && j.tags.length ? j.tags : extractTags(`${j.title} ${j.description || ''}`),
        apply_url: j.url,
        category: null,
        published_at: j.created_at ? new Date(j.created_at * 1000).toISOString() : null,
      })).filter(j => j.location && j.location.toLowerCase().includes('remote'));
      allJobs = [...allJobs, ...jobs];
      if (data.data?.length < 10) break; // End of pages
    }
    console.log(`  Found ${allJobs.length} total jobs from Arbeitnow`);
    return allJobs;
  } catch (e) {
    console.error(`  ❌ Arbeitnow error: ${e.message}`);
    return allJobs;
  }
}

// ─── Source: WeWorkRemotely ───
async function fetchWeWorkRemotely() {
  console.log('\n── WeWorkRemotely ──');
  try {
    const res = await fetch('https://weworkremotely.com/remote-jobs.rss');
    const xml = await res.text();
    const jobs = [];
    const itemRegex = /<item>[\s\S]*?<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[0];
      const getTag = (tag) => {
        const tMatch = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return tMatch ? tMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
      };
      
      const titleFull = getTag('title');
      let company = 'Unknown', title = titleFull;
      if (titleFull.includes(': ')) {
        const parts = titleFull.split(': ');
        company = parts[0];
        title = parts.slice(1).join(': ');
      }
      
      jobs.push({
        source: 'weworkremotely',
        external_id: `wwr_${getTag('guid')}`,
        dedup_hash: dedupHash(company, title),
        title,
        company,
        company_logo: null,
        location: getTag('category') || 'Remote',
        job_type: 'full_time',
        salary: null,
        description: getTag('description').substring(0, 5000),
        tags: extractTags(`${title} ${getTag('description')}`),
        apply_url: getTag('link'),
        category: null,
        published_at: new Date(getTag('pubDate')).toISOString(),
      });
    }
    console.log(`  Found ${jobs.length} jobs`);
    return jobs;
  } catch(e) {
    console.error(`  ❌ WWR error: ${e.message}`);
    return [];
  }
}

// ─── Source: Himalayas ───
async function fetchHimalayas() {
  console.log('\n── Himalayas ──');
  try {
    const res = await fetch('https://himalayas.app/jobs/api?limit=500');
    const data = await res.json();
    const jobs = (data.jobs || []).map(j => ({
      source: 'himalayas',
      external_id: `himalayas_${j.id}`,
      dedup_hash: dedupHash(j.companyName || j.company_name || '', j.title),
      title: j.title,
      company: j.companyName || j.company_name || 'Unknown',
      company_logo: j.companyLogo || j.company_logo || null,
      location: j.location || 'Remote',
      job_type: normalizeJobType(j.type || j.jobType),
      salary: j.salary || null,
      description: (j.description || j.excerpt || '').substring(0, 5000),
      tags: j.tags?.length ? j.tags : extractTags(`${j.title} ${j.description || ''}`),
      apply_url: j.applicationUrl || j.url || `https://himalayas.app/jobs/${j.id}`,
      category: j.categories?.[0] || j.category || null,
      published_at: j.publishedAt || j.published_at || null,
    }));
    console.log(`  Found ${jobs.length} jobs`);
    return jobs;
  } catch (e) {
    console.error(`  ❌ Himalayas error: ${e.message}`);
    return [];
  }
}

// ─── Source: Jobicy ───
async function fetchJobicy() {
  console.log('\n── Jobicy ──');
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=200');
    const data = await res.json();
    const jobs = (data.jobs || []).map(j => ({
      source: 'jobicy',
      external_id: `jobicy_${j.id}`,
      dedup_hash: dedupHash(j.companyName || '', j.jobTitle),
      title: j.jobTitle,
      company: j.companyName || 'Unknown',
      company_logo: j.companyLogo || null,
      location: j.jobGeo || 'Remote',
      job_type: normalizeJobType(j.jobType),
      salary: j.annualSalaryMin && j.annualSalaryMax
        ? `$${j.annualSalaryMin}-$${j.annualSalaryMax}`
        : null,
      description: (j.jobDescription || '').substring(0, 5000),
      tags: j.jobIndustry ? [j.jobIndustry] : extractTags(`${j.jobTitle} ${j.jobDescription || ''}`),
      apply_url: j.url,
      category: j.jobIndustry?.[0] || null,
      published_at: j.pubDate || null,
    }));
    console.log(`  Found ${jobs.length} jobs`);
    return jobs;
  } catch (e) {
    console.error(`  ❌ Jobicy error: ${e.message}`);
    return [];
  }
}

// ─── Source: Greenhouse (per-company) ───
async function fetchGreenhouse() {
  console.log('\n── Greenhouse ──');
  const allJobs = [];

  const tasks = GREENHOUSE_SLUGS.map(slug => async () => {
    try {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`);
      if (!res.ok) { console.log(`  ⚠ ${slug}: ${res.status}`); return []; }
      const data = await res.json();
      const companyJobs = (data.jobs || [])
        .map(j => ({
          source: 'greenhouse',
          external_id: `gh_${slug}_${j.id}`,
          dedup_hash: dedupHash(j.company_name || slug, j.title),
          title: j.title.trim(),
          company: j.company_name || slug,
          company_logo: null,
          location: j.location?.name || 'Remote',
          job_type: null,
          salary: null,
          description: null,
          tags: extractTags(j.title),
          apply_url: j.absolute_url,
          category: null,
          published_at: j.updated_at || j.first_published || null,
        }));
      if (companyJobs.length) console.log(`  ✅ ${slug}: ${companyJobs.length} jobs`);
      return companyJobs;
    } catch (e) {
      console.log(`  ⚠ ${slug}: ${e.message}`);
      return [];
    }
  });

  const results = await workerPool(tasks, 50);
  results.forEach(r => { if (Array.isArray(r)) allJobs.push(...r); });

  console.log(`  Total: ${allJobs.length} jobs from Greenhouse`);
  return allJobs;
}

// ─── Source: Ashby (per-company) ───
async function fetchAshby() {
  console.log('\n── Ashby ──');
  const allJobs = [];

  const tasks = ASHBY_SLUGS.map(slug => async () => {
    try {
      const res = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${slug}`);
      if (!res.ok) { console.log(`  ⚠ ${slug}: ${res.status}`); return []; }
      const data = await res.json();
      const companyJobs = (data.jobs || [])
        .map(j => ({
          source: 'ashby',
          external_id: `ashby_${slug}_${j.id}`,
          dedup_hash: dedupHash(data.organizationName || slug, j.title),
          title: j.title,
          company: data.organizationName || slug,
          company_logo: null,
          location: j.location || j.locationName || 'Remote',
          job_type: j.employmentType ? normalizeJobType(j.employmentType) : null,
          salary: null,
          description: (j.descriptionPlain || j.description || '').substring(0, 5000),
          tags: extractTags(`${j.title} ${j.descriptionPlain || j.description || ''}`),
          apply_url: j.jobUrl || `https://jobs.ashbyhq.com/${slug}/${j.id}`,
          category: j.department || j.team || null,
          published_at: j.publishedAt || null,
        }));
      if (companyJobs.length) console.log(`  ✅ ${slug}: ${companyJobs.length} jobs`);
      return companyJobs;
    } catch (e) {
      console.log(`  ⚠ ${slug}: ${e.message}`);
      return [];
    }
  });

  const results = await workerPool(tasks, 50);
  results.forEach(r => { if (Array.isArray(r)) allJobs.push(...r); });

  console.log(`  Total: ${allJobs.length} jobs from Ashby`);
  return allJobs;
}

// ─── Source: Workable (per-company) ───
async function fetchWorkable() {
  console.log('\n── Workable ──');
  const allJobs = [];

  const tasks = WORKABLE_SLUGS.map(slug => async () => {
    try {
      await sleep(2000); // Rate limit protection
      const res = await fetch(`https://apply.workable.com/api/v3/accounts/${slug}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '', location: [], department: [], worktype: [], remote: [] }),
      });
      if (!res.ok) { console.log(`  ⚠ ${slug}: ${res.status}`); return []; }
      const data = await res.json();
      const companyJobs = (data.results || [])
        .map(j => ({
          source: 'workable',
          external_id: `wb_${slug}_${j.shortcode}`,
          dedup_hash: dedupHash(slug, j.title),
          title: j.title,
          company: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          company_logo: null,
          location: j.remote ? `Remote${j.location?.city ? ` - ${j.location.city}` : ''}` : (j.location?.city || j.location?.country || 'Unknown'),
          job_type: j.type === 'full' ? 'full_time' : j.type === 'part' ? 'part_time' : j.type ? normalizeJobType(j.type) : null,
          salary: null,
          description: null,
          tags: extractTags(j.title + ' ' + (j.department || []).join(' ')),
          apply_url: `https://apply.workable.com/${slug}/j/${j.shortcode}/`,
          category: (j.department || [])[0] || null,
          published_at: j.published || null,
        }));
      if (companyJobs.length) console.log(`  ✅ ${slug}: ${companyJobs.length} jobs`);
      return companyJobs;
    } catch (e) {
      console.log(`  ⚠ ${slug}: ${e.message}`);
      return [];
    }
  });

  const results = await workerPool(tasks, 3);
  results.forEach(r => { if (Array.isArray(r)) allJobs.push(...r); });

  console.log(`  Total: ${allJobs.length} jobs from Workable`);
  return allJobs;
}

// ─── Source: Lever (per-company) ───
async function fetchLever() {
  console.log('\n── Lever ──');
  const allJobs = [];

  const tasks = LEVER_SLUGS.map(slug => async () => {
    try {
      const res = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`);
      if (!res.ok) { console.log(`  ⚠ ${slug}: ${res.status}`); return []; }
      const data = await res.json();
      const companyJobs = (Array.isArray(data) ? data : [])
        .map(j => ({
          source: 'lever',
          external_id: `lever_${slug}_${j.id}`,
          dedup_hash: dedupHash(j.text ? slug : slug, j.text || ''),
          title: (j.text || '').trim(),
          company: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          company_logo: null,
          location: j.categories?.location || 'Remote',
          job_type: j.categories?.commitment || null,
          salary: null,
          description: (j.descriptionPlain || '').substring(0, 5000),
          tags: extractTags(`${j.text || ''} ${j.descriptionPlain || ''}`),
          apply_url: j.hostedUrl || j.applyUrl || `https://jobs.lever.co/${slug}/${j.id}`,
          category: j.categories?.department || j.categories?.team || null,
          published_at: j.createdAt ? new Date(j.createdAt).toISOString() : null,
        }));
      if (companyJobs.length) console.log(`  ✅ ${slug}: ${companyJobs.length} jobs`);
      return companyJobs;
    } catch (e) {
      console.log(`  ⚠ ${slug}: ${e.message}`);
      return [];
    }
  });

  const results = await workerPool(tasks, 50);
  results.forEach(r => { if (Array.isArray(r)) allJobs.push(...r); });

  console.log(`  Total: ${allJobs.length} jobs from Lever`);
  return allJobs;
}

// ─── Source: SmartRecruiters (per-company) ───
const SMARTRECRUITERS_SLUGS = [
  // APAC
  'Grab','DeliveryHero','Wise','Freshworks',
  // Global with APAC presence
  'Visa','Canva','ServiceNow',
  // Migrated from Greenhouse
  'Bigcommerce','Polygontechnology',
  // Remote-first additions
  'DocuSign',
];

async function fetchSmartRecruiters() {
  console.log('\n── SmartRecruiters ──');
  const jobs = [];

  for (const slug of SMARTRECRUITERS_SLUGS) {
    try {
      let offset = 0;
      let total = 0;
      do {
        const res = await fetch(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100&offset=${offset}`);
        if (!res.ok) { console.log(`  ⚠ ${slug}: ${res.status}`); break; }
        const data = await res.json();
        total = data.totalFound || 0;
        for (const j of (data.content || [])) {
          const loc = j.location || {};
          const city = loc.city || '';
          const country = loc.country || '';
          const location = [city, country].filter(Boolean).join(', ') || 'Remote';
          jobs.push({
            source: 'smartrecruiters',
            external_id: `sr_${slug}_${j.id || j.uuid}`,
            dedup_hash: dedupHash(j.company?.name || slug, j.name || ''),
            title: (j.name || '').trim(),
            company: j.company?.name || slug,
            company_logo: null,
            location,
            job_type: j.typeOfEmployment?.label || null,
            salary: null,
            description: null,
            tags: extractTags(j.name || ''),
            apply_url: j.applyUrl || `https://jobs.smartrecruiters.com/${slug}/${j.id}`,
            category: j.department?.label || j.function?.label || null,
            published_at: j.releasedDate || null,
          });
        }
        offset += 100;
        await sleep(500);
      } while (offset < total && offset < 1000);
      console.log(`  ✅ ${slug}: ${Math.min(total, jobs.length)} jobs`);
    } catch (e) {
      console.log(`  ⚠ ${slug}: ${e.message}`);
    }
  }

  console.log(`  Total: ${jobs.length} jobs from SmartRecruiters`);
  return jobs;
}

// ─── Source: Workday (per-company, POST API) ───
const WORKDAY_BOARDS = [
  { slug: 'propertyguru', host: 'propertyguru.wd105.myworkdayjobs.com', path: 'PropertyGuru', company: 'PropertyGuru' },
];

async function fetchWorkday() {
  console.log('\n── Workday ──');
  const jobs = [];

  for (const board of WORKDAY_BOARDS) {
    try {
      let offset = 0;
      let total = 0;
      do {
        const res = await fetch(`https://${board.host}/wday/cxs/${board.slug}/${board.path}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appliedFacets: {}, limit: 20, offset, searchText: '' }),
        });
        if (!res.ok) { console.log(`  ⚠ ${board.slug}: ${res.status}`); break; }
        const data = await res.json();
        total = data.total || 0;
        for (const j of (data.jobPostings || [])) {
          jobs.push({
            source: 'workday',
            external_id: `wd_${board.slug}_${j.bulletFields?.[0] || offset}`,
            dedup_hash: dedupHash(board.company, j.title || ''),
            title: (j.title || '').trim(),
            company: board.company,
            company_logo: null,
            location: j.locationsText || 'Remote',
            job_type: null,
            salary: null,
            description: null,
            tags: extractTags(j.title || ''),
            apply_url: `https://${board.host}/en-US/${board.path}/job${j.externalPath || ''}`,
            category: null,
            published_at: j.postedOn || null,
          });
        }
        offset += 20;
        await sleep(300);
      } while (offset < total);
      console.log(`  ✅ ${board.slug}: ${Math.min(total, jobs.length)} jobs`);
    } catch (e) {
      console.log(`  ⚠ ${board.slug}: ${e.message}`);
    }
  }

  console.log(`  Total: ${jobs.length} jobs from Workday`);
  return jobs;
}

// ─── Source: Foorilla (HTML scraping via HTMX) ───
// Uses ?remote=true filter + pagination + parallel worker pool

// Worker pool: runs N tasks concurrently
async function workerPool(tasks, concurrency = 10) {
  const results = [];
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      try {
        const result = await tasks[i]();
        if (result) results.push(result);
      } catch (e) { /* skip */ }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

function parseFoorillaJob(slug, html) {
  // Parse structured HTML for job data
  const titleMatch = html.match(/<h\d[^>]*>([^<]+)<\/h\d>/);
  const companyMatch = html.match(/@([A-Za-z0-9_.\- ]+)/);
  const locationMatch = html.match(/(?:📍|location|Location|loc)[:\s]*([^<\n]+)/i);
  const applyMatch = html.match(/href="(https?:\/\/[^"]+)"[^>]*(?:Apply|apply)/i) ||
                    html.match(/href="(https?:\/\/[^"]*(?:lever|greenhouse|ashby|workday|personio|jobs|careers|apply)[^"]*)"/i);

  // Extract tags from bracket notation [React] [Python] etc
  const tagRegex = /\[([A-Za-z0-9+#. ]+)\]/g;
  const tags = [];
  let tagMatch;
  while ((tagMatch = tagRegex.exec(html))) {
    const tag = tagMatch[1].trim();
    if (!['SE','MI','EN','EX'].includes(tag)) tags.push(tag);
  }

  // Extract salary
  const salaryMatch = html.match(/(?:[$€£¥][\d,]+[KkMm]?(?:\s*[-–]\s*[$€£¥]?[\d,]+[KkMm]?)?|[\d,]+\s*(?:USD|EUR|GBP))/);

  // Extract job type
  const typeMatch = html.match(/(?:Full Time|Part Time|Contract|Freelance|Internship)/i);

  // Extract experience level
  const expMatch = html.match(/\[(SE|MI|EN|EX)\]/);

  const title = titleMatch?.[1]?.trim();
  const company = companyMatch?.[1]?.trim();
  if (!title || !company) return null;

  const idMatch = slug.match(/-(\d+)\/$/);
  const externalId = idMatch ? `foorilla_${idMatch[1]}` : `foorilla_${crypto.createHash('md5').update(slug).digest('hex').substring(0, 10)}`;
  const applyUrl = applyMatch?.[1] || `https://foorilla.com${slug}`;

  return {
    source: 'foorilla',
    external_id: externalId,
    dedup_hash: dedupHash(company, title),
    title,
    company,
    company_logo: null,
    location: locationMatch?.[1]?.trim() || 'Remote',
    job_type: typeMatch ? normalizeJobType(typeMatch[0]) : null,
    salary: salaryMatch?.[0] || null,
    description: null,
    tags: tags.length ? tags : extractTags(title),
    apply_url: applyUrl,
    category: expMatch?.[1] || null,
    published_at: null,
  };
}

async function fetchFoorilla() {
  console.log('\n── Foorilla ──');
  const CONCURRENCY = 100;

  // Use multiple keyword queries as separate "sessions" to bypass pagination cap
  const KEYWORDS = [
    '', // default
    // Roles
    'engineer','developer','frontend','backend','fullstack','devops','sre','platform',
    'data','machine learning','ai','ml','nlp','deep learning','computer vision',
    'product','designer','ux','ui','design','researcher','scientist',
    'manager','director','vp','head','lead','principal','staff','senior','junior','intern',
    'analyst','qa','tester','automation','quality',
    'marketing','growth','seo','content','copywriter','social media',
    'sales','account','business development','partnerships','customer success',
    'support','operations','finance','hr','recruiting','people',
    'legal','compliance','security','infosec','cybersecurity',
    // Languages & Frameworks
    'python','javascript','typescript','react','angular','vue','svelte',
    'node','golang','go','rust','java','kotlin','swift','scala','elixir',
    'ruby','rails','php','laravel','c++','c#','.net','sql',
    'nextjs','remix','nuxt','django','flask','fastapi','spring',
    // Infra & Cloud
    'cloud','aws','azure','gcp','kubernetes','docker','terraform','ansible',
    'linux','networking','database','postgresql','mongodb','redis','kafka',
    'api','microservices','distributed','infrastructure',
    // Domains
    'blockchain','web3','crypto','defi','nft','smart contract','solidity',
    'fintech','healthtech','edtech','biotech','gaming','ecommerce',
    'mobile','ios','android','flutter','react native',
    'embedded','firmware','hardware','robotics','iot',
    // Misc
    'remote','hybrid','onsite','contract','freelance','part time',
    'startup','series','venture','saas','b2b','b2c',
    'singapore','london','berlin','amsterdam','toronto','sydney','tokyo',
    'india','europe','asia','apac','latam','africa',
  ];

  try {
    // Phase 1: Collect slugs from all keyword sessions in parallel
    const allSlugs = new Set();

    const extractSlugs = async (keyword) => {
      const q = keyword ? `?q=${encodeURIComponent(keyword)}` : '';
      const url = `https://foorilla.com/hiring/jobs/${q}`;
      try {
        const res = await fetch(url, { headers: { 'HX-Request': 'true' } });
        if (!res.ok) return 0;
        const html = await res.text();
        const slugRegex = /hx-get="(\/hiring\/jobs\/[^"]+\/)"/g;
        let match, found = 0;
        while ((match = slugRegex.exec(html))) {
          const slug = match[1];
          if (/\-\d+\/$/.test(slug) && !allSlugs.has(slug)) {
            allSlugs.add(slug);
            found++;
          }
        }
        return found;
      } catch { return 0; }
    };

    // Run keyword sessions with concurrency limit
    const keywordTasks = KEYWORDS.map(kw => async () => {
      const found = await extractSlugs(kw);
      if (found > 0) console.log(`  🔍 "${kw || 'default'}": ${found} new slugs (total: ${allSlugs.size})`);
      return found;
    });
    await workerPool(keywordTasks, 10);

    // Also paginate the default listing for pages 2-20
    for (let page = 2; page <= 20; page++) {
      const res = await fetch(`https://foorilla.com/hiring/jobs/?page=${page}`, { headers: { 'HX-Request': 'true' } });
      if (!res.ok) break;
      const html = await res.text();
      const slugRegex = /hx-get="(\/hiring\/jobs\/[^"]+\/)"/g;
      let match, found = 0;
      while ((match = slugRegex.exec(html))) {
        const slug = match[1];
        if (/\-\d+\/$/.test(slug) && !allSlugs.has(slug)) {
          allSlugs.add(slug);
          found++;
        }
      }
      if (found > 0) console.log(`  📄 Page ${page}: ${found} new slugs (total: ${allSlugs.size})`);
      if (found === 0) break;
      await sleep(200);
    }

    console.log(`  📋 Total unique slugs: ${allSlugs.size}`);
    if (allSlugs.size === 0) return [];

    // Phase 2: Fetch details in parallel using worker pool
    const slugArr = [...allSlugs];
    const tasks = slugArr.map(slug => async () => {
      const res = await fetch(`https://foorilla.com${slug}`, {
        headers: { 'HX-Request': 'true' },
      });
      if (!res.ok) return null;
      const html = await res.text();
      return parseFoorillaJob(slug, html);
    });

    console.log(`  ⚡ Fetching details with ${CONCURRENCY} parallel workers...`);
    const jobs = await workerPool(tasks, CONCURRENCY);
    console.log(`  ✅ Parsed ${jobs.length} jobs from Foorilla`);
    return jobs;
  } catch (e) {
    console.error(`  ❌ Foorilla error: ${e.message}`);
    return [];
  }
}

// ─── Source: Jooble (aggregator — millions of jobs across 70+ countries) ───
const JOOBLE_SEARCH_QUERIES = [
  { keywords: 'software engineer', location: 'remote' },
  { keywords: 'frontend developer', location: 'remote' },
  { keywords: 'backend developer', location: 'remote' },
  { keywords: 'full stack developer', location: 'remote' },
  { keywords: 'devops engineer', location: 'remote' },
  { keywords: 'data scientist', location: 'remote' },
  { keywords: 'machine learning engineer', location: 'remote' },
  { keywords: 'product manager', location: 'remote' },
  { keywords: 'UX designer', location: 'remote' },
  { keywords: 'data analyst', location: 'remote' },
  { keywords: 'software engineer', location: 'London' },
  { keywords: 'software engineer', location: 'New York' },
  { keywords: 'software engineer', location: 'San Francisco' },
  { keywords: 'software engineer', location: 'Berlin' },
  { keywords: 'frontend developer', location: 'London' },
  { keywords: 'backend developer', location: 'New York' },
  { keywords: 'product manager', location: 'London' },
  { keywords: 'data scientist', location: 'San Francisco' },
  { keywords: 'devops engineer', location: 'Berlin' },
  { keywords: 'marketing manager', location: 'remote' },
  { keywords: 'sales manager', location: 'remote' },
  { keywords: 'cloud engineer', location: 'remote' },
  { keywords: 'iOS developer', location: 'remote' },
  { keywords: 'Android developer', location: 'remote' },
  { keywords: 'cybersecurity', location: 'remote' },
  { keywords: 'AI engineer', location: 'remote' },
  { keywords: 'data engineer', location: 'remote' },
  { keywords: 'QA engineer', location: 'remote' },
  { keywords: 'solutions architect', location: 'remote' },
  { keywords: 'site reliability engineer', location: 'remote' },
];

async function fetchJooble() {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) {
    console.log('\n── Jooble ── (skipped: no JOOBLE_API_KEY)');
    return [];
  }
  console.log('\n── Jooble ──');
  const allJobs = [];
  let queryCount = 0;

  for (const query of JOOBLE_SEARCH_QUERIES) {
    try {
      const res = await fetch(`https://jooble.org/api/${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: query.keywords,
          location: query.location,
          page: '1',
          ResultOnPage: '20',
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          console.log(`  ⚠️ Rate limited after ${queryCount} queries, stopping`);
          break;
        }
        console.error(`  ❌ Jooble ${query.keywords}/${query.location}: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const jobs = (data.jobs || []).map(j => ({
        source: 'jooble',
        external_id: `jooble_${j.id || crypto.createHash('md5').update(j.link || j.title || '').digest('hex')}`,
        dedup_hash: dedupHash(j.company || '', j.title || ''),
        title: (j.title || '').replace(/<[^>]*>/g, '').trim(),
        company: (j.company || 'Unknown').trim(),
        company_logo: null,
        location: j.location || query.location || 'Remote',
        job_type: normalizeJobType(j.type) || null,
        salary: j.salary || null,
        description: (j.snippet || '').replace(/<[^>]*>/g, '').substring(0, 5000),
        tags: extractTags(`${j.title || ''} ${(j.snippet || '').replace(/<[^>]*>/g, '')}`),
        apply_url: j.link || '',
        category: null,
        published_at: j.updated || null,
      })).filter(j => j.title && j.company && j.apply_url);

      allJobs.push(...jobs);
      queryCount++;

      // Rate limit: ~100ms between requests
      await sleep(150);
    } catch (e) {
      console.error(`  ❌ Jooble ${query.keywords}/${query.location}: ${e.message}`);
    }
  }

  // Deduplicate within Jooble results (same job from multiple queries)
  const seen = new Set();
  const unique = allJobs.filter(j => {
    if (seen.has(j.dedup_hash)) return false;
    seen.add(j.dedup_hash);
    return true;
  });

  console.log(`  Total: ${unique.length} unique jobs from Jooble (${allJobs.length} raw, ${queryCount} queries)`);
  return unique;
}

// ─── Source: Adzuna (aggregator — millions of jobs across 12 countries) ───
const ADZUNA_COUNTRIES = ['us', 'gb', 'de', 'au', 'nl', 'sg'];
const ADZUNA_KEYWORDS = [
  'software engineer',
  'frontend developer',
  'data scientist',
  'product manager',
  'devops',
  'machine learning',
  'cloud engineer',
  'UX designer',
];

async function fetchAdzuna() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    console.log('\n── Adzuna ── (skipped: no ADZUNA_APP_ID/ADZUNA_APP_KEY)');
    return [];
  }
  console.log('\n── Adzuna ──');
  const allJobs = [];
  let queryCount = 0;

  for (const country of ADZUNA_COUNTRIES) {
    for (const keyword of ADZUNA_KEYWORDS) {
      try {
        const params = new URLSearchParams({
          app_id: appId,
          app_key: appKey,
          what: keyword,
          results_per_page: '50',
          'content-type': 'application/json',
          sort_by: 'date',
        });

        const res = await fetch(
          `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
          { headers: { 'User-Agent': 'CVin.Bio job aggregator (contact@cvin.bio)' } }
        );

        if (!res.ok) {
          if (res.status === 429) {
            console.log(`  ⚠️ Rate limited on ${country}, skipping remaining keywords`);
            break;
          }
          console.error(`  ❌ Adzuna ${country}/${keyword}: ${res.status}`);
          continue;
        }

        const data = await res.json();
        const jobs = (data.results || []).map(j => {
          const salaryStr = j.salary_min && j.salary_max
            ? `$${Math.round(j.salary_min).toLocaleString()}-$${Math.round(j.salary_max).toLocaleString()}`
            : null;

          return {
            source: 'adzuna',
            external_id: `adzuna_${j.id || crypto.createHash('md5').update(j.redirect_url || j.title || '').digest('hex')}`,
            dedup_hash: dedupHash(j.company?.display_name || '', j.title || ''),
            title: (j.title || '').trim(),
            company: (j.company?.display_name || 'Unknown').trim(),
            company_logo: null,
            location: j.location?.display_name || country.toUpperCase(),
            job_type: j.contract_type ? normalizeJobType(j.contract_type) : null,
            salary: salaryStr,
            description: (j.description || '').substring(0, 5000),
            tags: extractTags(`${j.title || ''} ${j.description || ''}`),
            apply_url: j.redirect_url || '',
            category: j.category?.label || null,
            published_at: j.created || null,
          };
        }).filter(j => j.title && j.company && j.apply_url);

        allJobs.push(...jobs);
        queryCount++;

        // Rate limit: 200ms between requests
        await sleep(200);
      } catch (e) {
        console.error(`  ❌ Adzuna ${country}/${keyword}: ${e.message}`);
      }
    }
  }

  // Deduplicate within Adzuna results
  const seen = new Set();
  const unique = allJobs.filter(j => {
    if (seen.has(j.dedup_hash)) return false;
    seen.add(j.dedup_hash);
    return true;
  });

  console.log(`  Total: ${unique.length} unique jobs from Adzuna (${allJobs.length} raw, ${queryCount} queries)`);
  return unique;
}

// ─── Source: Careerjet (aggregator — millions of jobs, 60+ countries) ───
// Auth: Basic auth with API key as username, empty password
// Endpoint: GET https://search.api.careerjet.net/v4/query
// page_size up to 100, page 1-10, offset 0-999 → up to 1,000 jobs per query
const CAREERJET_LOCALES = [
  'en_US', 'en_GB', 'en_AU', 'en_CA', 'de_DE', 'fr_FR', 'nl_NL', 'en_SG',
  'en_IN', 'en_NZ', 'en_IE', 'en_ZA', 'es_ES', 'it_IT', 'pt_BR', 'en_AE',
];
const CAREERJET_KEYWORDS = [
  'software engineer', 'frontend developer', 'backend developer', 'data scientist',
  'product manager', 'devops engineer', 'machine learning', 'UX designer',
  'full stack developer', 'cloud engineer', 'data engineer', 'AI engineer',
  'mobile developer', 'QA engineer', 'cybersecurity', 'solutions architect',
];

async function fetchCareerjet() {
  const apiKey = process.env.CAREERJET_API_KEY;
  if (!apiKey) {
    console.log('\n── Careerjet ── (skipped: no CAREERJET_API_KEY)');
    return [];
  }
  console.log('\n── Careerjet ──');
  const allJobs = [];
  let queryCount = 0;
  const credentials = Buffer.from(`${apiKey}:`).toString('base64');

  // Strategy: 16 locales × 16 keywords × 3 pages × 100/page = up to 76,800 jobs
  // But we cap at 500 requests to stay well within 1K/hr limit
  for (const locale of CAREERJET_LOCALES) {
    for (const keyword of CAREERJET_KEYWORDS) {
      // Fetch first 3 pages (300 jobs per keyword×locale)
      for (let page = 1; page <= 3; page++) {
        if (queryCount >= 480) break; // Stay within rate limit
        try {
          const params = new URLSearchParams({
            locale_code: locale,
            keywords: keyword,
            sort: 'date',
            page: String(page),
            page_size: '100',
            fragment_size: '300',
            user_ip: '1.2.3.4',
            user_agent: 'CVin.Bio job aggregator',
          });

          const res = await fetch(`https://search.api.careerjet.net/v4/query?${params}`, {
            headers: { 'Authorization': `Basic ${credentials}` },
          });

          if (!res.ok) {
            if (res.status === 429) {
              console.log(`  ⚠️ Rate limited after ${queryCount} queries`);
              break;
            }
            continue;
          }

          const data = await res.json();
          if (data.type !== 'JOBS' || !data.jobs?.length) {
            if (page === 1) break; // No results for this combo, skip further pages
            continue;
          }

          const jobs = data.jobs.map(j => ({
            source: 'careerjet',
            external_id: `careerjet_${crypto.createHash('md5').update(j.url || j.title || '').digest('hex')}`,
            dedup_hash: dedupHash(j.company || '', j.title || ''),
            title: (j.title || '').replace(/<[^>]*>/g, '').trim(),
            company: (j.company || 'Unknown').trim(),
            company_logo: null,
            location: j.locations || locale.split('_')[1],
            job_type: null,
            salary: j.salary || (j.salary_min && j.salary_max ? `${j.salary_currency_code || '$'}${j.salary_min}-${j.salary_max}` : null),
            description: (j.description || '').replace(/<[^>]*>/g, '').substring(0, 5000),
            tags: extractTags(`${j.title || ''} ${(j.description || '').replace(/<[^>]*>/g, '')}`),
            apply_url: j.url || '',
            category: null,
            published_at: j.date || null,
          })).filter(j => j.title && j.company && j.apply_url);

          allJobs.push(...jobs);
          queryCount++;

          // If fewer results than page_size, no more pages
          if (data.jobs.length < 100) break;

          await sleep(80); // ~12 req/sec, well under 1K/hr
        } catch (e) {
          if (e.message?.includes('abort')) break;
          console.error(`  ❌ Careerjet ${locale}/${keyword}/p${page}: ${e.message}`);
        }
      }
      if (queryCount >= 480) break;
    }
    if (queryCount >= 480) break;
  }

  const seen = new Set();
  const unique = allJobs.filter(j => {
    if (seen.has(j.dedup_hash)) return false;
    seen.add(j.dedup_hash);
    return true;
  });

  console.log(`  Total: ${unique.length} unique jobs from Careerjet (${allJobs.length} raw, ${queryCount} queries)`);
  return unique;
}

// ─── Source: Reed (UK job board — 250K+ listings) ───
// Auth: Basic auth with API key as username, empty password
// Endpoint: GET https://www.reed.co.uk/api/1.0/search
// resultsToTake up to 100, resultsToSkip for pagination
const REED_KEYWORDS = [
  'software engineer', 'frontend developer', 'backend developer', 'data scientist',
  'product manager', 'devops', 'machine learning', 'UX designer', 'cloud engineer',
  'data analyst', 'QA engineer', 'full stack developer', 'project manager',
  'business analyst', 'solutions architect', 'data engineer', 'scrum master',
  'marketing manager', 'sales manager', 'content manager',
];

async function fetchReed() {
  const apiKey = process.env.REED_API_KEY;
  if (!apiKey) {
    console.log('\n── Reed ── (skipped: no REED_API_KEY)');
    return [];
  }
  console.log('\n── Reed ──');
  const allJobs = [];
  let queryCount = 0;
  const credentials = Buffer.from(`${apiKey}:`).toString('base64');

  // Strategy: 20 keywords × 5 pages × 100/page = up to 10,000 jobs
  // 100 queries well within 1K/day limit
  for (const keyword of REED_KEYWORDS) {
    for (let skip = 0; skip < 500; skip += 100) {
      if (queryCount >= 900) break;
      try {
        const params = new URLSearchParams({
          keywords: keyword,
          resultsToTake: '100',
          resultsToSkip: String(skip),
        });

        const res = await fetch(`https://www.reed.co.uk/api/1.0/search?${params}`, {
          headers: { 'Authorization': `Basic ${credentials}` },
        });

        if (!res.ok) {
          if (res.status === 429) {
            console.log(`  ⚠️ Rate limited after ${queryCount} queries`);
            break;
          }
          continue;
        }

        const data = await res.json();
        const results = data.results || [];
        if (!results.length) break;

        const jobs = results.map(j => ({
          source: 'reed',
          external_id: `reed_${j.jobId}`,
          dedup_hash: dedupHash(j.employerName || '', j.jobTitle || ''),
          title: (j.jobTitle || '').trim(),
          company: (j.employerName || 'Unknown').trim(),
          company_logo: j.employerProfileUrl || null,
          location: j.locationName || 'UK',
          job_type: j.partTime ? 'part_time' : (j.contractType === 'Contract' ? 'contract' : 'full_time'),
          salary: j.minimumSalary && j.maximumSalary
            ? `£${Math.round(j.minimumSalary).toLocaleString()}-£${Math.round(j.maximumSalary).toLocaleString()}`
            : (j.salaryDescription || null),
          description: (j.jobDescription || '').replace(/<[^>]*>/g, '').substring(0, 5000),
          tags: extractTags(`${j.jobTitle || ''} ${(j.jobDescription || '').replace(/<[^>]*>/g, '')}`),
          apply_url: j.jobUrl || `https://www.reed.co.uk/jobs/${j.jobId}`,
          category: j.category || null,
          published_at: j.date || null,
        })).filter(j => j.title && j.company && j.apply_url);

        allJobs.push(...jobs);
        queryCount++;

        if (results.length < 100) break; // No more pages

        await sleep(100);
      } catch (e) {
        console.error(`  ❌ Reed ${keyword}/skip${skip}: ${e.message}`);
      }
    }
    if (queryCount >= 900) break;
  }

  const seen = new Set();
  const unique = allJobs.filter(j => {
    if (seen.has(j.dedup_hash)) return false;
    seen.add(j.dedup_hash);
    return true;
  });

  console.log(`  Total: ${unique.length} unique jobs from Reed (${allJobs.length} raw, ${queryCount} queries)`);
  return unique;
}

// ─── Source: Findwork.dev (developer-focused job board — 100K+ listings) ───
// Auth: Token in Authorization header
// Endpoint: GET https://findwork.dev/api/jobs/
// Pagination: ?page=N, 20 results per page, 60 req/min
const FINDWORK_SEARCHES = [
  'software engineer', 'frontend', 'backend', 'full stack', 'devops',
  'data scientist', 'machine learning', 'product manager', 'UX designer',
  'mobile developer', 'cloud', 'AI', 'data engineer', 'SRE',
  'react', 'python', 'typescript', 'golang', 'rust', 'kubernetes',
];

async function fetchFindwork() {
  const apiKey = process.env.FINDWORK_API_KEY;
  if (!apiKey) {
    console.log('\n── Findwork ── (skipped: no FINDWORK_API_KEY)');
    return [];
  }
  console.log('\n── Findwork ──');
  const allJobs = [];
  let queryCount = 0;

  // Strategy: 20 keywords × 10 pages × 20/page = up to 4,000 jobs
  // 200 queries at 60/min = ~3.5 minutes
  for (const search of FINDWORK_SEARCHES) {
    for (let page = 1; page <= 10; page++) {
      if (queryCount >= 500) break;
      try {
        const params = new URLSearchParams({
          search,
          page: String(page),
          sort_by: 'date',
        });

        const res = await fetch(`https://findwork.dev/api/jobs/?${params}`, {
          headers: { 'Authorization': `Token ${apiKey}` },
        });

        if (!res.ok) {
          if (res.status === 429) {
            console.log(`  ⚠️ Rate limited, waiting 30s...`);
            await sleep(30000);
            continue;
          }
          break;
        }

        const data = await res.json();
        const results = data.results || [];
        if (!results.length) break;

        const jobs = results.map(j => ({
          source: 'findwork',
          external_id: `findwork_${j.id}`,
          dedup_hash: dedupHash(j.company_name || '', j.role || ''),
          title: (j.role || '').trim(),
          company: (j.company_name || 'Unknown').trim(),
          company_logo: j.logo || null,
          location: j.location || (j.remote ? 'Remote' : 'Unknown'),
          job_type: j.employment_type ? normalizeJobType(j.employment_type) : null,
          salary: j.salary_min && j.salary_max
            ? `$${j.salary_min.toLocaleString()}-$${j.salary_max.toLocaleString()}`
            : null,
          description: (j.text || j.description || '').replace(/<[^>]*>/g, '').substring(0, 5000),
          tags: j.keywords?.length ? j.keywords : extractTags(`${j.role || ''} ${j.text || j.description || ''}`),
          apply_url: j.url || '',
          category: null,
          published_at: j.date_posted || null,
        })).filter(j => j.title && j.company && j.apply_url);

        allJobs.push(...jobs);
        queryCount++;

        if (!data.next) break; // No more pages

        await sleep(1100); // 60 req/min = 1 per second
      } catch (e) {
        console.error(`  ❌ Findwork ${search}/p${page}: ${e.message}`);
      }
    }
    if (queryCount >= 500) break;
  }

  const seen = new Set();
  const unique = allJobs.filter(j => {
    if (seen.has(j.dedup_hash)) return false;
    seen.add(j.dedup_hash);
    return true;
  });

  console.log(`  Total: ${unique.length} unique jobs from Findwork (${allJobs.length} raw, ${queryCount} queries)`);
  return unique;
}

// ─── Source: JSearch / Google Jobs via RapidAPI (aggregates ALL boards) ───
// Auth: X-RapidAPI-Key header
// Endpoint: GET https://jsearch.p.rapidapi.com/search
// num_pages up to 10, 10 results per page
// Free: 200 req/mo → we maximize each with broad queries + pagination
const JSEARCH_QUERIES = [
  { query: 'software engineer remote', num_pages: '5' },
  { query: 'frontend developer remote', num_pages: '3' },
  { query: 'backend developer remote', num_pages: '3' },
  { query: 'data scientist remote', num_pages: '3' },
  { query: 'product manager remote', num_pages: '3' },
  { query: 'devops engineer remote', num_pages: '3' },
  { query: 'machine learning engineer remote', num_pages: '3' },
  { query: 'full stack developer remote', num_pages: '3' },
  { query: 'UX designer remote', num_pages: '2' },
  { query: 'cloud engineer remote', num_pages: '2' },
  { query: 'data engineer remote', num_pages: '2' },
  { query: 'AI engineer remote', num_pages: '2' },
  { query: 'mobile developer remote', num_pages: '2' },
  { query: 'cybersecurity analyst remote', num_pages: '2' },
  { query: 'software engineer London', num_pages: '2' },
  { query: 'software engineer Berlin', num_pages: '2' },
  { query: 'software engineer Singapore', num_pages: '2' },
  { query: 'marketing manager remote', num_pages: '2' },
  { query: 'sales engineer remote', num_pages: '2' },
  { query: 'solutions architect remote', num_pages: '2' },
];

async function fetchJSearch() {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    console.log('\n── JSearch ── (skipped: no JSEARCH_API_KEY)');
    return [];
  }
  console.log('\n── JSearch ──');
  const allJobs = [];
  let queryCount = 0;

  // 20 queries × avg 3 pages = 60 requests (well within 200/mo if run 3x/day = 60 × 30 = 1800... too many)
  // Actually: run max 6 queries per sync (3 syncs/day × 30 days = 90 syncs → 6 × 90 = 540 > 200)
  // Solution: rotate queries each sync using day-of-month
  const today = new Date().getDate(); // 1-31
  const rotatedQueries = [...JSEARCH_QUERIES.slice(today % JSEARCH_QUERIES.length), ...JSEARCH_QUERIES.slice(0, today % JSEARCH_QUERIES.length)];
  const queriesThisSync = rotatedQueries.slice(0, 3); // Only 3 queries per sync = ~9 requests

  for (const q of queriesThisSync) {
    try {
      const params = new URLSearchParams({
        query: q.query,
        num_pages: q.num_pages,
        date_posted: 'week',
      });

      const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      });

      if (!res.ok) {
        if (res.status === 429) {
          console.log(`  ⚠️ Rate limited, stopping`);
          break;
        }
        console.error(`  ❌ JSearch "${q.query}": ${res.status}`);
        continue;
      }

      const data = await res.json();
      const results = data.data || [];

      const jobs = results.map(j => ({
        source: 'jsearch',
        external_id: `jsearch_${j.job_id || crypto.createHash('md5').update(j.job_apply_link || j.job_title || '').digest('hex')}`,
        dedup_hash: dedupHash(j.employer_name || '', j.job_title || ''),
        title: (j.job_title || '').trim(),
        company: (j.employer_name || 'Unknown').trim(),
        company_logo: j.employer_logo || null,
        location: j.job_city
          ? `${j.job_city}${j.job_state ? ', ' + j.job_state : ''}${j.job_country ? ', ' + j.job_country : ''}`
          : (j.job_is_remote ? 'Remote' : 'Unknown'),
        job_type: j.job_employment_type ? normalizeJobType(j.job_employment_type) : null,
        salary: j.job_min_salary && j.job_max_salary
          ? `$${Math.round(j.job_min_salary).toLocaleString()}-$${Math.round(j.job_max_salary).toLocaleString()}`
          : null,
        description: (j.job_description || '').substring(0, 5000),
        tags: j.job_required_skills?.length
          ? j.job_required_skills
          : extractTags(`${j.job_title || ''} ${j.job_description || ''}`),
        apply_url: j.job_apply_link || '',
        category: null,
        published_at: j.job_posted_at_datetime_utc || null,
      })).filter(j => j.title && j.company && j.apply_url);

      allJobs.push(...jobs);
      queryCount++;
      console.log(`  ✅ "${q.query}": ${jobs.length} jobs`);

      await sleep(500);
    } catch (e) {
      console.error(`  ❌ JSearch "${q.query}": ${e.message}`);
    }
  }

  const seen = new Set();
  const unique = allJobs.filter(j => {
    if (seen.has(j.dedup_hash)) return false;
    seen.add(j.dedup_hash);
    return true;
  });

  console.log(`  Total: ${unique.length} unique jobs from JSearch (${allJobs.length} raw, ${queryCount} queries)`);
  return unique;
}

// ─── Source: LinkedIn (public guest endpoint — no auth, HTML parsing) ───
// Endpoint: GET https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search
// Returns HTML with job cards, 10 per page, paginate with start=0,25,50,...
// No API key needed — this is the same endpoint LinkedIn's public job search page uses
const LINKEDIN_QUERIES = [
  // === REMOTE WORLDWIDE ===
  { keywords: 'software engineer', location: 'remote' },
  { keywords: 'frontend developer', location: 'remote' },
  { keywords: 'backend developer', location: 'remote' },
  { keywords: 'full stack developer', location: 'remote' },
  { keywords: 'data scientist', location: 'remote' },
  { keywords: 'devops engineer', location: 'remote' },
  { keywords: 'machine learning engineer', location: 'remote' },
  { keywords: 'product manager', location: 'remote' },
  { keywords: 'UX designer', location: 'remote' },
  { keywords: 'cloud engineer', location: 'remote' },
  { keywords: 'data engineer', location: 'remote' },
  { keywords: 'AI engineer', location: 'remote' },
  { keywords: 'mobile developer', location: 'remote' },
  { keywords: 'cybersecurity', location: 'remote' },
  { keywords: 'solutions architect', location: 'remote' },
  { keywords: 'SRE', location: 'remote' },
  { keywords: 'blockchain developer', location: 'remote' },
  { keywords: 'game developer', location: 'remote' },
  { keywords: 'system administrator', location: 'remote' },
  { keywords: 'business analyst', location: 'remote' },
  { keywords: 'cloud architect', location: 'remote' },
  { keywords: 'data analyst', location: 'remote' },
  { keywords: 'security engineer', location: 'remote' },
  { keywords: 'iOS developer', location: 'remote' },
  { keywords: 'Android developer', location: 'remote' },
  { keywords: 'QA engineer', location: 'remote' },
  { keywords: 'infrastructure engineer', location: 'remote' },
  { keywords: 'platform engineer', location: 'remote' },

  // === NORTH AMERICA TECH HUBS ===
  { keywords: 'software engineer', location: 'San Francisco Bay Area' },
  { keywords: 'machine learning', location: 'San Francisco Bay Area' },
  { keywords: 'AI engineer', location: 'San Francisco Bay Area' },
  { keywords: 'data scientist', location: 'San Francisco Bay Area' },
  { keywords: 'software engineer', location: 'New York, United States' },
  { keywords: 'data scientist', location: 'New York, United States' },
  { keywords: 'product manager', location: 'New York, United States' },
  { keywords: 'software engineer', location: 'Seattle, WA' },
  { keywords: 'cloud engineer', location: 'Seattle, WA' },
  { keywords: 'software engineer', location: 'Austin, TX' },
  { keywords: 'devops engineer', location: 'Austin, TX' },
  { keywords: 'software engineer', location: 'Toronto, Canada' },
  { keywords: 'data scientist', location: 'Toronto, Canada' },
  { keywords: 'software engineer', location: 'Vancouver, Canada' },

  // === EUROPE TECH HUBS ===
  { keywords: 'software engineer', location: 'London, United Kingdom' },
  { keywords: 'data scientist', location: 'London, United Kingdom' },
  { keywords: 'product manager', location: 'London, United Kingdom' },
  { keywords: 'machine learning', location: 'London, United Kingdom' },
  { keywords: 'software engineer', location: 'Berlin, Germany' },
  { keywords: 'backend developer', location: 'Berlin, Germany' },
  { keywords: 'data engineer', location: 'Berlin, Germany' },
  { keywords: 'software engineer', location: 'Amsterdam, Netherlands' },
  { keywords: 'frontend developer', location: 'Amsterdam, Netherlands' },
  { keywords: 'software engineer', location: 'Paris, France' },
  { keywords: 'data scientist', location: 'Paris, France' },
  { keywords: 'software engineer', location: 'Dublin, Ireland' },
  { keywords: 'SRE', location: 'Dublin, Ireland' },
  { keywords: 'software engineer', location: 'Stockholm, Sweden' },
  { keywords: 'game developer', location: 'Stockholm, Sweden' },
  { keywords: 'software engineer', location: 'Zurich, Switzerland' },
  { keywords: 'machine learning', location: 'Zurich, Switzerland' },

  // === ASIA / PACIFIC TECH HUBS ===
  { keywords: 'software engineer', location: 'Singapore' },
  { keywords: 'data scientist', location: 'Singapore' },
  { keywords: 'cybersecurity', location: 'Singapore' },
  { keywords: 'software engineer', location: 'Sydney, Australia' },
  { keywords: 'full stack developer', location: 'Sydney, Australia' },
  { keywords: 'software engineer', location: 'Tokyo, Japan' },
  { keywords: 'AI engineer', location: 'Tokyo, Japan' },
  { keywords: 'software engineer', location: 'Bengaluru, India' },
  { keywords: 'backend developer', location: 'Bengaluru, India' },
  { keywords: 'data engineer', location: 'Bengaluru, India' },

  // === MIDDLE EAST / AFRICA ===
  { keywords: 'software engineer', location: 'Dubai, UAE' },
  { keywords: 'blockchain developer', location: 'Dubai, UAE' },
  { keywords: 'software engineer', location: 'Tel Aviv, Israel' },
  { keywords: 'cybersecurity', location: 'Tel Aviv, Israel' },

  // === EMERGING AI & DATA ROLES (Global search) ===
  { keywords: 'large language models', location: 'worldwide' },
  { keywords: 'generative ai', location: 'worldwide' },
  { keywords: 'prompt engineer', location: 'worldwide' },
  { keywords: 'nlp engineer', location: 'worldwide' },
  { keywords: 'computer vision', location: 'worldwide' },
  { keywords: 'AI research scientist', location: 'worldwide' }
];

function parseLinkedInHTML(html) {
  const jobs = [];
  // Split into individual job cards
  const cardPattern = /data-entity-urn="urn:li:jobPosting:(\d+)"[\s\S]*?<\/li>/g;
  let match;
  while ((match = cardPattern.exec(html)) !== null) {
    const card = match[0];
    const jobId = match[1];

    // Extract title
    const titleMatch = card.match(/base-search-card__title">\s*\n?\s*(.+?)\s*\n/);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Extract company
    const companyMatch = card.match(/hidden-nested-link[^>]*>([^<]+)</);
    const company = companyMatch ? companyMatch[1].replace(/\s+/g, ' ').trim() : null;

    // Extract location
    const locationMatch = card.match(/job-search-card__location">\s*([^<]+)/);
    const location = locationMatch ? locationMatch[1].trim() : null;

    // Extract URL
    const urlMatch = card.match(/href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^"?]+)/);
    const url = urlMatch ? urlMatch[1] : null;

    // Extract date
    const dateMatch = card.match(/datetime="([^"]+)"/);
    const date = dateMatch ? dateMatch[1] : null;

    // Extract company logo
    const logoMatch = card.match(/data-delayed-url="(https:\/\/media\.licdn\.com\/[^"]+)"/);
    const logo = logoMatch ? logoMatch[1].replace(/&amp;/g, '&') : null;

    if (title && company && url) {
      jobs.push({ jobId, title, company, location, url, date, logo });
    }
  }
  return jobs;
}

async function fetchLinkedIn() {
  console.log('\n── LinkedIn (public guest) ──');
  const allJobs = [];
  let queryCount = 0;
  let consecutiveFailures = 0;

  const USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  ];

  for (const query of LINKEDIN_QUERIES) {
    if (consecutiveFailures >= 3) {
      console.log('  ⚠️ Too many failures, stopping LinkedIn scrape');
      break;
    }

    // Fetch up to 16 pages per query (start=0,25,50...375 → ~400 jobs per keyword/location)
    for (let start = 0; start < 400; start += 25) {
      try {
        const params = new URLSearchParams({
          keywords: query.keywords,
          location: query.location,
          start: String(start),
          f_TPR: 'r604800', // Last 7 days
        });

        const ua = USER_AGENTS[queryCount % USER_AGENTS.length];
        const res = await fetch(
          `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${params}`,
          {
            headers: {
              'User-Agent': ua,
              'Accept': 'text/html',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          }
        );

        if (!res.ok) {
          if (res.status === 429) {
            console.log(`  ⚠️ Rate limited at query ${queryCount}, waiting 30s...`);
            await sleep(30000);
            consecutiveFailures++;
            continue;
          }
          consecutiveFailures++;
          continue;
        }

        const html = await res.text();
        const parsed = parseLinkedInHTML(html);
        consecutiveFailures = 0; // Reset on success

        if (parsed.length === 0) break; // No more results for this query

        const jobs = parsed.map(j => ({
          source: 'linkedin',
          external_id: `linkedin_${j.jobId}`,
          dedup_hash: dedupHash(j.company, j.title),
          title: j.title,
          company: j.company,
          company_logo: j.logo || null,
          location: j.location || query.location,
          job_type: null,
          salary: null,
          description: '', // Guest endpoint doesn't include full descriptions
          tags: extractTags(j.title),
          apply_url: j.url,
          category: null,
          published_at: j.date || null,
        }));

        allJobs.push(...jobs);
        queryCount++;

        // Be respectful: 2-3 second delay between requests
        await sleep(2000 + Math.random() * 1000);
      } catch (e) {
        console.error(`  ❌ LinkedIn ${query.keywords}/${query.location}/s${start}: ${e.message}`);
        consecutiveFailures++;
      }
    }
  }

  const seen = new Set();
  const unique = allJobs.filter(j => {
    if (seen.has(j.dedup_hash)) return false;
    seen.add(j.dedup_hash);
    return true;
  });

  console.log(`  Total: ${unique.length} unique jobs from LinkedIn (${allJobs.length} raw, ${queryCount} requests)`);
  return unique;
}

// ─── Cleanup: remove jobs older than 30 days ───
async function cleanupOldJobs() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/jobs?synced_at=lt.${cutoff}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
    }
  );
  if (res.ok) {
    const deleted = await res.json();
    console.log(`\n🗑️ Cleaned up ${deleted.length} jobs older than 30 days`);
  }
}

// ─── Main ───
async function main() {
  console.log('🚀 Jobs Sync — Starting');
  const startTime = Date.now();

  // ── PHASE 1: High-value sources (parallel, 50 concurrent each) ──
  console.log('\n═══ Phase 1: Core sources ═══');
  const [remoteok, remotive, wwr, himalayas, jobicy, greenhouse, ashby, workable, lever, smartrecruiters, workday] = await Promise.all([
    fetchRemoteOK(),
    fetchRemotive(),
    fetchWeWorkRemotely(),
    fetchHimalayas(),
    fetchJobicy(),
    fetchGreenhouse(),
    fetchAshby(),
    fetchWorkable(),
    fetchLever(),
    fetchSmartRecruiters(),
    fetchWorkday(),
  ]);

  const phase1Jobs = [...remoteok, ...remotive, ...wwr, ...himalayas, ...jobicy, ...greenhouse, ...ashby, ...workable, ...lever, ...smartrecruiters, ...workday];
  console.log(`\n📊 Phase 1 collected: ${phase1Jobs.length} jobs`);

  // Process and upsert Phase 1 immediately
  const phase1Valid = filterAndNormalize(phase1Jobs);
  if (phase1Valid.length > 0) {
    const { inserted, skipped } = await supabaseUpsert(phase1Valid);
    console.log(`✅ Phase 1: Inserted ${inserted}, Skipped ${skipped}`);
  }

  // ── PHASE 2: BambooHR, Personio, Breezy ──
  console.log('\n═══ Phase 2: BambooHR & Others ═══');
  await sleep(5000); // Let sockets fully drain
  const bamboohr = await fetchBambooHR();
  const personio = await fetchPersonio();
  const breezy = await fetchBreezy();
  const phase2Jobs = [...bamboohr, ...personio, ...breezy];
  console.log(`📊 Phase 2 collected: ${phase2Jobs.length} jobs`);

  const phase2Valid = filterAndNormalize(phase2Jobs);
  if (phase2Valid.length > 0) {
    const { inserted, skipped } = await supabaseUpsert(phase2Valid);
    console.log(`✅ Phase 2: Inserted ${inserted}, Skipped ${skipped}`);
  }

  // ── PHASE 3: Aggregator APIs (6 sources — millions of jobs) ──
  console.log('\n═══ Phase 3: Aggregator APIs ═══');
  await sleep(2000);

  // Group A: Jooble + Adzuna + JSearch (lightweight, fast)
  const [jooble, adzuna, jsearch] = await Promise.all([
    fetchJooble(),
    fetchAdzuna(),
    fetchJSearch(),
  ]);

  // Group B: Careerjet + Findwork (heavier, more pages)
  await sleep(1000);
  const [careerjet, findwork] = await Promise.all([
    fetchCareerjet(),
    fetchFindwork(),
  ]);

  // Group C: LinkedIn (HTML scraping, needs deliberate pacing)
  await sleep(1000);
  const linkedin = await fetchLinkedIn();

  const phase3Jobs = [...jooble, ...adzuna, ...jsearch, ...careerjet, ...findwork, ...linkedin];
  console.log(`📊 Phase 3 collected: ${phase3Jobs.length} jobs from 6 aggregators`);

  const phase3Valid = filterAndNormalize(phase3Jobs);
  if (phase3Valid.length > 0) {
    const { inserted, skipped } = await supabaseUpsert(phase3Valid);
    console.log(`✅ Phase 3: Inserted ${inserted}, Skipped ${skipped}`);
  }

  // Cleanup old jobs
  await cleanupOldJobs();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🏁 Done in ${elapsed}s — Total: ${phase1Jobs.length + phase2Jobs.length + phase3Jobs.length} jobs processed`);
}

// ── Shared filter/normalize logic ──
function filterAndNormalize(allJobs) {
  const BLOCKED_COMPANIES = ['impuls hrk'];
  const BLOCKED_TITLE_WORDS = ['(m/w/d)', 'm/w/d', 'w/m/d', 'entwickler', 'mitarbeiter', 'gesucht', 'du liebst', 'werde unser', 'praktikum'];

  const validJobs = allJobs.filter(j => {
    if (!j.title || !j.company || !j.apply_url) return false;
    if (j.company.includes('...') || j.company.length <= 2) return false;
    if (BLOCKED_COMPANIES.includes(j.company.toLowerCase().trim())) return false;
    const lowerTitle = j.title.toLowerCase();
    if (BLOCKED_TITLE_WORDS.some(w => lowerTitle.includes(w))) return false;
    if (/^\d{5,}/.test(j.title.trim())) return false;
    if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff]/.test(j.title)) return false;
    return true;
  });
  console.log(`   Valid jobs: ${validJobs.length} (filtered ${allJobs.length - validJobs.length} bad)`);

  // Title normalization
  for (const job of validJobs) {
    let t = job.title;
    t = t.replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&nbsp;/gi, ' ');
    const match = t.match(/^(.{20,}?)\s*[\-\/]\s+.+/) || t.match(/^(.{20,}?)\s*\(.+/);
    if (match) t = match[1].trim();
    t = t.replace(/\s+/g, ' ').trim();
    job.title = t;
  }

  // Stamp synced_at
  const now = new Date().toISOString();
  for (const job of validJobs) job.synced_at = now;
  return validJobs;
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
