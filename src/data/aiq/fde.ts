import type { RoleData } from './types';

export const fdeRole: RoleData = {
  id: 'forward-deployed',
  role: 'Forward Deployed / Applied AI',
  snapshot:
    'Sits with the customer, ships the first working path, then leaves a system someone else can run. Demos that die on real PDFs do not count.',
  coreCompetencies: [
    'Discovery',
    'Thin vertical slices',
    'Evals on their data',
    'Integration',
    'Change management',
    'Handoff',
    'Scope cuts',
  ],
  questions: {
    Foundation: [
      {
        id: 'FDE-F-01',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'A customer wants "an AI on all our documents." What do you do in week one?',
        idealAnswer: {
          coreIdea:
            'Pick one job with a countable outcome. Collect 20 real examples. Do not start a platform.',
          keyPoints: [
            'Name the user and the action. "AP clerk, code this invoice" beats "knowledge assistant".',
            'Get the files they actually have. Scans, email, the cursed Excel.',
            'Write 20 input/output pairs by hand with them. That is the spec.',
            'A spike on those 20. RAG, extract, or a form. One path.',
            'A number they already care about. Hours, error rate, tickets.',
          ],
        },
        whyThisMatters: [
          'This job is scope control.',
        ],
        commonPitfalls: [
          'Standing up a vector DB in week one with no question.',
        ],
        followUps: [
          'What if they refuse to pick one workflow?',
          'How do you say no to a chatbot on the intranet?',
        ],
        redFlags: [
          'We will ingest everything first.',
        ],
        scoringRubric: {
          1: 'Deploy an agent kit.',
          3: 'Wants data, no outcome.',
          5: 'One job, 20 examples, a number.',
        },
      },
      {
        id: 'FDE-F-02',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'The POC works on the 15 PDFs they emailed you. It dies on the next 15. What now?',
        idealAnswer: {
          coreIdea:
            'You sampled the clean pile. Go sit with the ugly pile. Rebuild the eval from production, not from the demo folder.',
          keyPoints: [
            'Ask how those 15 were chosen. They were the nice ones.',
            'Add the failures to the golden set the same day.',
            'Look at file types. Image-only PDFs, 80-column tables, handwriting.',
            'Do not tune prompts only on the original 15.',
            'Reset the success number. A demo is not a baseline.',
          ],
        },
        whyThisMatters: [
          'Every FDE has been burned by the nice PDFs.',
        ],
        commonPitfalls: [
          'Asking for more nice PDFs.',
        ],
        followUps: [
          'How do you sample a random week of documents?',
          'What if legal will not let you take files offsite?',
        ],
        redFlags: [
          'The model needs more context.',
        ],
        scoringRubric: {
          1: 'Fine-tune.',
          3: 'Add failures, still no sampling plan.',
          5: 'Random production sample, new gold, new number.',
        },
      },
      {
        id: 'FDE-F-03',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'When do you tell a customer not to use an LLM?',
        idealAnswer: {
          coreIdea:
            'When the job is a rule, a join, or a form with a schema. Models are for messy language. They are a bad database.',
          keyPoints: [
            'If a SQL query answers it, write the query.',
            'If a regex on an invoice field is 99%, do not generate the field.',
            'If they need the same answer tomorrow, do not sample at temperature 0.8.',
            'If they cannot review the output, do not put a model in the write-path.',
            'Saying no is the job. A failed LLM project is worse than a boring form.',
          ],
        },
        whyThisMatters: [
          'FDEs who never say no become implementation mercenaries.',
        ],
        commonPitfalls: [
          'LLM for a dropdown.',
        ],
        followUps: [
          'How do you say no without losing the account?',
          'What is a hybrid you would offer instead?',
        ],
        redFlags: [
          'LLM for everything they asked.',
        ],
        scoringRubric: {
          1: 'Always try a model.',
          3: 'One example of a no, weak.',
          5: 'Clear no cases and a boring alternative.',
        },
      },
      {
        id: 'FDE-F-04',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'How do you write an eval when the customer cannot label 1,000 rows?',
        idealAnswer: {
          coreIdea:
            'Label 40 well, with the actual users, and make each one a full example. Depth beats a sloppy thousand.',
          keyPoints: [
            'Sit with two clerks for a morning. They already know the edge cases.',
            'Each item has input, accepted output, and a note on what would be wrong.',
            'Slice. One table-heavy, one scan, one empty field.',
            'A weekly add of 5 new failures from production.',
            'Do not buy a crowd label for a domain they will not explain.',
          ],
        },
        whyThisMatters: [
          'Real deployments never have a Kaggle set.',
        ],
        commonPitfalls: [
          'Synthetic data only.',
          'Waiting for a labeling vendor.',
        ],
        followUps: [
          'How do you use those 40 in CI?',
          'When would you add an LLM judge on top?',
        ],
        redFlags: [
          'We will know it when we see it.',
        ],
        scoringRubric: {
          1: 'Need 1,000 labels.',
          3: 'Small set, no slices.',
          5: '40 solid, sliced, growing from live fails.',
        },
      },
      {
        id: 'FDE-F-05',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'IT will not let you send documents to a public API. What are your options, in order?',
        idealAnswer: {
          coreIdea:
            'Private endpoint in their cloud, then a VPC, then on-prem or a local model. Do not argue philosophy. Ask what they already approved.',
          keyPoints: [
            'What vendor is already on their paper? Azure OpenAI, Bedrock, Vertex.',
            'Region and residency. Same country, no training on their data, in writing.',
            'If they need air-gap, pick an open-weights model they can host, and cut the task to fit.',
            'A smaller on-prem extractor plus a human may beat a giant model they cannot use.',
            'Write the constraint in the design one-pager so sales stops promising GPT-whatever.',
          ],
        },
        whyThisMatters: [
          'This is most of enterprise FDE.',
        ],
        commonPitfalls: [
          'Shadow IT with a personal API key.',
        ],
        followUps: [
          'How do you prove data is not used for training?',
          'What if their GPU quota is one T4?',
        ],
        redFlags: [
          'They will make an exception.',
        ],
        scoringRubric: {
          1: 'Use the public API anyway.',
          3: 'Names Bedrock/Azure, no residency.',
          5: 'Approved vendor, residency, on-prem fallback.',
        },
      },
      {
        id: 'FDE-F-06',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What does a good handoff look like when you leave the account?',
        idealAnswer: {
          coreIdea:
            'Someone there can rerun evals, roll back a prompt, and know who to page. A slide deck is not a handoff.',
          keyPoints: [
            'A runbook. How to deploy, how to revert, where logs live.',
            'The golden set in their repo, not yours.',
            'Owners. One engineer, one business. Names, not a DL.',
            'A recorded walkthrough of a failure you already had.',
            'Support hours for two weeks, then they own it.',
          ],
        },
        whyThisMatters: [
          'FDEs who skip this get pulled back forever.',
        ],
        commonPitfalls: [
          'Leaving a notebook and a Slack DM.',
        ],
        followUps: [
          'What if they have no engineer?',
          'How do you know the handoff worked?',
        ],
        redFlags: [
          'I stay on the account forever.',
        ],
        scoringRubric: {
          1: 'Send the repo.',
          3: 'Docs, no owner.',
          5: 'Evals, runbook, named owners, revert path.',
        },
      },
      {
        id: 'FDE-F-07',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'Sales promised a 6-week "agent." You have 6 weeks. What do you cut first?',
        idealAnswer: {
          coreIdea:
            'Cut autonomy. Keep a human in the write path. Cut extra tools. Keep one retrieval source. A reliable extract-and-review beats a flaky agent.',
          keyPoints: [
            'No email-send, no ticket-close, no payment tool in v1.',
            'One corpus. Their SharePoint dump, not five systems.',
            'A UI a clerk already lives in. Do not launch a new portal if you can avoid it.',
            'Write the cut list in the kickoff so it is not a surprise in week 5.',
            'If sales oversold, you say so early, with the smaller thing that still has a number.',
          ],
        },
        whyThisMatters: [
          'This is the political question.',
        ],
        commonPitfalls: [
          'Trying to hit the slide.',
        ],
        followUps: [
          'How do you tell the account exec?',
          'What is the smallest thing you would still call a win?',
        ],
        redFlags: [
          'We will sprint harder.',
        ],
        scoringRubric: {
          1: 'Build the agent.',
          3: 'Cuts something, no write-path restraint.',
          5: 'No autonomy, one source, a number, said early.',
        },
      },
      {
        id: 'FDE-F-08',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'How do you show progress to a skeptical ops lead who hates demos?',
        idealAnswer: {
          coreIdea:
            'Show their files, their errors, a table of 20, and a time saved on a real case. No stock PDF. No chat UI with a sparkle.',
          keyPoints: [
            'A spreadsheet. Input, model, human, agree/disagree.',
            'One live document from this morning, with them in the room.',
            'A clock. How long it took the clerk last week vs now.',
            'A list of what still fails. Trust comes from naming the misses.',
            'Skip the architecture diagram unless they ask.',
          ],
        },
        whyThisMatters: [
          'Ops leads kill projects that look like theatre.',
        ],
        commonPitfalls: [
          'A ChatGPT-looking box.',
        ],
        followUps: [
          'What if they only have 20 minutes?',
          'How do you handle a live fail in the room?',
        ],
        redFlags: [
          'The wow demo.',
        ],
        scoringRubric: {
          1: 'Slideshow.',
          3: 'A demo on their file, no table.',
          5: 'Score table, live ugly file, named failures.',
        },
      },
      {
        id: 'FDE-F-09',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What integration work usually eats the project, and how do you see it coming?',
        idealAnswer: {
          coreIdea:
            'Auth, file export, and write-back. The model is the short part. Ask on day one how a document leaves their system and how a result gets back in.',
          keyPoints: [
            'SSO, VPN, IP allowlists.',
            'Export. There is often no API. You will get a nightly zip.',
            'Write-back. Their system of record may only accept a human click.',
            'PII review. Legal can add four weeks.',
            'Put integrations on the critical path in the plan, not in a footnote.',
          ],
        },
        whyThisMatters: [
          'This is why timelines slip.',
        ],
        commonPitfalls: [
          'Assuming a REST API exists.',
        ],
        followUps: [
          'What if write-back is impossible in v1?',
          'How do you work with a nightly zip?',
        ],
        redFlags: [
          'The model is the hard part.',
        ],
        scoringRubric: {
          1: 'We will API it.',
          3: 'Names auth, misses write-back.',
          5: 'Export, write-back, legal, on the critical path.',
        },
      },
      {
        id: 'FDE-F-10',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'A clerk ignores the tool after launch. What do you check before you blame change management?',
        idealAnswer: {
          coreIdea:
            'The tool is probably slower, in the wrong window, or wrong too often. Watch them work. Do not send a training video first.',
          keyPoints: [
            'Time per case vs the old way. If it is slower, they will bounce.',
            'Alt-tab tax. If they paste between five windows, you lost.',
            'Error rate on the cases they actually get, not your gold.',
            'A silent fail. They do not know it dropped a line.',
            'Fix the path. Training is last.',
          ],
        },
        whyThisMatters: [
          'Adoption is a product problem first.',
        ],
        commonPitfalls: [
          'More enablement sessions.',
        ],
        followUps: [
          'How do you instrument "ignored"?',
          'What is an acceptable extra click?',
        ],
        redFlags: [
          'Users need to adapt.',
        ],
        scoringRubric: {
          1: 'Train them.',
          3: 'Mentions UX, no timing.',
          5: 'Time, window, live error rate, then training.',
        },
      },
    ],
    Advanced: [
      {
        id: 'FDE-A-01',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design a first-production path for invoice extraction into their ERP.',
        idealAnswer: {
          coreIdea:
            'Ingest the PDF, extract to a schema, show a review screen, write only after accept. Keep the model off the ERP credential.',
          keyPoints: [
            'Schema first. Vendor, dates, lines, tax, currency.',
            'OCR if needed, then extract. Tables are the hard part. Say so.',
            'Review UI with the PDF beside the fields, low-confidence highlighted.',
            'Write-back through their existing AP import, not a custom DB poke.',
            'Idempotency. The same invoice must not double-post.',
          ],
        },
        whyThisMatters: [
          'This is a standard FDE design.',
        ],
        commonPitfalls: [
          'Model writes straight to ERP.',
          'No idempotency.',
        ],
        followUps: [
          'How do you handle multi-page line items?',
          'What is your confidence score actually worth?',
        ],
        redFlags: [
          'Agent with an ERP tool.',
        ],
        scoringRubric: {
          1: 'Chat over PDFs.',
          3: 'Extract plus human, no write-back design.',
          5: 'Schema, review, existing import, idempotent.',
        },
      },
      {
        id: 'FDE-A-02',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '3-4 minutes',
        question: 'How do you price and staff a 12-week deployment so you do not eat the margin?',
        idealAnswer: {
          coreIdea:
            'Time-box discovery, freeze scope in writing, and staff an engineer who can do integrations, not only prompts. Change requests reopen the clock.',
          keyPoints: [
            'Week 1-2 discovery is paid and can end in a no.',
            'A written list of systems, file types, and the one workflow.',
            'One FDE plus a named customer counterpart. Not a committee.',
            'A change log. New system of record is a new SOW.',
            'Leave a week for handoff. If you skip it you will donate week 13-16.',
          ],
        },
        whyThisMatters: [
          'Senior FDE / AE pairing question.',
        ],
        commonPitfalls: [
          'Fixed price on unknown file types.',
        ],
        followUps: [
          'What is in the discovery exit slide?',
          'How do you handle a champion who leaves in week 8?',
        ],
        redFlags: [
          'We will figure out scope as we go.',
        ],
        scoringRubric: {
          1: 'Six weeks, one person, all documents.',
          3: 'Has a timeline, no change control.',
          5: 'Paid discovery, freeze, counterpart, change orders.',
        },
      },
      {
        id: 'FDE-A-03',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'The customer wants the assistant to "just use SAP." How do you design tool access?',
        idealAnswer: {
          coreIdea:
            'Narrow tools with the clerk\'s own identity, not a god key. Read first. Writes are drafts. Every call is logged as them, not as "the bot".',
          keyPoints: [
            'OAuth as the user. Permissions equal theirs.',
            'Allowlist of RFCs or BAPIs. Not "run any query".',
            'Dry-run or draft documents for writes.',
            'Human confirm on anything that moves money or inventory.',
            'If SAP access is only via UI, you may be in RPA land. Say the cost.',
          ],
        },
        whyThisMatters: [
          'Enterprise tool use. High risk.',
        ],
        commonPitfalls: [
          'A service account with SAP_ALL.',
        ],
        followUps: [
          'How do you test without touching prod SAP?',
          'What if they want the bot to work after hours as a batch?',
        ],
        redFlags: [
          'Give the agent the password.',
        ],
        scoringRubric: {
          1: 'Connect SAP.',
          3: 'Some auth, writes live.',
          5: 'User identity, allowlist, drafts, logs.',
        },
      },
      {
        id: 'FDE-A-04',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you run a red team on a customer assistant two weeks before go-live?',
        idealAnswer: {
          coreIdea:
            'Use their documents and their enemies. Prompt injection in a PDF, a request to email a file out, a request for another employee\'s data. Write the fails into the eval.',
          keyPoints: [
            'Plant an instruction in a document. See if the assistant obeys it.',
            'Ask for data the user should not see. Tenant isolation.',
            'Ask it to take an irreversible action.',
            'A fixed script so you can rerun after each fix.',
            'A go/no-go. Some fails block launch. Some become backlog.',
          ],
        },
        whyThisMatters: [
          'FDE owns the last-mile safety, not only the lab.',
        ],
        commonPitfalls: [
          'A generic jailbreak list from Twitter.',
        ],
        followUps: [
          'What is an automatic block vs a warning?',
          'Who signs the go-live?',
        ],
        redFlags: [
          'The system prompt says be safe.',
        ],
        scoringRubric: {
          1: 'No time for that.',
          3: 'Some jailbreaks, no planted doc.',
          5: 'Theirs files, isolation, irreversible actions, go/no-go.',
        },
      },
      {
        id: 'FDE-A-05',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design logging that legal will allow and that you can still debug.',
        idealAnswer: {
          coreIdea:
            'Log hashes, ids, model version, and a redacted prompt. Keep raw text in a shorter, hotter store with a role gate. You cannot debug with nothing. You cannot keep everything.',
          keyPoints: [
            'Always. Request id, user id, model, prompt version, token counts, latency, tool names.',
            'Raw text. 14-30 days, access-controlled, if they agree.',
            'Redaction on the way in. Do not log secrets you already detect.',
            'A replay tool that works on the redacted form when you can.',
            'Write this in the DPA conversation, not after the first incident.',
          ],
        },
        whyThisMatters: [
          'Supportability vs privacy. Real tension.',
        ],
        commonPitfalls: [
          'Log nothing.',
          'Log everything forever.',
        ],
        followUps: [
          'How do you debug a hallucination from last quarter?',
          'What if they are in a no-log region?',
        ],
        redFlags: [
          'Full prompts in a shared Slack channel.',
        ],
        scoringRubric: {
          1: 'Console.log the prompt.',
          3: 'Some ids, no policy.',
          5: 'Metadata always, raw gated and timed, in the contract.',
        },
      },
      {
        id: 'FDE-A-06',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'The champion loves it. The union / works council / risk committee has not seen it. What do you do?',
        idealAnswer: {
          coreIdea:
            'Stop the quiet rollout. Put the workflow, the human role, and the data map in front of them. A stealth launch will get undone.',
          keyPoints: [
            'A one-pager. Who uses it, what it reads, what it may write, who reviews.',
            'Offer a pilot group they pick, not you.',
            'No performance scoring of staff with the tool in v1 unless that is already the deal.',
            'Bring your customer champion, do not go around them.',
            'Time. This can be the real critical path. Put it on the plan.',
          ],
        },
        whyThisMatters: [
          'EU and large enterprises. This kills timelines.',
        ],
        commonPitfalls: [
          'Ship to a friendly team and hope.',
        ],
        followUps: [
          'What if the champion wants to hide it?',
          'What do you refuse to put in the tool?',
        ],
        redFlags: [
          'Easier to ask forgiveness.',
        ],
        scoringRubric: {
          1: 'Launch quietly.',
          3: 'Mentions legal, no staff angle.',
          5: 'Stops, documents, their pilot, no stealth scoring.',
        },
      },
      {
        id: 'FDE-A-07',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you decide the project failed and you should walk?',
        idealAnswer: {
          coreIdea:
            'If the number did not move after a fair eval, or they will not give you files and an owner, you write it down and leave. Dragging it out wastes both sides.',
          keyPoints: [
            'A pre-agreed kill. "If accuracy is under X on the random 40, we stop."',
            'No owner after two weeks is a kill.',
            'A moving workflow every sprint is a kill.',
            'Tell them what would make you come back. A new owner, a narrower job.',
            'Do it in person with the champion, not only in an email to sales.',
          ],
        },
        whyThisMatters: [
          'Senior FDE judgment.',
        ],
        commonPitfalls: [
          'Hope in week 11.',
        ],
        followUps: [
          'How do you protect the relationship?',
          'What do you hand them on the way out?',
        ],
        redFlags: [
          'We never fail, we iterate.',
        ],
        scoringRubric: {
          1: 'Keep going.',
          3: 'Would stop, no pre-agreed bar.',
          5: 'Written kill, owner, narrower return path.',
        },
      },
      {
        id: 'FDE-A-08',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design a multi-tenant prototype that will not leak tenant A\'s files to tenant B when this becomes a product.',
        idealAnswer: {
          coreIdea:
            'Tenant id on every row, every vector, every log. Filters in the query path, not as a prompt instruction. Test with a planted document.',
          keyPoints: [
            'Separate indexes or a mandatory tenant filter you cannot forget.',
            'AuthZ at the tool, not in the system prompt.',
            'The planted-doc test in CI. Tenant B asks for the secret string.',
            'No shared few-shot pool that contains real customer text.',
            'If you started as a single-tenant POC, say what you must rebuild. Do not paper over it.',
          ],
        },
        whyThisMatters: [
          'POC to product is where leaks happen.',
        ],
        commonPitfalls: [
          '"You are tenant B, do not look at A" in the prompt.',
        ],
        followUps: [
          'Shared model vs per-tenant model?',
          'How do you delete a tenant?',
        ],
        redFlags: [
          'Metadata filter we remember to add.',
        ],
        scoringRubric: {
          1: 'Prompt isolation.',
          3: 'Filter, no planted test.',
          5: 'Hard isolation, CI leak test, delete path.',
        },
      },
    ],
  },
};
