import fs from 'fs';
import path from 'path';

const slugMap = {
  'best-job-seeker-tools': 'tools',
  'best-linkedin-alternatives-developers': 'linkedin',
  'best-career-changer-resume-tips': 'career',
  'best-ways-prove-skills-no-degree': 'skills',
  'best-ways-beat-ai-screening': 'screening',
  'best-things-top-resume': 'top',
  'best-portfolio-platforms-developers': 'portfolio',
  'best-resume-keywords-tech': 'keywords',
  'best-ways-send-resume': 'send',
  'best-resume-mistakes': 'mistakes',
  'ai-agents-browsing-resume': 'ai',
  'cv-attachments': 'attachments',
  'mobile-responsive-cv': 'mobile',
  'cv-web-link': 'link',
  'bypass-ats': 'bypass',
  'stand-out-inbox': 'inbox',
  'pdf-breaks-ats': 'pdf',
  'tech-resume-keywords': 'tech-keywords',
  'update-cv-anytime': 'update',
  'objective-statement-death': 'objective',
  'overstuffing-bullets': 'bullets',
  'measuring-impact-no-data': 'impact',
  'short-tenures-tech': 'tenure',
  'keyword-trust': 'trust',
  'soft-skills-evidence': 'soft-skills',
  'the-30-second-scan': 'scan',
  'gap-explanation': 'gaps',
  'academic-to-commercial': 'academic',
  'generic-skill-bars': 'skill-bars',
  'beat-smart-ai-bots': 'bots',
  'where-to-put-ai-skills': 'ai-skills',
  'show-your-code': 'code',
  'college-degrees-matter-less': 'degrees',
  'two-page-resume-myth': 'two-pages'
};

const blogDir = '/Users/vedang/PDFtoWebsite/src/content/blog';
const blogDataPath = '/Users/vedang/PDFtoWebsite/src/lib/blog-data.tsx';
const blogMetadataPath = '/Users/vedang/PDFtoWebsite/src/lib/blog-metadata.ts';

// 1. Rename files in src/content/blog/
console.log('Renaming article component files...');
Object.entries(slugMap).forEach(([oldSlug, newSlug]) => {
  const oldPath = path.join(blogDir, `${oldSlug}.tsx`);
  const newPath = path.join(blogDir, `${newSlug}.tsx`);
  
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${oldSlug}.tsx -> ${newSlug}.tsx`);
  } else {
    console.log(`File not found, skipping rename: ${oldSlug}.tsx`);
  }
});

// 2. Update blog-data.tsx
console.log('Updating blog-data.tsx...');
let blogDataContent = fs.readFileSync(blogDataPath, 'utf-8');
Object.entries(slugMap).forEach(([oldSlug, newSlug]) => {
  // Replace slug: 'old-slug' with slug: 'new-slug'
  const targetStr = `slug: '${oldSlug}'`;
  const replacementStr = `slug: '${newSlug}'`;
  blogDataContent = blogDataContent.split(targetStr).join(replacementStr);
});
fs.writeFileSync(blogDataPath, blogDataContent, 'utf-8');

// 3. Update blog-metadata.ts
console.log('Updating blog-metadata.ts...');
let blogMetadataContent = fs.readFileSync(blogMetadataPath, 'utf-8');
Object.entries(slugMap).forEach(([oldSlug, newSlug]) => {
  const targetStr = `slug: '${oldSlug}'`;
  const replacementStr = `slug: '${newSlug}'`;
  blogMetadataContent = blogMetadataContent.split(targetStr).join(replacementStr);
});
fs.writeFileSync(blogMetadataPath, blogMetadataContent, 'utf-8');

// 4. Update internal links in all component files
console.log('Updating internal links in component files...');
fs.readdirSync(blogDir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(blogDir, file);
    let fileText = fs.readFileSync(filePath, 'utf-8');
    let hasChanges = false;
    
    Object.entries(slugMap).forEach(([oldSlug, newSlug]) => {
      // Look for Link href="/old-slug" or similar
      const targets = [
        `href="/${oldSlug}"`,
        `href='/${oldSlug}'`,
        `href="/${oldSlug}/`,
      ];
      targets.forEach(target => {
        if (fileText.includes(target)) {
          const replacement = target.replace(oldSlug, newSlug);
          fileText = fileText.split(target).join(replacement);
          hasChanges = true;
        }
      });
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, fileText, 'utf-8');
      console.log(`Updated links in: ${file}`);
    }
  }
});

console.log('Successfully completed all renames, metadata updates, and link adjustments!');
