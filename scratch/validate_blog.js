const fs = require('fs');

const BANNED_WORDS = [
  'utilize', 'leverage', 'robust', 'delve', 'navigate', 'elevate', 'unlock', 
  'streamline', 'facilitate', 'foster', 'empower', 'holistic', 'comprehensive', 
  'innovative', 'seamlessly', 'pivotal', 'crucial', 'cutting-edge', 'groundbreaking', 
  'game-changing', "In today's fast-paced world", "At the end of the day"
];

function validateBlog(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract text inside tags like <p>, <h2>, <h3>, <li>, etc.
  const regex = /<p[^>]*>([\s\S]*?)<\/p>|<li[^>]*>([\s\S]*?)<\/li>|<h[23][^>]*>([\s\S]*?)<\/h[23]>/g;
  let match;
  let errors = [];
  let lineNum = 1;

  // Let's also do a simple check of the whole file for colons/em-dashes outside of tags/code
  // but to be precise, let's look at the extracted text content.
  while ((match = regex.exec(content)) !== null) {
    const rawText = match[1] || match[2] || match[3] || '';
    const cleanText = rawText.replace(/<[^>]+>/g, '').trim();

    // Check colons
    if (cleanText.includes(':')) {
      errors.push(`Colon found in text: "${cleanText}"`);
    }

    // Check em-dashes and en-dashes
    if (cleanText.includes('—') || cleanText.includes('–')) {
      errors.push(`Dash (— or –) found in text: "${cleanText}"`);
    }

    // Check banned words
    for (const word of BANNED_WORDS) {
      const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const wordRegex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (wordRegex.test(cleanText)) {
        errors.push(`Banned word "${word}" found in text: "${cleanText}"`);
      }
    }
  }

  // Check for the word "resume" (except as allowed by prompt rules, e.g. "interactive resume" or "resume parser")
  // Let's verify all instances of "resume"
  const resumeMatches = content.match(/\bresumes?\b/ig) || [];
  if (resumeMatches.length > 0) {
    // Look at each match
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (/\bresumes?\b/i.test(line)) {
        // Allow "interactive resume" or "resume parser"
        const cleanLine = line.toLowerCase();
        const hasInteractiveResume = cleanLine.includes('interactive resume') || cleanLine.includes('interactive resumes');
        const hasResumeParser = cleanLine.includes('resume parser') || cleanLine.includes('resume parsers');
        if (!hasInteractiveResume && !hasResumeParser && !line.includes('title:') && !line.includes('slug:')) {
          errors.push(`Potential violation of "resume" rule on line ${idx + 1}: "${line.trim()}"`);
        }
      }
    });
  }

  if (errors.length > 0) {
    console.error(`Errors found in ${filePath}:`);
    errors.forEach(e => console.error(`  - ${e}`));
    return false;
  } else {
    console.log(`File ${filePath} is fully compliant!`);
    return true;
  }
}

const file = process.argv[2];
if (file) {
  validateBlog(file);
} else {
  console.error("Please provide a file path.");
}
