import type { RoleData } from './types';

export const searchRole: RoleData = {
  id: 'search-ranking',
  role: 'Search, Ranking & Recommendations',
  snapshot:
    'Puts the right item near the top. Retrieval, ranking, position bias, and why your nDCG went up while revenue went down.',
  coreCompetencies: [
    'BM25 and hybrid',
    'Learning to rank',
    'Position bias',
    'ANN indexes',
    'nDCG / recall@k',
    'Exploration',
    'Cold start',
  ],
  questions: {
    Foundation: [
      {
        id: 'SRCH-F-01',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What does BM25 actually reward, and when does it lose to a vector?',
        idealAnswer: {
          coreIdea:
            'BM25 likes rare terms that appear in the doc, with a saturation so "the" does not win. It loses when the query and the doc share no words.',
          keyPoints: [
            'IDF. Rare terms count more.',
            'TF saturation. The 20th "loan" barely helps.',
            'Length norm. Long docs do not automatically win.',
            'A vector wins on paraphrase and synonyms. BM25 wins on SKUs, error codes, names.',
            'Hybrid is the default for site search. Not a research flex.',
          ],
        },
        whyThisMatters: [
          'If they cannot explain BM25 they will throw it away and regret it.',
        ],
        commonPitfalls: [
          'Calling BM25 "keyword equals".',
          'Vectors only, then wondering why "ERR-4412" ranks junk.',
        ],
        followUps: [
          'What are k1 and b, in words?',
          'How do you combine BM25 and cosine?',
        ],
        redFlags: [
          'We only do semantic search now.',
        ],
        scoringRubric: {
          1: 'Keyword search.',
          3: 'IDF plus length, no loss case.',
          5: 'Rewards, failure mode, hybrid.',
        },
      },
      {
        id: 'SRCH-F-02',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'Precision@k vs recall@k vs nDCG. Which one for a search bar that shows 10 links?',
        idealAnswer: {
          coreIdea:
            'nDCG@10 if order matters. Recall@100 if you have a second-stage ranker. Precision@1 if you are a magic button that should just be right.',
          keyPoints: [
            'Precision@k. Of the k you showed, how many were good.',
            'Recall@k. Of all the good ones, how many made the cut.',
            'nDCG. Graded relevance, higher ranks worth more.',
            'A retrieve-then-rank stack needs recall on stage 1 and nDCG on stage 2.',
            'Do not optimize nDCG@10 if the money is in position 1 ads vs organic. Say which list you mean.',
          ],
        },
        whyThisMatters: [
          'Wrong metric ships a prettier worse search.',
        ],
        commonPitfalls: [
          'One metric for both stages.',
          'Binary relevance when editors have graded labels.',
        ],
        followUps: [
          'How do you get labels?',
          'What is MRR and when is it enough?',
        ],
        redFlags: [
          'Accuracy of search.',
        ],
        scoringRubric: {
          1: 'Accuracy.',
          3: 'Names nDCG, no stage split.',
          5: 'Picks the metric from the UI and the stack.',
        },
      },
      {
        id: 'SRCH-F-03',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What is position bias, and why does click data lie?',
        idealAnswer: {
          coreIdea:
            'People click the first thing. A worse doc in slot 1 gets more clicks than a better doc in slot 7. If you train on raw clicks, you teach the model to copy yesterday\'s ranking.',
          keyPoints: [
            'Examination. Lower slots are seen less.',
            'Trust bias. Users trust slot 1 even when it is wrong.',
            'Inverse propensity weighting or randomization to unconfound.',
            'A small random swap experiment pays for itself.',
            'Dwell and purchase are less dirty than a raw click, still not clean.',
          ],
        },
        whyThisMatters: [
          'This is the ranking interview.',
        ],
        commonPitfalls: [
          'Training a ranker on clicks as labels.',
          'No propensity.',
        ],
        followUps: [
          'What is a swap test?',
          'How much randomization will product tolerate?',
        ],
        redFlags: [
          'Clicks are ground truth.',
        ],
        scoringRubric: {
          1: 'Users click good things.',
          3: 'Knows position bias, no fix.',
          5: 'IPW or randomization, plus a better label.',
        },
      },
      {
        id: 'SRCH-F-04',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'A query has zero results. What do you do in the product and in the stack?',
        idealAnswer: {
          coreIdea:
            'Never show an empty hole if you can relax. Spellcheck, drop a filter, stem, then a "did you mean". Log the zero. That log is your next synonym list.',
          keyPoints: [
            'Query rewrite. Spell, synonym, strip a too-tight filter.',
            'Show nearest category or popular in the leftover filters.',
            'Do not silently change the query without saying so.',
            'Zeros on SKUs often mean the catalog field is missing, not the ranker.',
            'A weekly zero-query review beats another embedding model.',
          ],
        },
        whyThisMatters: [
          'Empty search is lost revenue. Very practical.',
        ],
        commonPitfalls: [
          'Showing "0 results" and stopping.',
          'Silent rewrite that hides a bad catalog.',
        ],
        followUps: [
          'How do you measure rewrite success?',
          'What if the item is discontinued?',
        ],
        redFlags: [
          'That is a content problem, not search.',
        ],
        scoringRubric: {
          1: 'Ask the user to try again.',
          3: 'Spellcheck only.',
          5: 'Relax, disclose, log, fix catalog.',
        },
      },
      {
        id: 'SRCH-F-05',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'HNSW vs IVF for an item embedding index. How do you choose?',
        idealAnswer: {
          coreIdea:
            'HNSW is the usual default under a few tens of millions of vectors. IVF plus a PQ compression when RAM is the wall. Measure recall@k at your latency, not a blog chart.',
          keyPoints: [
            'HNSW. Graph, high recall, more RAM.',
            'IVF. Clusters, cheaper memory, more knobs, easier to undershoot recall.',
            'DiskANN-style when the set does not fit in memory.',
            'Rebuild cost. Some indexes hate frequent inserts.',
            'Always report recall@k vs a flat brute force on a sample.',
          ],
        },
        whyThisMatters: [
          'They want you to have built one, not named one.',
        ],
        commonPitfalls: [
          'Picking the vendor default with no recall check.',
        ],
        followUps: [
          'How do you add 10k new items an hour?',
          'What does efConstruction change?',
        ],
        redFlags: [
          'Pinecone so we do not think about it.',
        ],
        scoringRubric: {
          1: 'Use FAISS.',
          3: 'Names both, no RAM/recall.',
          5: 'Chooses from size, RAM, and a recall measurement.',
        },
      },
      {
        id: 'SRCH-F-06',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'How do you handle a brand-new item with no clicks?',
        idealAnswer: {
          coreIdea:
            'Content features and a forced explore slot. Collaborative signals will not exist yet. If you only sort by popularity, new items stay buried.',
          keyPoints: [
            'Content tower. Title, category, image embedding.',
            'Explore. A reserved slot or Thompson-style traffic.',
            'A cold-start prior from the category mean, not zero.',
            'Seller or editor boosts expire. Permanent boosts rot the index.',
            'Measure time-to-first-click, not only nDCG on head queries.',
          ],
        },
        whyThisMatters: [
          'Marketplace and recs interviews.',
        ],
        commonPitfalls: [
          'Wait for data.',
          'Permanent merchandising boosts.',
        ],
        followUps: [
          'How much explore before product yells?',
          'What if the new item is junk?',
        ],
        redFlags: [
          'Popularity sort.',
        ],
        scoringRubric: {
          1: 'Need clicks first.',
          3: 'Content features, no explore.',
          5: 'Content plus a decaying explore slot.',
        },
      },
      {
        id: 'SRCH-F-07',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'Pointwise vs pairwise vs listwise learning to rank. Which one have you trained?',
        idealAnswer: {
          coreIdea:
            'Pointwise treats each doc as a score. Pairwise learns A beats B. Listwise looks at the whole list. Pairwise or listwise usually fit search better than a raw classifier.',
          keyPoints: [
            'Pointwise. Simple, ignores order among the rest.',
            'Pairwise. LambdaMART-style. Still a workhorse.',
            'Listwise. Softmax on the list. Needs a full list at train time.',
            'Your labels decide. Binary clicks push you pairwise with bias correction.',
            'If they have never trained one, say so, and talk about a linear ranker on BM25 + recency as a start.',
          ],
        },
        whyThisMatters: [
          'Vocabulary check with a practical out.',
        ],
        commonPitfalls: [
          'Reciting names with no label story.',
        ],
        followUps: [
          'Why is LambdaMART still around?',
          'How do you form pairs from clicks?',
        ],
        redFlags: [
          'We use a GPT to rank.',
        ],
        scoringRubric: {
          1: 'Cannot define them.',
          3: 'Definitions, no training story.',
          5: 'Picks one from the labels they have.',
        },
      },
      {
        id: 'SRCH-F-08',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'nDCG went up 3% and revenue went down. What do you look at?',
        idealAnswer: {
          coreIdea:
            'You optimized a judged set that is not the money. Head queries, cheap items, or a relevance label that hates best-sellers.',
          keyPoints: [
            'Slice head vs tail. Tail nDCG can rise while head, which pays the bills, falls.',
            'Price mix. You may have ranked cheap relevant junk first.',
            'Judges vs buyers. A rater said "relevant", a buyer said "not for me".',
            'Position of ads vs organic if that is in the same list.',
            'Hold a revenue guardrail next to nDCG. Both must clear.',
          ],
        },
        whyThisMatters: [
          'This is the adult ranking question.',
        ],
        commonPitfalls: [
          'Declaring the A/B broken.',
          'Ignoring price.',
        ],
        followUps: [
          'How do you put revenue into the ranker without wrecking trust?',
          'What is a diversity penalty?',
        ],
        redFlags: [
          'nDCG is the business metric.',
        ],
        scoringRubric: {
          1: 'Trust nDCG.',
          3: 'Mentions head/tail, no money.',
          5: 'Slices, price mix, dual gate.',
        },
      },
      {
        id: 'SRCH-F-09',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What is a query understanding stack, in pieces?',
        idealAnswer: {
          coreIdea:
            'Before you rank, you decide what the query is. Spell, language, intent, entities, filters. Bad understanding makes a perfect ranker look drunk.',
          keyPoints: [
            'Normalize. Case, unicode, spell.',
            'Intent. Informational vs find-a-SKU vs navigate-to-brand.',
            'Entities. Brand, SKU, size, color extracted as structured filters.',
            'Rewrite. Synonyms, expansion, removal of stop junk.',
            'Each step has its own eval. Do not bury it inside nDCG.',
          ],
        },
        whyThisMatters: [
          'Search teams split QU and ranking. They want that split.',
        ],
        commonPitfalls: [
          'One LLM prompt as "understanding".',
          'No intent taxonomy.',
        ],
        followUps: [
          'How do you evaluate spell correction?',
          'When do you apply a filter vs a boost?',
        ],
        redFlags: [
          'The embedder understands the query.',
        ],
        scoringRubric: {
          1: 'Embeddings.',
          3: 'Spell plus synonyms.',
          5: 'Spell, intent, entities, rewrite, each measured.',
        },
      },
      {
        id: 'SRCH-F-10',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'How do you keep a synonym list from destroying precision?',
        idealAnswer: {
          coreIdea:
            'Synonyms are directional and scoped. "tv" -> "television" is safer than a full clique. Measure each rule on a query set before it ships.',
          keyPoints: [
            'One-way vs two-way. "mac" -> "macintosh" is dangerous in a makeup store.',
            'Category scope. A synonym that is true in electronics is false in groceries.',
            'A canary. 5% traffic, watch zero-result rate and CTR.',
            'Expiry. Editorial lists rot.',
            'Log when a synonym fired so you can blame it.',
          ],
        },
        whyThisMatters: [
          'Every search team has a cursed synonym file.',
        ],
        commonPitfalls: [
          'A global two-way list from a thesaurus.',
        ],
        followUps: [
          'How do you mine synonyms from logs?',
          'What about stemming vs synonyms?',
        ],
        redFlags: [
          'WordNet dump.',
        ],
        scoringRubric: {
          1: 'Add whatever marketing asks.',
          3: 'List exists, no eval.',
          5: 'Directional, scoped, canary, log.',
        },
      },
    ],
    Advanced: [
      {
        id: 'SRCH-A-01',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design a two-stage search for 50 million products with a 100 ms budget.',
        idealAnswer: {
          coreIdea:
            'Retrieve a few hundred with BM25 plus ANN in parallel, fuse, then a ranker on CPU or a small GPU batch. 100 ms is gone if you wait on a 7B model.',
          keyPoints: [
            'Stage 1 in 20-30 ms. Hybrid retrieve, 200-500 candidates.',
            'Stage 2. Gradient-boosted ranker or a tiny cross-encoder on the fused set.',
            'Cache head queries. They are most of the traffic.',
            'Timeouts per stage. If ANN is late, serve BM25-only.',
            'Do not put an LLM in this path unless it is a rewrite on a sample of queries.',
          ],
        },
        whyThisMatters: [
          'The classic design round.',
        ],
        commonPitfalls: [
          'Cross-encoder on 50 million docs.',
          'No cache.',
        ],
        followUps: [
          'How do you fuse BM25 and ANN scores?',
          'Where do personalization features enter?',
        ],
        redFlags: [
          'One giant transformer.',
        ],
        scoringRubric: {
          1: 'Embed everything, kNN.',
          3: 'Two stages, no budget split.',
          5: 'Budgeted hybrid retrieve, cheap rank, cache, fallback.',
        },
      },
      {
        id: 'SRCH-A-02',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '3-4 minutes',
        question: 'How do you train a ranker from implicit feedback without cloning the old ranking?',
        idealAnswer: {
          coreIdea:
            'Debias clicks, or collect a bit of randomized traffic, or use a skip model. Raw clicks as labels will photocopy the current system.',
          keyPoints: [
            'Inverse propensity on position.',
            'Rand-to-top or interleaving to get cleaner pairs.',
            'Duplicates. Same query, two docs, one clicked above the other. That pair is gold if you account for position.',
            'Regularize toward a content model so you do not only learn "was already on top".',
            'Offline eval on a judged set, not on click-AUC.',
          ],
        },
        whyThisMatters: [
          'This is how rankers stagnate.',
        ],
        commonPitfalls: [
          'Click = 1, no click = 0, fit XGBoost.',
        ],
        followUps: [
          'How much randomization is too much?',
          'Unbiased offline eval. What is it?',
        ],
        redFlags: [
          'Clicks are labels.',
        ],
        scoringRubric: {
          1: 'Train on clicks.',
          3: 'Knows bias, no method.',
          5: 'IPW or randomization plus a judged set.',
        },
      },
      {
        id: 'SRCH-A-03',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'How do you personalize without wrecking a navigational query like "nike air force 1"?',
        idealAnswer: {
          coreIdea:
            'Intent first. If the query is navigational or a precise SKU, personalization is a light boost, not a rewrite of the list. Personalize when intent is open.',
          keyPoints: [
            'A query classifier. Nav vs explore.',
            'On nav, keep lexical matches in the top slots.',
            'On explore, mix user tower features into the ranker.',
            'Diversity. Do not fill 10 slots with the one brand they always buy.',
            'An escape hatch. A "see popular" control when personalization feels creepy or wrong.',
          ],
        },
        whyThisMatters: [
          'Personalization interviews go wrong on head queries.',
        ],
        commonPitfalls: [
          'The same ranker weights for all queries.',
        ],
        followUps: [
          'How do you evaluate personalization without a judged per-user set?',
          'GDPR. What do you store?',
        ],
        redFlags: [
          'Always personalize.',
        ],
        scoringRubric: {
          1: 'User embedding on everything.',
          3: 'Mentions nav, no rule.',
          5: 'Intent gate, lexical lock on nav, diversity on explore.',
        },
      },
      {
        id: 'SRCH-A-04',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you detect and fix a ranking that collapsed to popular items?',
        idealAnswer: {
          coreIdea:
            'Look at unique item share in top-10, Gini of impressions, and tail coverage. If 30 SKUs eat half the page-ones, you collapsed.',
          keyPoints: [
            'Coverage and Gini dashboards, not only nDCG.',
            'A diversity or novelty term in the ranker, or a simple slot reservation for long-tail.',
            'Exploration on a fraction of traffic.',
            'Check the training data. Popularity is a feature that will dominate if you let it.',
            'Business may want some collapse (bestsellers). Write the cap.',
          ],
        },
        whyThisMatters: [
          'Recs rot this way.',
        ],
        commonPitfalls: [
          'Adding more popularity features.',
        ],
        followUps: [
          'MMR. When do you use it?',
          'How do you keep legal "must show" items in the mix?',
        ],
        redFlags: [
          'Users like popular things.',
        ],
        scoringRubric: {
          1: 'No metric.',
          3: 'Mentions diversity, no dashboard.',
          5: 'Coverage/Gini, a cap, and a training-feature check.',
        },
      },
      {
        id: 'SRCH-A-05',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design near-real-time indexing when prices and stock change every few seconds.',
        idealAnswer: {
          coreIdea:
            'Split durable text from volatile fields. Reindex text on a slower path. Patch price and stock in a side store the ranker reads at query time.',
          keyPoints: [
            'Do not rebuild HNSW every time a price ticks.',
            'A KV for price, stock, and "is buyable". The ranker joins at serve.',
            'Partial updates in the inverted index for title changes.',
            'Out-of-stock should drop or demote, not wait for a nightly job.',
            'A freshness SLO. "Stock is at most 5 seconds stale."',
          ],
        },
        whyThisMatters: [
          'Commerce search. This is the job.',
        ],
        commonPitfalls: [
          'Full re-embed on every price change.',
        ],
        followUps: [
          'What if the side store is stale?',
          'How do you delete an item immediately?',
        ],
        redFlags: [
          'Nightly batch is fine for stock.',
        ],
        scoringRubric: {
          1: 'Reindex hourly.',
          3: 'Faster index, still mixing price into the inverted list.',
          5: 'Slow text index, fast side store, SLO.',
        },
      },
      {
        id: 'SRCH-A-06',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you evaluate a query rewrite model without waiting for an A/B?',
        idealAnswer: {
          coreIdea:
            'A judged set of query -> expected docs or expected rewrite. Plus a side-by-side on zeros and misspellings. Then a small A/B.',
          keyPoints: [
            'Gold rewrites for the ugly head misspellings.',
            'Retrieval recall of a known doc before vs after rewrite.',
            'A "do not rewrite" set. Brand queries you must not touch.',
            'Offline first. A/B for the cases offline cannot see.',
            'Watch zero-result rate and reformulation rate in the A/B.',
          ],
        },
        whyThisMatters: [
          'Rewrite models are easy to ship and hard to notice when they go weird.',
        ],
        commonPitfalls: [
          'LLM rewrite with no do-not-touch list.',
        ],
        followUps: [
          'How do you generate the gold set?',
          'What if the rewrite is longer and more expensive to search?',
        ],
        redFlags: [
          'Prompt GPT to expand every query.',
        ],
        scoringRubric: {
          1: 'A/B only.',
          3: 'Some gold, no protected queries.',
          5: 'Gold, protected set, recall delta, then A/B.',
        },
      },
      {
        id: 'SRCH-A-07',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Where, if anywhere, do you put an LLM in a production search stack today?',
        idealAnswer: {
          coreIdea:
            'Off the 100 ms path for most queries. Use it for rewrite on hard queries, for query understanding, or for a "why these results" blurb. Not to score 50 million docs.',
          keyPoints: [
            'Head queries are cached and cheap. Do not LLM them.',
            'Tail and natural-language queries can take a rewrite.',
            'A cross-encoder on 50 candidates is sometimes worth it. A 70B judge is not.',
            'Citations. If you generate an answer, you still show the links.',
            'Cost cap per 1k queries or you will find the bill on a Monday.',
          ],
        },
        whyThisMatters: [
          '2026 search interviews all ask this.',
        ],
        commonPitfalls: [
          'LLM ranker on every request.',
          'Answer engine with no links.',
        ],
        followUps: [
          'How do you detect a query that needs a rewrite?',
          'What is your hallucination policy on a shopping answer?',
        ],
        redFlags: [
          'Replace search with a chatbot.',
        ],
        scoringRubric: {
          1: 'LLM does search.',
          3: 'Rewrite only, no cost cap.',
          5: 'Off-head-path, links stay, budgeted.',
        },
      },
      {
        id: 'SRCH-A-08',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you set up an interleaving experiment when you cannot wait for a full A/B?',
        idealAnswer: {
          coreIdea:
            'Mix results from A and B in one list, track which system the clicks belong to. You get a comparison with less traffic than two separate worlds.',
          keyPoints: [
            'Team-draft or balanced interleave so position is fair.',
            'Attribute each click to the system that contributed that doc.',
            'Good for ranker pairwise comparison. Bad for whole-page layout changes.',
            'Still watch business guardrails in a slower A/B.',
            'Explain it to product. The list will look a bit odd. That is the point.',
          ],
        },
        whyThisMatters: [
          'Search science teams expect this word.',
        ],
        commonPitfalls: [
          'Interleaving a layout change.',
          'Forgetting to credit the source system.',
        ],
        followUps: [
          'When is a switchback better?',
          'How do you handle duplicate docs from both systems?',
        ],
        redFlags: [
          'Never heard of it on a ranking team.',
        ],
        scoringRubric: {
          1: 'Just A/B.',
          3: 'Names interleave, no attribution.',
          5: 'Fair mix, credit clicks, knows when not to use it.',
        },
      },
    ],
  },
};
