import type { RoleData } from './types';

export const nlpRole: RoleData = {
  id: 'nlp-speech',
  role: 'NLP & Speech Engineer',
  snapshot:
    'Text and audio in, something a product can use. Tokenization, sequence labeling, ASR/TTS, and why the model cannot spell.',
  coreCompetencies: [
    'Tokenization',
    'Sequence labeling',
    'ASR / TTS',
    'Evaluation (WER, BLEU, COMET)',
    'Multilingual',
    'Forced alignment',
    'Latency on device',
  ],
  questions: {
    Foundation: [
      {
        id: 'NLP-F-01',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'Why do subword tokenizers break spelling, reversal, and some arithmetic?',
        idealAnswer: {
          coreIdea:
            'The model sees pieces, not characters. "hello" might be one token. Reversing it is not a character walk the model was trained to do.',
          keyPoints: [
            'BPE and Unigram merge frequent chunks. Rare words shatter. Common words stay whole.',
            'Numbers often split in ugly ways. 1000 and 1,000 are different token strings.',
            'Leading spaces are tokens. "Dog" and " Dog" are not the same.',
            'If the task is character-level, say so, or pick a model that was trained for it.',
            'Do not be shocked when a 70B model cannot count letters in "strawberry".',
          ],
        },
        whyThisMatters: [
          'This is the first NLP screen that separates users of APIs from people who have shipped text.',
        ],
        commonPitfalls: [
          'Blaming "the model is dumb" with no tokenizer talk.',
          'Lowercasing and stripping punctuation before a cased NER model.',
        ],
        followUps: [
          'How would you test a new tokenizer against an old one?',
          'What happens to your word-level F1 if you change the tokenizer?',
        ],
        redFlags: [
          'Thinks the model reads letters.',
        ],
        scoringRubric: {
          1: 'Tokens are words.',
          3: 'Knows BPE, no product consequence.',
          5: 'Ties a failure mode to the merge table.',
        },
      },
      {
        id: 'NLP-F-02',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'NER vs classification vs span extraction. Which one for a contract "termination date"?',
        idealAnswer: {
          coreIdea:
            'You need a span, not a label on the whole file. Treat it as extraction. Classification only tells you the doc has a date somewhere.',
          keyPoints: [
            'Classification. One label per doc or sentence.',
            'NER. Typed spans. PERSON, ORG, DATE. Generic dates are not "termination date".',
            'QA / span extraction. Question plus passage, return the char offsets.',
            'For contracts, a small extractor or a constrained VLM/LLM with offsets beats generic NER.',
            'Always keep character offsets. A pretty string with no location is not reviewable.',
          ],
        },
        whyThisMatters: [
          'Wrong task shape wastes a quarter.',
        ],
        commonPitfalls: [
          'Fine-tuning a classifier and parsing the date out of the rationale.',
          'Dropping offsets.',
        ],
        followUps: [
          'How do you evaluate overlapping spans?',
          'What if the date is in a table cell?',
        ],
        redFlags: [
          'Fine-tune BERT-base and hope.',
        ],
        scoringRubric: {
          1: 'Just use ChatGPT.',
          3: 'Names NER, no offsets.',
          5: 'Picks span extraction and a review UI with offsets.',
        },
      },
      {
        id: 'NLP-F-03',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'BLEU is high and the translation is wrong. What happened?',
        idealAnswer: {
          coreIdea:
            'BLEU counts n-gram overlap with a reference. A fluent paraphrase scores low. A reference-copy with a swapped name can score high.',
          keyPoints: [
            'BLEU hates valid synonyms.',
            'Multiple references help. One reference is a lottery.',
            'COMET or a learned metric tracks meaning better for MT.',
            'Still read a sample. Automatic metrics miss named-entity swaps.',
            'For product copy, a human side-by-side on 100 sentences beats a 2-point BLEU flex.',
          ],
        },
        whyThisMatters: [
          'MT and summarization loops still quote BLEU. They want pushback.',
        ],
        commonPitfalls: [
          'Optimizing BLEU in a loop until the text is stiff.',
          'No entity check.',
        ],
        followUps: [
          'What metric for summarization?',
          'How do you catch a hallucinated number in a summary?',
        ],
        redFlags: [
          'BLEU is the goal.',
        ],
        scoringRubric: {
          1: 'Trusts BLEU.',
          3: 'Knows it is overlap, no alternative.',
          5: 'COMET/human plus entity checks.',
        },
      },
      {
        id: 'NLP-F-04',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What is WER, and why can a "worse" WER be a better ASR product?',
        idealAnswer: {
          coreIdea:
            'WER is edits over reference words. It punishes harmless function words and formatting. Users care about names, numbers, and commands.',
          keyPoints: [
            'Insert, delete, substitute. Then divide by reference length.',
            'A model that writes "Dr. Smith" vs "Doctor Smith" takes a hit.',
            'Measure a weighted WER on entities, or a task success rate (did the assistant do the thing).',
            'Code-switching and accents need their own slices.',
            'Display formatting (punctuation, casing) is a second model. Do not dump that into raw WER.',
          ],
        },
        whyThisMatters: [
          'Speech roles live on WER. They want a grown-up version.',
        ],
        commonPitfalls: [
          'One global WER on a clean read-speech set.',
          'No proper-noun slice.',
        ],
        followUps: [
          'How do you build a proper-noun test set?',
          'What is CER and when do you use it?',
        ],
        redFlags: [
          'WER on LibriSpeech as the ship gate.',
        ],
        scoringRubric: {
          1: 'WER is accuracy.',
          3: 'Defines WER, ships on it alone.',
          5: 'Entity-weighted or task success, plus slices.',
        },
      },
      {
        id: 'NLP-F-05',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'How do you stop a classifier from treating "not good" as positive?',
        idealAnswer: {
          coreIdea:
            'Bag-of-words misses negation. You need context. A small transformer, or explicit negation features, or a span around the adjective.',
          keyPoints: [
            'Unigrams will score "good" and ignore "not".',
            'Bigrams help a bit. They fail on "not at all good".',
            'A sequence model or a pretrained encoder usually fixes this if the training data has negation.',
            'If you stay linear, add a negation-scope feature.',
            'Put 50 negation cases in the eval. If you did not, you will not see the bug.',
          ],
        },
        whyThisMatters: [
          'Classic NLP interview. Still fails in reviews products.',
        ],
        commonPitfalls: [
          'More data, same unigram model.',
          'No negation slice in the test set.',
        ],
        followUps: [
          'Sarcasm. Do you even try?',
          'How do you handle mixed sentiment in one review?',
        ],
        redFlags: [
          'TF-IDF SVM as the final answer in 2026 with no caveat.',
        ],
        scoringRubric: {
          1: 'Add "not" to a stop list.',
          3: 'Mentions context, no eval slice.',
          5: 'Model choice plus a negation holdout.',
        },
      },
      {
        id: 'NLP-F-06',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What is forced alignment, and when do you need it?',
        idealAnswer: {
          coreIdea:
            'Forced alignment maps a known transcript onto the audio timeline. You get word or phone timestamps without asking a full ASR decode to invent the text.',
          keyPoints: [
            'Used to cut training clips, to highlight words in a player, to train TTS.',
            'If the transcript is wrong, the alignment will still try. Garbage in.',
            'Montreal Forced Aligner and similar tools are the usual batch path.',
            'Streaming ASR already emits timestamps. Alignment is for when you already have text.',
          ],
        },
        whyThisMatters: [
          'Speech teams use this weekly. Text-only people blank.',
        ],
        commonPitfalls: [
          'Using ASR on clean studio audio when you already have the script.',
        ],
        followUps: [
          'How do you catch a shifted alignment on a long chapter?',
          'Phone-level vs word-level. When?',
        ],
        redFlags: [
          'Never heard of it in a speech role.',
        ],
        scoringRubric: {
          1: 'Guesses it is diarization.',
          3: 'Correct idea, no use case.',
          5: 'Transcript-to-time plus a training or UI use.',
        },
      },
      {
        id: 'NLP-F-07',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'How do you evaluate a summarizer that is allowed to rephrase?',
        idealAnswer: {
          coreIdea:
            'Split factuality from style. A pretty summary that invents a number is a fail. ROUGE will not save you.',
          keyPoints: [
            'ROUGE is overlap. Same BLEU problem.',
            'QA-based factuality. Generate questions from the source, see if the summary still answers them.',
            'Entity and number matching against the source.',
            'Human Likert on a small weekly set. Cheap if you sample well.',
            'Task success. Did the support agent resolve the ticket with the summary?',
          ],
        },
        whyThisMatters: [
          'Summarization is in every NLP + LLM job now.',
        ],
        commonPitfalls: [
          'ROUGE-L as the KPI.',
          'No number check.',
        ],
        followUps: [
          'How do you handle a source that already has errors?',
          'What if the summary must stay under 40 words?',
        ],
        redFlags: [
          'LLM-as-judge only, no gold checks.',
        ],
        scoringRubric: {
          1: 'ROUGE.',
          3: 'Mentions factuality, no method.',
          5: 'Numbers/entities plus a task metric.',
        },
      },
      {
        id: 'NLP-F-08',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'Byte-level vs word-piece vs character models. When do you want bytes?',
        idealAnswer: {
          coreIdea:
            'Bytes never UNK. They cost sequence length. Use them when you see lots of messy Unicode, code, or languages your word-piece vocab butchered.',
          keyPoints: [
            'Word-piece. Short sequences, brittle on new scripts and typos.',
            'Characters. Long sequences, simple, slow.',
            'Bytes / byte-fallback. One vocabulary for everything, longer contexts.',
            'A 4x longer sequence can wipe a latency budget even if vocab is "solved".',
            'Measure both UNK rate and tokens per document, not just one.',
          ],
        },
        whyThisMatters: [
          'Multilingual and code models live here.',
        ],
        commonPitfalls: [
          'Changing tokenizer and reusing old positional stats blindly.',
        ],
        followUps: [
          'How does this interact with a 8k context window?',
          'Why did GPT-4o-class models talk about a new tokenizer?',
        ],
        redFlags: [
          'One vocab forever.',
        ],
        scoringRubric: {
          1: 'Bytes are more accurate.',
          3: 'UNK vs length, no product call.',
          5: 'Picks bytes for a messy domain and names the length tax.',
        },
      },
      {
        id: 'NLP-F-09',
        difficulty: 'Foundation',
        category: 'Practical',
        expectedTime: '60-90 seconds',
        question: 'A user wants speaker labels on a 1-hour meeting. What do you actually ship?',
        idealAnswer: {
          coreIdea:
            'Diarization plus ASR, then a pass that attaches names if you have them. Do not promise perfect names from audio alone.',
          keyPoints: [
            'VAD, then embeddings, then cluster. That gives you Speaker 1 / Speaker 2.',
            'Names need a roster, a voice enrollment, or a human map.',
            'Overlapped speech is still ugly. Say so.',
            'Chunk the hour. A single 60-minute decode will OOM or drift.',
            'Show word-level timestamps so people can jump. That is the product.',
          ],
        },
        whyThisMatters: [
          'Meeting tools are the speech product people interview on.',
        ],
        commonPitfalls: [
          'One giant file into a black-box API.',
          'Promising names with no enrollment.',
        ],
        followUps: [
          'How do you evaluate diarization? (DER)',
          'What if two people sound similar?',
        ],
        redFlags: [
          'We will just prompt Gemini with the wav.',
        ],
        scoringRubric: {
          1: 'One API call.',
          3: 'ASR + speaker tags, no names caveat.',
          5: 'Diarize, transcribe, optional names, timestamps.',
        },
      },
      {
        id: 'NLP-F-10',
        difficulty: 'Foundation',
        category: 'Knowledge',
        expectedTime: '60-90 seconds',
        question: 'What is a language ID mistake that wrecks a pipeline, and how do you guard it?',
        idealAnswer: {
          coreIdea:
            'A wrong LID routes the text into the wrong model. Short strings and names are where LID dies. Do not LID a 3-word query if you can avoid it.',
          keyPoints: [
            'Short queries look like several languages.',
            'Code-switched chat will pick one and drop the other.',
            'A confidence threshold plus a default "unknown" path.',
            'For search, a multilingual retriever often beats a brittle LID gate.',
            'Log LID and let users override. They know their language.',
          ],
        },
        whyThisMatters: [
          'International products fail here first.',
        ],
        commonPitfalls: [
          'Hard routing on argmax LID for tweets.',
        ],
        followUps: [
          'How do you test LID on names of people and cities?',
          'When is script detection enough?',
        ],
        redFlags: [
          'LID is solved.',
        ],
        scoringRubric: {
          1: 'Run langdetect.',
          3: 'Knows short-text failure, no fallback.',
          5: 'Threshold, default path, or skip LID.',
        },
      },
    ],
    Advanced: [
      {
        id: 'NLP-A-01',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design an on-device ASR path that must return a partial transcript under 300 ms.',
        idealAnswer: {
          coreIdea:
            'Streaming encoder, small decoder, local VAD. Cloud is a fallback for the final polish, not the first token.',
          keyPoints: [
            'Push-to-talk or always-on VAD so you are not decoding silence.',
            'A streaming model (transducer / CTC-like) for partials. A larger rescorer can run at end-of-utterance.',
            'Quantize. INT8. Measure WER on the device, not on a server GPU.',
            'Domain boosting for contacts and commands. A general model will miss "play Dua Lipa".',
            'If the network is there, you can dual-decode and swap in the cloud final. The UI already showed partials.',
          ],
        },
        whyThisMatters: [
          'Speech systems jobs. Latency is the product.',
        ],
        commonPitfalls: [
          'Waiting for a full-file whisper.cpp run.',
          'No on-device vocab boost.',
        ],
        followUps: [
          'How do you update the contact list weekly?',
          'What is your battery budget?',
        ],
        redFlags: [
          'Send every buffer to the cloud.',
        ],
        scoringRubric: {
          1: 'Call Whisper API.',
          3: 'On-device model, no streaming.',
          5: 'Streaming partials, boost, optional cloud final.',
        },
      },
      {
        id: 'NLP-A-02',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '3-4 minutes',
        question: 'How do you train a domain ASR model when you only have 20 hours of labeled audio?',
        idealAnswer: {
          coreIdea:
            'Start from a strong pretrained ASR, fine-tune lightly, and spend most of the week on text for an LM / biasing, not on hoping 20 hours is a new foundation model.',
          keyPoints: [
            'Fine-tune a wav2vec / Whisper-class encoder. Freeze early layers if you overfit.',
            'Language model fusion or contextual biasing on in-domain text, which you usually have more of.',
            'Speed perturbation and noise. Do not invent speakers you do not have.',
            'Pseudo-label unlabeled in-domain audio with a teacher, then filter on confidence.',
            'Eval on a set that looks like production, not on the 20-hour leftover.',
          ],
        },
        whyThisMatters: [
          'Nobody has 10k hours of their call center.',
        ],
        commonPitfalls: [
          'Training from scratch.',
          'Reporting WER on the fine-tune set.',
        ],
        followUps: [
          'How do you know pseudo-labels are not teaching errors?',
          'When do you stop fine-tuning the encoder?',
        ],
        redFlags: [
          '20 hours is enough from random init.',
        ],
        scoringRubric: {
          1: 'Train DeepSpeech from scratch.',
          3: 'Fine-tune, no text biasing.',
          5: 'Pretrain + light FT + text / pseudo-label plan.',
        },
      },
      {
        id: 'NLP-A-03',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design a multilingual search stack for support articles in 12 languages.',
        idealAnswer: {
          coreIdea:
            'Embed with a multilingual model into one space, keep language as a filter, and do not machine-translate the corpus unless you have to.',
          keyPoints: [
            'One vector index with a language field. Filter when the user wants only their locale.',
            'A multilingual embedder beats 12 monolingual indexes you will not maintain.',
            'Translate the query only if recall is weak. Translating the whole corpus doubles freshness pain.',
            'Hybrid. BM25 on the original script still helps exact error codes.',
            'Eval per language. An average hides that Thai is broken.',
          ],
        },
        whyThisMatters: [
          'NLP + retrieval crossover. Very common now.',
        ],
        commonPitfalls: [
          'Translate everything to English first, forever.',
          'One global recall number.',
        ],
        followUps: [
          'How do you handle a user who types Romanized Hindi?',
          'What if legal pages must not be cross-lingual?',
        ],
        redFlags: [
          'English-only embedder plus Google Translate.',
        ],
        scoringRubric: {
          1: 'Translate to English.',
          3: 'Multilingual embeddings, no per-language eval.',
          5: 'One index, filters, hybrid, per-language slices.',
        },
      },
      {
        id: 'NLP-A-04',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you keep TTS from saying a product name wrong after marketing changes the pronunciation?',
        idealAnswer: {
          coreIdea:
            'A pronunciation lexicon owned by the brand team, not a hope that the next checkpoint learned it. SSML or phoneme overrides on those tokens.',
          keyPoints: [
            'Store grapheme-to-phoneme overrides.',
            'A test clip per name in CI. Listen or use a small ASR-in-the-loop check.',
            'Do not fine-tune the whole TTS for one name if a lexicon slot exists.',
            'Numbers, currencies, and URLs need their own verbalization rules.',
            'Ship the lexicon independently of the acoustic model.',
          ],
        },
        whyThisMatters: [
          'This is how TTS teams spend their week.',
        ],
        commonPitfalls: [
          'Retrain the voice.',
          'No listening test.',
        ],
        followUps: [
          'How do you handle homographs like "read"?',
          'What if the name is in another script?',
        ],
        redFlags: [
          'The model will pick it up.',
        ],
        scoringRubric: {
          1: 'Retrain.',
          3: 'Mentions SSML, no test.',
          5: 'Lexicon, CI clip, independent ship.',
        },
      },
      {
        id: 'NLP-A-05',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'Your NER F1 is 0.91 and the business still hates it. Why?',
        idealAnswer: {
          coreIdea:
            'Micro-F1 on easy types (DATE, MONEY) hides that ORG and PRODUCT are 0.6. Also token-F1 is kinder than exact-span F1.',
          keyPoints: [
            'Report per type, not one number.',
            'Exact span match. Partial overlap can be useless for a highlighter.',
            'Error taxonomy. Boundary, type, missing, spurious.',
            'Ask which errors cost money. Missing a party name is not the same as tagging a weekday.',
            'A confusion matrix on types. DATE vs DURATION is a real fight.',
          ],
        },
        whyThisMatters: [
          'Metric theatre is the usual NER failure.',
        ],
        commonPitfalls: [
          'Token-level F1 as the headline.',
          'No per-type table.',
        ],
        followUps: [
          'How do you score nested entities?',
          'What if annotators disagree on 20% of ORG spans?',
        ],
        redFlags: [
          'One F1, ship.',
        ],
        scoringRubric: {
          1: 'Need more data.',
          3: 'Per-type, no span-vs-token.',
          5: 'Per-type exact span plus a costed error taxonomy.',
        },
      },
      {
        id: 'NLP-A-06',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design PII redaction for support transcripts that still lets an agent search.',
        idealAnswer: {
          coreIdea:
            'Detect, replace with stable tokens, index the tokens, keep the raw audio/text in a tighter vault. Search runs on the redacted copy.',
          keyPoints: [
            'NER + regex + checksums for IDs. Models miss formatted account numbers.',
            'Replace with [EMAIL_17] not with nothing, or you break coreference.',
            'A mapping table in a locked store if an agent with a role can reveal.',
            'Re-run redaction when the detector improves. Version the policy.',
            'Eval with a planted-PII set. Recall on PII matters more than precision, with a human review for over-redaction.',
          ],
        },
        whyThisMatters: [
          'NLP plus security. Common in support AI.',
        ],
        commonPitfalls: [
          'Deleting the span and leaving "please contact ".',
          'No planted test set.',
        ],
        followUps: [
          'What about PII inside screenshots?',
          'How do you handle a customer who pastes a password?',
        ],
        redFlags: [
          'The LLM will not repeat it if we ask nicely.',
        ],
        scoringRubric: {
          1: 'Prompt the model to ignore PII.',
          3: 'Regex emails, nothing else.',
          5: 'Detector mix, stable tokens, vault, planted eval.',
        },
      },
      {
        id: 'NLP-A-07',
        difficulty: 'Advanced',
        category: 'Practical',
        expectedTime: '2-3 minutes',
        question: 'How do you know a new embedding model is better for retrieval, not just on MTEB?',
        idealAnswer: {
          coreIdea:
            'Re-embed a golden query set from your corpus and look at recall@k and the actual docs. MTEB does not contain your ticket titles.',
          keyPoints: [
            'A frozen 200-query, judged set from production logs.',
            'Recall@10 and nDCG. Also "did the known doc make the top 5".',
            'Watch index size and query latency. A 1024-d model may not be worth 2 points.',
            'Re-embed cost. A full corpus rebuild needs a plan.',
            'Side-by-side on 20 failures of the old model. If those are still failures, the leaderboard did not help.',
          ],
        },
        whyThisMatters: [
          'Everyone wants to swap embedders every quarter.',
        ],
        commonPitfalls: [
          'MTEB as the decision.',
          'No rebuild cost.',
        ],
        followUps: [
          'How do you A/B two indexes without doubling RAM forever?',
          'What if only one tenant gets worse?',
        ],
        redFlags: [
          'New model, higher MTEB, ship Friday.',
        ],
        scoringRubric: {
          1: 'MTEB.',
          3: 'Internal recall, no rebuild plan.',
          5: 'Judged set, slices, cost, failed-query review.',
        },
      },
      {
        id: 'NLP-A-08',
        difficulty: 'Advanced',
        category: 'Architecture',
        expectedTime: '3-4 minutes',
        question: 'Design a human-in-the-loop path for a medical note summarizer.',
        idealAnswer: {
          coreIdea:
            'The model drafts. A clinician accepts, edits, or rejects. You never auto-file. You learn from the edits.',
          keyPoints: [
            'Show source highlights next to each sentence in the draft.',
            'Hard stop on numbers, meds, and allergies. Those spans need a click.',
            'Log the edit diff. That is your next SFT set, with consent.',
            'Latency can be seconds. This is not autocomplete in a game.',
            'A reject rate dashboard. If rejects jump after a prompt change, roll back.',
          ],
        },
        whyThisMatters: [
          'High-stakes NLP. They want restraint.',
        ],
        commonPitfalls: [
          'Auto-write to the chart.',
          'No link back to the source sentence.',
        ],
        followUps: [
          'How do you handle a note that cites a lab the model never saw?',
          'What is your liability line in the UI?',
        ],
        redFlags: [
          'The model is accurate enough to skip review.',
        ],
        scoringRubric: {
          1: 'Generate and save.',
          3: 'Human review, no source links.',
          5: 'Draft, linked evidence, required clicks, edit mining.',
        },
      },
    ],
  },
};
