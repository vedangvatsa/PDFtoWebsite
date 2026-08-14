import {
  stripLeakedWriterInstructions,
  descriptionHasWriterLeak,
  normalizeJobDescriptionForStorage,
} from './normalize-job-description.mjs';

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL', msg);
    process.exit(1);
  }
}

const dirty = `DevRel at Anthropic.

About the role
The team works with builders.

Key facts
Location: Remote
Engagement: See source
Compensation: (omit the line if SOURCE has no pay)
Team: (Growth)
- Hours, travel, visa, or deadlines: See source
Only hours, travel, visa, or deadlines stated in SOURCE. Omit the whole section if none.

What you'll do
- Ship docs.
`;

assert(descriptionHasWriterLeak(dirty), 'detects leaked template');

const clean = stripLeakedWriterInstructions(dirty);
assert(!/See source/i.test(clean), `See source gone: ${clean}`);
assert(!/omit the line/i.test(clean), 'omit-the-line gone');
assert(!/Only if SOURCE/i.test(clean) && !/Only hours, travel, visa/i.test(clean), 'SOURCE instruction gone');
assert(/Team: \(Growth\)/.test(clean), `kept Team (Growth): ${clean}`);
assert(/Location: Remote/.test(clean), 'kept Location');
assert(!descriptionHasWriterLeak(clean), `stripped text is clean: ${clean}`);

const stored = normalizeJobDescriptionForStorage(dirty);
assert(stored && !descriptionHasWriterLeak(stored), 'storage normalize is leak-free');
assert(/Ship docs/.test(stored), 'kept real duties');

const keepParens = stripLeakedWriterInstructions('Location: Remote (USA)\nTeam: (Platform)');
assert(/Remote \(USA\)/.test(keepParens), 'kept Remote (USA)');
assert(/Team: \(Platform\)/.test(keepParens), 'kept Team (Platform)');
assert(!descriptionHasWriterLeak(keepParens), 'real parentheticals are not leaks');

const html = '<p>Engagement: See source</p><p>Location: Berlin</p>';
const htmlClean = stripLeakedWriterInstructions(html);
assert(!/See source/i.test(htmlClean), 'html See source gone');
assert(/Berlin/.test(htmlClean), 'html kept location');

const residue = 'Preferred items are not specified in the source.\nThe role is full_time.';
assert(descriptionHasWriterLeak(residue), 'detects not-specified / raw job_type leaks');
const residueClean = stripLeakedWriterInstructions(residue);
assert(!/not specified in the source/i.test(residueClean), `source residue gone: ${residueClean}`);
assert(!/full_time/.test(residueClean), `raw job_type gone: ${residueClean}`);

console.log('ok');
