import type { RoleData } from './types';

export const emRole: RoleData = {
  id: 'ai-eng-manager',
  role: 'AI Engineering Manager',
  snapshot:
    'Hires the people, picks the bets, and kills the ones that are a demo. You will be asked about evals, cost, and a failed launch.',
  coreCompetencies: [
    'Hiring loops',
    'Eval culture',
    'Build vs buy',
    'On-call for models',
    'Roadmaps',
    'Risk',
    'Vendor lock-in',
  ],
  questions: {
    Foundation: [
      {
        id: 'EM-F-01',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'What do you look for in a first AI engineer hire when the company has no evals yet?',
        idealAnswer: {
          coreIdea:
            'Someone who has shipped a measured loop, not a weekend agent. Ask them to walk a failure and the number they used to decide.',
          keyPoints: [
            'They can describe a golden set they owned.',
            'They have been on-call for a model, or at least a pipeline.',
            'They can say no to a chatbot.',
            'A take-home that asks them to break a bad RAG demo is better than leetcode only.',
            'Avoid the person who only talks frameworks.',
          ],
        },
        whyThisMatters: [
          'First hire sets the culture.',
        ],
        commonPitfalls: [
          'Hiring the best Kaggle rank.',
          'Hiring a prompt influencer.',
        ],
        followUps: [
          'What is the take-home?',
          'How do you test product sense?',
        ],
        redFlags: [
          'I hire whoever has LangGraph on the CV.',
        ],
        scoringRubric: {
          1: 'Python plus OpenAI.',
          3: 'Wants shipping experience, no eval talk.',
          5: 'Measured loop, on-call, a concrete screen.',
        },
      },
      {
        id: 'EM-F-02',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'How do you decide build vs buy for a RAG feature?',
        idealAnswer: {
          coreIdea:
            'Buy the undifferentiated plumbing if the corpus is ordinary. Build when the retrieval quality is the product or the data cannot leave.',
          keyPoints: [
            'If it is "search our help center", a vendor is fine.',
            'If ranking quality is the company, you own the index and the eval.',
            'Residency and lock-in. Leaving a vendor with your chunks is a project.',
            'Cost at 10x traffic, not at the POC.',
            'A 2-week bake-off with your golden set. Not a feature matrix.',
          ],
        },
        whyThisMatters: [
          'Managers waste a year here.',
        ],
        commonPitfalls: [
          'Build because the team wants to.',
          'Buy because a VP saw a demo.',
        ],
        followUps: [
          'What is in the bake-off scorecard?',
          'When do you replace a vendor you already signed?',
        ],
        redFlags: [
          'We always build.',
        ],
        scoringRubric: {
          1: 'Whichever is faster.',
          3: 'Names lock-in, no bake-off.',
          5: 'Product-critical vs plumbing, bake-off on gold.',
        },
      },
      {
        id: 'EM-F-03',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'Your team wants two weeks to "try agents." What do you require before you say yes?',
        idealAnswer: {
          coreIdea:
            'A task, a success number, a max dollar spend, and a written "if it fails we do X instead." A sandbox with no metric is a holiday.',
          keyPoints: [
            'One user job, not a platform.',
            'A 30-example gold set before they write a graph.',
            'A spend cap. Agents burn tokens for fun.',
            'A comparison to a non-agent baseline.',
            'A kill date.',
          ],
        },
        whyThisMatters: [
          'This is 2025-2026 management.',
        ],
        commonPitfalls: [
          'Let them explore.',
        ],
        followUps: [
          'What if they come back with a demo and no number?',
          'How do you keep them from rewriting prod?',
        ],
        redFlags: [
          'Innovation time.',
        ],
        scoringRubric: {
          1: 'Sure, try it.',
          3: 'Wants a demo.',
          5: 'Gold, cap, baseline, kill date.',
        },
      },
      {
        id: 'EM-F-04',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What belongs on an AI team\'s weekly dashboard?',
        idealAnswer: {
          coreIdea:
            'Quality on a fixed set, live failure rate, latency, cost per successful task, and one product number. Loss curves are not a product dashboard.',
          keyPoints: [
            'Golden-set pass rate by slice.',
            'User-visible fail rate or thumbs-down.',
            'p95 latency and a timeout rate.',
            'Dollars per 1k successful jobs, not just tokens.',
            'A product metric. Tickets closed, hours saved, conversion.',
          ],
        },
        whyThisMatters: [
          'What you measure is what they grind.',
        ],
        commonPitfalls: [
          'Only token spend.',
          'Only a vibe channel.',
        ],
        followUps: [
          'How often do you refresh the gold set?',
          'Who is allowed to change the ship gate?',
        ],
        redFlags: [
          'We watch Slack reactions.',
        ],
        scoringRubric: {
          1: 'GPU util.',
          3: 'Cost and latency, no quality.',
          5: 'Gold, live fails, latency, cost/success, product.',
        },
      },
      {
        id: 'EM-F-05',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'A model vendor has an outage during your peak hour. What should already exist?',
        idealAnswer: {
          coreIdea:
            'A fallback model or a degraded path that was tested, plus a status line in the product. Not a war room inventing a plan.',
          keyPoints: [
            'A second provider or a smaller local model for the critical path.',
            'Feature flags to disable the fancy path.',
            'Cached answers for head traffic if that is honest.',
            'A runbook. Who declares the incident.',
            'You have failed over in a drill. Untested fallbacks do not exist.',
          ],
        },
        whyThisMatters: [
          'Managers own readiness.',
        ],
        commonPitfalls: [
          'Refresh the page.',
        ],
        followUps: [
          'How do you keep the fallback from rotting?',
          'What do you tell customers in-product?',
        ],
        redFlags: [
          'We are on the best model, it will be fine.',
        ],
        scoringRubric: {
          1: 'Wait it out.',
          3: 'Has a second key, never tested.',
          5: 'Tested failover, flag, customer message.',
        },
      },
      {
        id: 'EM-F-06',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'How do you review an AI PR that is mostly a prompt change?',
        idealAnswer: {
          coreIdea:
            'The prompt is code. You want a diff, a version, and the eval delta. "Trust me, it is better" is not a review.',
          keyPoints: [
            'Prompt lives in git, not in a UI only.',
            'Before/after on the golden set, including slices that usually break.',
            'A note on cost and latency if the prompt got longer.',
            'Safety cases if the surface is user-facing.',
            'Reject if they tuned on the gold set until it passed.',
          ],
        },
        whyThisMatters: [
          'This is the new code review.',
        ],
        commonPitfalls: [
          'Rubber-stamping prompt PRs.',
        ],
        followUps: [
          'Where do you store few-shot examples?',
          'How do you stop gold-set overfitting?',
        ],
        redFlags: [
          'Prompts in the OpenAI dashboard.',
        ],
        scoringRubric: {
          1: 'Looks good.',
          3: 'Wants a sample, no suite.',
          5: 'Diff, eval delta, cost, no gold hacking.',
        },
      },
      {
        id: 'EM-F-07',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'Legal asks if customer prompts are used to train the vendor model. What do you owe them?',
        idealAnswer: {
          coreIdea:
            'A written answer from the vendor, per product tier, plus how you configured it. "I think they do not" is not an answer.',
          keyPoints: [
            'Enterprise tiers often default to no training. Check the contract, not the blog.',
            'Your own logs and fine-tunes are a separate question.',
            'A data map. What leaves, where it sits, how long.',
            'A way to delete. You will be asked.',
            'If you cannot get this in writing, you do not put regulated data there.',
          ],
        },
        whyThisMatters: [
          'Managers get this email every month.',
        ],
        commonPitfalls: [
          'Forwarding a tweet from the vendor.',
        ],
        followUps: [
          'What if the vendor changes the default?',
          'How do you handle subprocessors?',
        ],
        redFlags: [
          'They are a big company, it is fine.',
        ],
        scoringRubric: {
          1: 'I do not think they train.',
          3: 'Mentions enterprise tier, no contract.',
          5: 'Contract, config, map, delete, or no deal.',
        },
      },
      {
        id: 'EM-F-08',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'How do you set on-call for a team that owns a model API?',
        idealAnswer: {
          coreIdea:
            'Same as any service, plus quality pages. A silent 200 that answers nonsense is an incident.',
          keyPoints: [
            'Pages on latency, 5xx, spend spikes, and a quality canary.',
            'A canary of 10 gold prompts every minute. Alert if they flip.',
            'A rollback that a tired person can run.',
            'Vendor status in the runbook.',
            'Do not page on every thumbs-down. Aggregate.',
          ],
        },
        whyThisMatters: [
          'Models fail without throwing.',
        ],
        commonPitfalls: [
          'Only infra pages.',
        ],
        followUps: [
          'What is a quality canary for a chat product?',
          'How do you avoid paging on a known-bad vendor hour?',
        ],
        redFlags: [
          'We will see it on Twitter.',
        ],
        scoringRubric: {
          1: 'No on-call, it is just an API.',
          3: 'Infra pages only.',
          5: 'Infra plus canary quality plus rollback.',
        },
      },
      {
        id: 'EM-F-09',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'A PM wants a public agent that can refund orders. What is your default answer?',
        idealAnswer: {
          coreIdea:
            'No unsupervised refunds. A draft plus a human, or a tight rule engine with a tiny model on the side. Money-moving tools need a different bar.',
          keyPoints: [
            'Allowlist. Amount cap, order age, reason codes.',
            'Human confirm above a small cap.',
            'Audit log that finance will accept.',
            'A rate limit per account. Agents get prompt-injected.',
            'If they insist on autonomy, they sign the loss budget.',
          ],
        },
        whyThisMatters: [
          'Managers are the last gate.',
        ],
        commonPitfalls: [
          'The model is careful.',
        ],
        followUps: [
          'What cap would you allow unsupervised?',
          'How do you test injection on this tool?',
        ],
        redFlags: [
          'Let the agent be helpful.',
        ],
        scoringRubric: {
          1: 'Build it.',
          3: 'Wants a human, no cap story.',
          5: 'Caps, confirm, audit, signed loss if they push.',
        },
      },
      {
        id: 'EM-F-10',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'How do you talk about model risk with a board that only knows ChatGPT?',
        idealAnswer: {
          coreIdea:
            'Three buckets. It can be wrong, it can leak, it can run up a bill. Give one story each from your product, and what you already do.',
          keyPoints: [
            'Wrong. Hallucination rate on the gold set, human review where it writes.',
            'Leak. Tenancy tests, no training clause.',
            'Bill. Caps, cache, a cheaper default model.',
            'Skip architecture. They will ask if customers can sue.',
            'Bring the kill switch. They want to know you can turn it off.',
          ],
        },
        whyThisMatters: [
          'EM interviews at later-stage companies.',
        ],
        commonPitfalls: [
          'A transformer lecture.',
        ],
        followUps: [
          'What if a journalist finds a leak?',
          'How often do you update them?',
        ],
        redFlags: [
          'The model is aligned.',
        ],
        scoringRubric: {
          1: 'It is like a junior employee.',
          3: 'Names hallucination, no leak or bill.',
          5: 'Wrong / leak / bill, with a switch.',
        },
      },
    ],
    Advanced: [
      {
        id: 'EM-A-01',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design the org for a company adding AI to three existing products this year.',
        idealAnswer: {
          coreIdea:
            'A small platform team for auth, eval harness, gateway, and vendor contracts. Embedded engineers in each product. Do not make a 20-person "AI org" that takes tickets.',
          keyPoints: [
            'Platform. Gateway, logging, eval CI, prompt registry, approved models.',
            'Product pairs. One AI-fluent engineer plus the existing PM.',
            'A shared weekly review of gold-set diffs so they do not fork culture.',
            'Hiring into products first if you can only hire two people.',
            'A staff+ person who can say no to a fourth vendor.',
          ],
        },
        whyThisMatters: [
          'Org design is the senior EM round.',
        ],
        commonPitfalls: [
          'Central AI team as a bottleneck.',
          'No platform, five vendors.',
        ],
        followUps: [
          'Where does research sit?',
          'How do you stop every team from training a model?',
        ],
        redFlags: [
          'Stand up an AI department.',
        ],
        scoringRubric: {
          1: 'One big team.',
          3: 'Embeds, no platform.',
          5: 'Thin platform, embeds, shared eval culture.',
        },
      },
      {
        id: 'EM-A-02',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '3-4 minutes',
        question: 'A launch made NPS dip and support volume jump. Walk the first 48 hours.',
        idealAnswer: {
          coreIdea:
            'Turn the feature off or throttle it, read 50 real transcripts, find the slice, then decide revert vs patch. Do not start a fine-tune.',
          keyPoints: [
            'Flag off for the worst slice if you can isolate it.',
            'Read tickets. Cluster them. One failure mode is likely.',
            'Check a prompt or retrieval change from the last release.',
            'A public-facing status if users are blocked.',
            'A postmortem with the eval that missed it, and that case added to gold.',
          ],
        },
        whyThisMatters: [
          'Incident leadership.',
        ],
        commonPitfalls: [
          'Ship a new prompt every hour with no gold.',
        ],
        followUps: [
          'When do you keep it on for power users?',
          'How do you compensate support?',
        ],
        redFlags: [
          'The model will adapt.',
        ],
        scoringRubric: {
          1: 'Add more prompt text.',
          3: 'Would look at tickets, no throttle.',
          5: 'Throttle, cluster, revert/patch, gold update.',
        },
      },
      {
        id: 'EM-A-03',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'How do you budget tokens for a year when usage is still climbing 20% a month?',
        idealAnswer: {
          coreIdea:
            'Forecast on successful tasks, not raw tokens. Put in cache, routing, and a cheaper default. Buy committed use only on the floor you trust.',
          keyPoints: [
            'Unit. Dollars per successful task, by product.',
            'A cheap model for easy traffic. A dear model for the hard slice.',
            'Prompt cache and retrieval cache as first-class projects.',
            'Committed spend on the floor. On-demand for the spike.',
            'A kill if a feature\'s unit cost does not fall by a date.',
          ],
        },
        whyThisMatters: [
          'Finance will ask. "GPUs" is not an answer.',
        ],
        commonPitfalls: [
          'Linear extraoplation of last month\'s bill.',
        ],
        followUps: [
          'How do you charge customers for this?',
          'When do you move to self-host?',
        ],
        redFlags: [
          'We will optimize later.',
        ],
        scoringRubric: {
          1: 'Ask finance for more.',
          3: 'Wants a cheaper model, no unit.',
          5: 'Unit cost, routing, commit the floor, kill unprofitable.',
        },
      },
      {
        id: 'EM-A-04',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you run a promotion packet for an engineer whose work is prompts and evals, not services?',
        idealAnswer: {
          coreIdea:
            'Impact is a measured quality or cost change, plus the harness other people use. Lines of Python are the wrong unit.',
          keyPoints: [
            'Before/after on a ship gate they own.',
            'Adoption. Did two other teams use their eval or registry?',
            'Incidents they prevented or cleaned up.',
            'Writing. A design that stopped a bad project.',
            'Calibrate with a peer manager who has shipped ML, not only backend.',
          ],
        },
        whyThisMatters: [
          'AI ICs get stuck at mid-level without this.',
        ],
        commonPitfalls: [
          'They only changed text files.',
        ],
        followUps: [
          'What is staff-level AI work?',
          'How do you stop prompt-only work from being invisible?',
        ],
        redFlags: [
          'They need to own a microservice to get promoted.',
        ],
        scoringRubric: {
          1: 'Not real engineering.',
          3: 'Wants impact, no harness.',
          5: 'Measured delta, shared tools, incidents, writing.',
        },
      },
      {
        id: 'EM-A-05',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '3-4 minutes',
        question: 'Your company wants to fine-tune. You suspect RAG would do. How do you force the decision?',
        idealAnswer: {
          coreIdea:
            'A two-week bake-off on the same gold set. RAG, prompt, then a small SFT if those lose. Fine-tune is the expensive third try, not the identity.',
          keyPoints: [
            'Same 100-200 examples for all three.',
            'Cost and latency on the table, not only quality.',
            'Ops cost of a checkpoint. Who retrains, who evals.',
            'A written rule. If RAG is within X of SFT, we do not train.',
            'Watch for people who want to fine-tune to own a model.',
          ],
        },
        whyThisMatters: [
          'Classic portfolio decision.',
        ],
        commonPitfalls: [
          'Fine-tune because a researcher joined.',
        ],
        followUps: [
          'What if the data is not in documents, it is style?',
          'How do you keep the bake-off honest?',
        ],
        redFlags: [
          'We need our own model.',
        ],
        scoringRubric: {
          1: 'Let them train.',
          3: 'Prefers RAG, no bake-off.',
          5: 'Same gold, cost in, written rule.',
        },
      },
      {
        id: 'EM-A-06',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design a model access policy for 400 employees who all want an API key.',
        idealAnswer: {
          coreIdea:
            'One gateway, SSO, per-team keys, budgets, and logging. No personal keys in .env on laptops for company data.',
          keyPoints: [
            'SSO into an internal gateway. Teams get quotas.',
            'Approved models list. Shadow IT to random vendors is a fire.',
            'DLP or a warning on paste of secrets.',
            'A cheap default. GPT-class only when a flag is on.',
            'A quarterly access review. Interns should not still have prod.',
          ],
        },
        whyThisMatters: [
          'This is how bills and leaks start.',
        ],
        commonPitfalls: [
          'A shared Slack bot with the org key.',
        ],
        followUps: [
          'What about contractors?',
          'How do you handle open-source local models on laptops?',
        ],
        redFlags: [
          'Everyone uses ChatGPT Plus on the corporate card.',
        ],
        scoringRubric: {
          1: 'Share the key.',
          3: 'Wants a gateway, no budget.',
          5: 'SSO gateway, quotas, approved list, review.',
        },
      },
      {
        id: 'EM-A-07',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'A senior engineer wants to rewrite the stack in a new agent framework. How do you decide?',
        idealAnswer: {
          coreIdea:
            'Ask what bug the current stack cannot fix. If the answer is taste, no. If the answer is checkpoints, human gates, or tracing you cannot add, time-box a port of one path.',
          keyPoints: [
            'A written gap. Not "LangGraph is the future".',
            'Port one workflow, keep the eval.',
            'Migration cost vs the next two quarters of product.',
            'Frameworks die. Prefer thin wrappers around the vendor APIs.',
            'If you say no, offer the extension point they actually need.',
          ],
        },
        whyThisMatters: [
          'Rewrites kill roadmaps.',
        ],
        commonPitfalls: [
          'Yes to keep them happy.',
          'No forever, no extension.',
        ],
        followUps: [
          'How do you keep the old stack from rotting if you say no?',
          'What is a thin enough wrapper?',
        ],
        redFlags: [
          'We should be on the new thing.',
        ],
        scoringRubric: {
          1: 'Whatever they want.',
          3: 'Skeptical, no path.',
          5: 'Gap, one-path port, eval held constant.',
        },
      },
      {
        id: 'EM-A-08',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you know the AI program is working at company level, six months in?',
        idealAnswer: {
          coreIdea:
            'Two or three product numbers that moved, a cost that is understood, and fewer heroics. A slide of POCs is a fail.',
          keyPoints: [
            'Shipped features with a baseline and a current number.',
            'Killed work. A healthy program stops things.',
            'On-call is quiet enough that people stay.',
            'Other teams can ship on the platform without a special squad.',
            'Finance can forecast the bill within a range you named.',
          ],
        },
        whyThisMatters: [
          'This is the exec review.',
        ],
        commonPitfalls: [
          'Counting prototypes.',
          'Counting models trained.',
        ],
        followUps: [
          'What would make you shut the program down?',
          'How do you credit product teams vs the platform?',
        ],
        redFlags: [
          'We launched 12 copilots.',
        ],
        scoringRubric: {
          1: 'Number of demos.',
          3: 'Some usage, no kill or forecast.',
          5: 'Product deltas, kills, quiet ops, forecastable cost.',
        },
      },
    ],
  },
};
