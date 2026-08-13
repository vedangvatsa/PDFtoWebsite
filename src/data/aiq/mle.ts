import type { RoleData } from './types';

export const mleRole: RoleData = {
  id: 'ml-engineer',
  role: 'Machine Learning Engineer',
  snapshot:
    'Trains models that ship. Features, leakage, calibration, and a rollback plan when last week\'s lift disappears.',
  coreCompetencies: [
    'Train / val / test splits',
    'Leakage',
    'Class imbalance',
    'Calibration',
    'Feature stores',
    'Online vs offline metrics',
    'A/B tests',
  ],
  questions: {
    Foundation: [
      {
        id: 'MLE-F-01',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'How do you split data so the test score means something in production?',
        idealAnswer: {
          coreIdea:
            'Split on the unit that can leak. For users that is user id. For time that is a cutoff. Random rows are the usual way to lie to yourself.',
          keyPoints: [
            'If the same user is in train and test, you are testing memory, not generalization.',
            'If the world changes, use a time split. Train on January, test on February.',
            'Keep a locked test set. Tune on validation only.',
            'Group k-fold when the group is the thing you will see again.',
            'Write the split rule down. "Shuffle 80/20" is not a rule.',
          ],
        },
        whyThisMatters: [
          'Leakage is the most common silent failure in MLE screens.',
          'They want the split tied to how the model will be called.',
        ],
        commonPitfalls: [
          'Random split on time-series clicks.',
          'Using test data to pick a threshold, then quoting that number.',
        ],
        followUps: [
          'How would you split a recommendation dataset?',
          'What if new users have no history?',
        ],
        redFlags: [
          'Only knows train_test_split with a seed.',
          'Cannot name a leakage path.',
        ],
        scoringRubric: {
          1: 'Random split, no unit of analysis.',
          3: 'Mentions time or user split, no locked test.',
          5: 'Picks the leak unit, a cutoff, and a holdout they will not touch.',
        },
      },
      {
        id: 'MLE-F-02',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'Precision, recall, PR-AUC, ROC-AUC. When do you throw ROC-AUC in the bin?',
        idealAnswer: {
          coreIdea:
            'ROC-AUC looks kind on rare positives. If 1% of rows are fraud, a model that ranks noise can still post 0.90. Use PR-AUC and a threshold tied to cost.',
          keyPoints: [
            'Precision is of the alarms you raised, how many were real.',
            'Recall is of the real cases, how many you caught.',
            'ROC mixes true-negative plenty. That inflates the number on imbalance.',
            'PR-AUC stays honest when positives are rare.',
            'Pick a threshold from dollars or review minutes, not from a default 0.5.',
          ],
        },
        whyThisMatters: [
          'Imbalance is every ads, fraud, and medical screen.',
          'They want a metric that matches the pain.',
        ],
        commonPitfalls: [
          'Reporting accuracy on 99% negative data.',
          'Optimizing ROC-AUC then shipping a 0.5 threshold.',
        ],
        followUps: [
          'How do you pick a threshold if review staff can only look at 200 cases a day?',
          'What is calibration and why does it matter after you pick a threshold?',
        ],
        redFlags: [
          'Accuracy as the only number.',
          'Cannot say what a false positive costs here.',
        ],
        scoringRubric: {
          1: 'Mixes the four terms.',
          3: 'Defines them, still leans on ROC for fraud.',
          5: 'Drops ROC on imbalance and ties the threshold to a budget.',
        },
      },
      {
        id: 'MLE-F-03',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'What is target leakage, and how do you catch it before a demo?',
        idealAnswer: {
          coreIdea:
            'Leakage is a feature that would not exist at prediction time, or that already contains the label. The model looks like a genius until the pipeline is live.',
          keyPoints: [
            'Classic: including "paid_at" when predicting whether a bill will be paid.',
            'Classic: a status field updated after the event you are predicting.',
            'Classic: embedding text that quotes the label.',
            'Draw the timeline. Every feature needs a timestamp strictly before the label.',
            'If one feature has 0.99 importance and the rest are noise, start there.',
          ],
        },
        whyThisMatters: [
          'This is how "our model is 98%" dies in week one.',
        ],
        commonPitfalls: [
          'Joining the full fact table without as-of joins.',
          'Using future aggregates in a notebook "just to see".',
        ],
        followUps: [
          'How do you do a point-in-time join?',
          'What would you ask the data owner on day one?',
        ],
        redFlags: [
          'Has never seen a leak.',
          'Trusts feature importance without a timeline.',
        ],
        scoringRubric: {
          1: 'Cannot give an example.',
          3: 'One example, no detection method.',
          5: 'Timeline rule plus a suspicious-importance check.',
        },
      },
      {
        id: 'MLE-F-04',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'L1 vs L2 regularization. When do you want coefficients to go to zero?',
        idealAnswer: {
          coreIdea:
            'L2 shrinks weights. L1 can zero them. Use L1 when you want a short feature list. Use L2 when correlated features should share the load.',
          keyPoints: [
            'L2 (ridge) penalizes squared weights. Nothing has to hit zero.',
            'L1 (lasso) penalizes absolute weights. Spare features drop out.',
            'Elastic net mixes both when you have correlated groups.',
            'Regularization is not a substitute for a better split.',
            'Tree models do not use L1/L2 the same way. Depth and min-leaf are the knobs.',
          ],
        },
        whyThisMatters: [
          'Still asked on whiteboards for tabular roles.',
        ],
        commonPitfalls: [
          'Saying L1 is "stronger L2".',
          'Regularizing after one-hot of a huge ID space and calling it done.',
        ],
        followUps: [
          'What happens to L1 if two features are copies of each other?',
          'How does dropout relate, conceptually, in a net?',
        ],
        redFlags: [
          'Cannot write the penalty term even loosely.',
        ],
        scoringRubric: {
          1: 'Names them, no effect on weights.',
          3: 'L1 sparsifies, L2 shrinks.',
          5: 'Adds correlated features and when trees ignore this frame.',
        },
      },
      {
        id: 'MLE-F-05',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'Your training AUC is 0.94 and production AUC is 0.61. Walk the first hour.',
        idealAnswer: {
          coreIdea:
            'Assume the live path is not the notebook path. Check the split, the feature code, the population, then the label.',
          keyPoints: [
            'Diff train vs serve features. A default fill that only exists online will do this.',
            'Confirm the live population. A model trained on logged-in users serving guests will tank.',
            'Check label delay. You may be scoring yesterday against today\'s incomplete labels.',
            'Look at calibration, not only AUC. A shift in base rate wrecks thresholds.',
            'Roll back if money is moving. Debug on a shadow path.',
          ],
        },
        whyThisMatters: [
          'This is the on-call question.',
        ],
        commonPitfalls: [
          'Retraining immediately on live data.',
          'Blaming "concept drift" before checking a join.',
        ],
        followUps: [
          'How would you compare offline and online feature distributions?',
          'When is it actually drift, not a bug?',
        ],
        redFlags: [
          'Retrain as step one.',
          'No rollback.',
        ],
        scoringRubric: {
          1: 'Needs more data.',
          3: 'Mentions drift, no train/serve check.',
          5: 'Train/serve, population, labels, then rollback.',
        },
      },
      {
        id: 'MLE-F-06',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What is a feature store for, and when is it overhead?',
        idealAnswer: {
          coreIdea:
            'A feature store is a contract. Offline training and online serving read the same definition. It is overhead when you have three features and one service.',
          keyPoints: [
            'Point-in-time correct training sets.',
            'Low-latency online lookup with the same transform.',
            'Ownership. Someone owns "user_7d_spend", not a copy in three repos.',
            'Skip it for a single batch job with no online path.',
            'It will not fix a leaked label. It will only serve the leak faster.',
          ],
        },
        whyThisMatters: [
          'MLE loops at bigger companies assume this vocabulary.',
        ],
        commonPitfalls: [
          'Treating the store as a data lake with a nicer name.',
          'Different SQL offline and Python online.',
        ],
        followUps: [
          'How do you backfill a new feature for a year of history?',
          'What do you log so you can debug a single request?',
        ],
        redFlags: [
          'Cannot name train/serve skew.',
        ],
        scoringRubric: {
          1: 'A database for features.',
          3: 'Mentions online/offline, no point-in-time.',
          5: 'Contract, as-of joins, and when not to build one.',
        },
      },
      {
        id: 'MLE-F-07',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'Bias-variance, in one minute, with a model you have shipped.',
        idealAnswer: {
          coreIdea:
            'Bias is being systematically wrong. Variance is twitching when the sample twitches. You pick a model class, then you check both on a holdout.',
          keyPoints: [
            'Underfit. Train and val both bad. Add features, reduce regularization, try a richer model.',
            'Overfit. Train great, val poor. More data, more regularize, simpler model, better split.',
            'Bagging cuts variance. Boosting often cuts bias and can overfit if you let it.',
            'Do not quote the textbook U-curve and sit down. Apply it to the actual model.',
          ],
        },
        whyThisMatters: [
          'They are checking you can diagnose, not recite.',
        ],
        commonPitfalls: [
          'Calling every gap "overfitting".',
          'Adding layers when the labels are wrong.',
        ],
        followUps: [
          'How does early stopping fit this picture?',
          'What does high variance look like in a boosted tree?',
        ],
        redFlags: [
          'No example from a real model.',
        ],
        scoringRubric: {
          1: 'Definitions only, swapped.',
          3: 'Correct words, no fix.',
          5: 'Diagnose plus a change they would make.',
        },
      },
      {
        id: 'MLE-F-08',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'How do you handle a 1:200 class imbalance without inventing data you do not trust?',
        idealAnswer: {
          coreIdea:
            'Change the loss or the threshold first. Resample last. Synthetic rows are easy to overfit.',
          keyPoints: [
            'Class weights or a focal-style loss.',
            'Sample more negatives for training if you cannot afford the full set, but evaluate on the real base rate.',
            'SMOTE on mixed tabular data with categoricals often makes junk.',
            'Report PR-AUC and a capacity-aware precision.',
            'If the rare class is badly labeled, fix labels before you boost.',
          ],
        },
        whyThisMatters: [
          'Default answer is SMOTE. They want to see you refuse it.',
        ],
        commonPitfalls: [
          'Oversampling before the split.',
          'Evaluating on the resampled test set.',
        ],
        followUps: [
          'What if false negatives are 50x more expensive?',
          'How do you explain a 4% recall model to a VP?',
        ],
        redFlags: [
          'SMOTE as the first and only move.',
        ],
        scoringRubric: {
          1: 'Duplicate the rare class.',
          3: 'Weights, still evaluates wrong.',
          5: 'Loss/threshold first, real base rate on eval.',
        },
      },
      {
        id: 'MLE-F-09',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What does a well-calibrated model mean, and when do you care?',
        idealAnswer: {
          coreIdea:
            'If the model says 0.2, about 20% of those rows should be positive. You care when a human or a bid uses the number as a probability, not just a rank.',
          keyPoints: [
            'Ranking metrics can look fine while probabilities are wild.',
            'Platt scaling or isotonic regression on a holdout.',
            'Reliability plots. Bins of predicted p vs observed rate.',
            'Trees can be poorly calibrated. Nets even more so after distillation.',
            'Do not calibrate on the test set you will quote.',
          ],
        },
        whyThisMatters: [
          'Pricing, risk, and medical loops ask this.',
        ],
        commonPitfalls: [
          'Using raw scores as probabilities.',
          'Calibrating on training data.',
        ],
        followUps: [
          'How does a base-rate shift break calibration?',
          'Brier score vs log loss?',
        ],
        redFlags: [
          'Thinks AUC measures calibration.',
        ],
        scoringRubric: {
          1: 'No definition.',
          3: 'Correct idea, no method.',
          5: 'Plot, method, and when rank is enough.',
        },
      },
      {
        id: 'MLE-F-10',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'XGBoost vs a linear model vs a small net. How do you choose on a tabular problem?',
        idealAnswer: {
          coreIdea:
            'Start linear if you need to explain a coefficient to legal. Use gradient boosting for most tabular accuracy. Use a net when you have huge data or you must share a tower with other tasks.',
          keyPoints: [
            'Boosted trees handle mixed types and missingness with little ceremony.',
            'Linear is the baseline. If it is close, ship it.',
            'Nets on 50k rows of tabular data usually lose to trees.',
            'Latency. A tiny linear model in the request path beats a 400-tree ensemble if you are at 5 ms.',
            'Write the constraint first. Accuracy is not always the constraint.',
          ],
        },
        whyThisMatters: [
          'They want judgment, not a brand.',
        ],
        commonPitfalls: [
          'Defaulting to the last Kaggle winner.',
          'Ignoring serve latency.',
        ],
        followUps: [
          'How do you explain a tree model to a credit officer?',
          'When would you distill a tree into a linear model?',
        ],
        redFlags: [
          'Always XGBoost.',
          'Always deep learning.',
        ],
        scoringRubric: {
          1: 'Picks a favorite.',
          3: 'Trees for tabular, no latency.',
          5: 'Constraint first, baseline, then the heavier model.',
        },
      },
    ],
    Advanced: [
      {
        id: 'MLE-A-01',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design an online/offline feature pipeline for a model that scores every checkout.',
        idealAnswer: {
          coreIdea:
            'Compute history in batch, compute request-time signals in the service, and join them with the same names. Log the exact vector you scored.',
          keyPoints: [
            'Batch. Daily or hourly aggregates in a warehouse, published to an online KV.',
            'Real-time. Cart size, device, this-session events from a stream.',
            'Same feature name and type in both paths. No "amount" vs "amt".',
            'Log features + model version + score on every request for later labels.',
            'Shadow-train on logged features, not on a rebuilt warehouse join, or you will not reproduce the score.',
          ],
        },
        whyThisMatters: [
          'This is the system design MLE round.',
        ],
        commonPitfalls: [
          'Recomputing 90-day spend inside the request.',
          'No feature log, so you cannot debug a single order.',
        ],
        followUps: [
          'How do you backfill when a definition changes?',
          'What is your SLA if Redis is empty?',
        ],
        redFlags: [
          'One giant Spark job as the online path.',
        ],
        scoringRubric: {
          1: 'Train a pickle, load it in Flask.',
          3: 'Batch plus online, no log.',
          5: 'Contract, log, backfill, and a missing-cache fallback.',
        },
      },
      {
        id: 'MLE-A-02',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '3-4 minutes',
        question: 'How do you A/B a model when the metric you care about takes two weeks to observe?',
        idealAnswer: {
          coreIdea:
            'You need a short proxy that you have already proven moves with the long metric, plus a holdback that waits.',
          keyPoints: [
            'Do not ship on day-0 click if you are paid on day-14 retention, unless you have that correlation in writing.',
            'Interleaving or switchback if users interact with each other.',
            'CUPED or similar variance reduction if you have pre-period data.',
            'Guardrail metrics. Latency, refunds, complaints.',
            'A 1% lift on a noisy metric is not a ship. Show the interval.',
          ],
        },
        whyThisMatters: [
          'This is how models die in experiment review.',
        ],
        commonPitfalls: [
          'Peeking every hour and stopping at p < 0.05.',
          'Using a proxy you never validated.',
        ],
        followUps: [
          'What if the treatment changes the logging itself?',
          'How do you handle network effects in a marketplace?',
        ],
        redFlags: [
          'Ship if the dashboard is green today.',
        ],
        scoringRubric: {
          1: 'Wait two weeks, no proxy.',
          3: 'Names a proxy, no validation.',
          5: 'Validated proxy, guardrails, no peeking.',
        },
      },
      {
        id: 'MLE-A-03',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design monitoring for a weekly-retrained ranking model.',
        idealAnswer: {
          coreIdea:
            'Watch inputs, outputs, and money. A weekly retrain without those three is a scheduled surprise.',
          keyPoints: [
            'Input drift. PSI or a simple bucket-share check on key features.',
            'Output drift. Score histogram, top-item share, empty-result rate.',
            'Label delay dashboard. Do not wait two weeks to notice a broken join.',
            'Canary the new champion on 5% with an auto rollback.',
            'Alert on volume, not only on mean. A silent 0 QPS is a model problem too.',
          ],
        },
        whyThisMatters: [
          'Retrain pipelines fail in boring ways.',
        ],
        commonPitfalls: [
          'Only tracking loss in the training job.',
          'No champion/challenger.',
        ],
        followUps: [
          'What do you do if PSI fires but revenue is flat?',
          'How do you version a feature used by two models?',
        ],
        redFlags: [
          'Retrain Friday, no canary.',
        ],
        scoringRubric: {
          1: 'Look at AUC after train.',
          3: 'Drift on inputs only.',
          5: 'Inputs, scores, delayed labels, canary.',
        },
      },
      {
        id: 'MLE-A-04',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you explain a boosted-tree decline decision to a regulator?',
        idealAnswer: {
          coreIdea:
            'You need a documented reason per decision, not a global feature-importance slide. Use a local method and a human-readable policy layer.',
          keyPoints: [
            'Global gain charts are not an explanation for one applicant.',
            'SHAP or similar local attributions, with the caveats written down.',
            'Often you keep a monotone constraint or a simple overlay rule for protected attributes.',
            'Store the model version and the feature vector with the decision.',
            'If you cannot explain it, you may not be allowed to use it. That is a product constraint.',
          ],
        },
        whyThisMatters: [
          'Credit, insurance, hiring. This is a real blocker.',
        ],
        commonPitfalls: [
          'Pasting a SHAP beeswarm and calling it done.',
          'Ignoring that some features are illegal to use at all.',
        ],
        followUps: [
          'Monotonic constraints. When do you force them?',
          'How do you test for proxy discrimination?',
        ],
        redFlags: [
          'The model is a black box, we cannot say.',
        ],
        scoringRubric: {
          1: 'Feature importance bar chart.',
          3: 'Names SHAP, no per-decision store.',
          5: 'Local reason, versioned vector, legal constraints.',
        },
      },
      {
        id: 'MLE-A-05',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Two-tower retrieval vs a single ranking model on all pairs. When do you split them?',
        idealAnswer: {
          coreIdea:
            'You cannot score every item for every user. Retrieve a few hundred cheaply, then rank that set with a heavier model.',
          keyPoints: [
            'Towers. User embedding and item embedding, nearest neighbor in an ANN index.',
            'Ranker. Cross features, more compute, tens or hundreds of candidates.',
            'Train them on different losses. Retrieval is about recall. Ranking is about order among the retrieved.',
            'If the catalog is 2,000 items, one model may be enough.',
            'Watch retrieval recall@k. A perfect ranker cannot fix a miss in retrieval.',
          ],
        },
        whyThisMatters: [
          'Recs and search MLE rounds land here.',
        ],
        commonPitfalls: [
          'Training the ranker as if it sees the full catalog.',
          'No recall metric on the first stage.',
        ],
        followUps: [
          'How often do you refresh item embeddings?',
          'How do you avoid popularity collapse?',
        ],
        redFlags: [
          'One softmax over 10 million items in the request.',
        ],
        scoringRubric: {
          1: 'One model scores everything.',
          3: 'Names two stages, no metrics split.',
          5: 'ANN retrieve, heavy rank, recall@k on stage one.',
        },
      },
      {
        id: 'MLE-A-06',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'Your importance plot says one-hot country codes dominate. What do you actually do?',
        idealAnswer: {
          coreIdea:
            'High cardinality IDs steal the model. Target-encode with care, embed, or drop. Do not leave 180 dummy columns in a linear model and celebrate.',
          keyPoints: [
            'Check leakage in target encoding. Use out-of-fold statistics.',
            'Rare countries should collapse to "other".',
            'A country effect may be a proxy for something you cannot use.',
            'If country is a real policy (shipping), keep it as an explicit rule, not a learned oddity.',
            'Rerun without it. If the metric barely moves, you were fitting noise.',
          ],
        },
        whyThisMatters: [
          'Tabular interviews love a dirty categorical.',
        ],
        commonPitfalls: [
          'Target encode on the full dataset.',
          'Leaving rare levels as their own columns.',
        ],
        followUps: [
          'Hashing trick vs embedding for IDs?',
          'How do you serve a target encoding online?',
        ],
        redFlags: [
          'pd.get_dummies on user_id.',
        ],
        scoringRubric: {
          1: 'Drop the feature.',
          3: 'Target encode, no leakage note.',
          5: 'OOF encode, rare-level bucket, policy check.',
        },
      },
      {
        id: 'MLE-A-07',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you know a weekly retrain is worth the job vs a monthly one?',
        idealAnswer: {
          coreIdea:
            'Measure how fast the live metric decays after a freeze. Retrain at the interval where decay costs more than the job.',
          keyPoints: [
            'Hold a frozen champion for extra weeks in a shadow plot.',
            'If decay is flat, you are burning cluster time.',
            'If decay is steep after 4 days, weekly is already late.',
            'Count failures. A brittle daily job that pages people is not "more ML".',
            'Retrain is not a substitute for a broken feature.',
          ],
        },
        whyThisMatters: [
          'Shows you treat retrain as an experiment.',
        ],
        commonPitfalls: [
          'Daily because it sounds online.',
          'No decay plot.',
        ],
        followUps: [
          'What if only one segment decays?',
          'Warm-start vs train from scratch each week?',
        ],
        redFlags: [
          'Cron daily, no metric.',
        ],
        scoringRubric: {
          1: 'More often is better.',
          3: 'Mentions drift, no decay experiment.',
          5: 'Frozen-champion decay vs job cost.',
        },
      },
      {
        id: 'MLE-A-08',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design a fallback when the model service is down at checkout.',
        idealAnswer: {
          coreIdea:
            'Checkout cannot wait on a score. Cache the last good score, then a cheap heuristic, then a default. Never block the order.',
          keyPoints: [
            'Timeouts in the low tens of milliseconds for this path.',
            'Cached score with a TTL. Stale is better than a spinner.',
            'Heuristic. Last week\'s conversion rate for that SKU, or a business rule.',
            'Hard default that finance has signed. For example, no extra promo.',
            'Page on fallback rate, not only on 5xx.',
          ],
        },
        whyThisMatters: [
          'They want a product engineer, not a notebook owner.',
        ],
        commonPitfalls: [
          'Retry storm on a dead GPU box.',
          'Failing the HTTP request to the storefront.',
        ],
        followUps: [
          'How do you test the fallback in staging?',
          'Do you still log the heuristic as a model score?',
        ],
        redFlags: [
          'The page errors if the model is down.',
        ],
        scoringRubric: {
          1: 'Retry until it works.',
          3: 'Cache, no default.',
          5: 'Timeout, cache, heuristic, signed default, alert.',
        },
      },
    ],
  },
};
