import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const posts = JSON.parse(fs.readFileSync('scratch/final_60_posts.json', 'utf8'));
const imgDir = path.join(import.meta.dirname, '.github/images/viral3');

let success = 0;
let errors = 0;

for (let i = 0; i < posts.length; i++) {
  const p = posts[i];
  const imgFile = p.img.replace('viral3/', '');
  const imgPath = path.join(imgDir, imgFile);
  
  if (!fs.existsSync(imgPath)) {
    console.error(`❌ Missing: ${imgFile}`);
    errors++;
    continue;
  }

  const alt = p.alt || 'Career and workplace insights';
  const ext = path.extname(imgFile).toLowerCase();
  const tmpPath = imgPath + '.tmp' + ext;

  try {
    // Strip ALL metadata and re-encode the image clean
    // -strip removes all profiles and comments
    // Then set clean SEO metadata
    if (ext === '.png') {
      execSync(`magick "${imgPath}" -strip -set comment "${alt}" "${tmpPath}"`, { stdio: 'pipe' });
    } else {
      // For JPEG/JPG - strip and add EXIF comment
      execSync(`magick "${imgPath}" -strip -set comment "${alt}" -quality 95 "${tmpPath}"`, { stdio: 'pipe' });
    }

    // Replace original with cleaned version
    fs.renameSync(tmpPath, imgPath);
    success++;
    
    if (i % 10 === 0) {
      console.log(`✅ ${i + 1}/${posts.length} processed: ${imgFile}`);
    }
  } catch (err) {
    console.error(`❌ Error processing ${imgFile}: ${err.message}`);
    // Clean up temp file if it exists
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    errors++;
  }
}

console.log(`\nDone: ${success} cleaned, ${errors} errors out of ${posts.length} total`);

// Verify a sample image has no Reddit traces
try {
  const sampleImg = path.join(imgDir, posts[0].img.replace('viral3/', ''));
  const output = execSync(`magick identify -verbose "${sampleImg}" 2>/dev/null | grep -iE 'comment|software|source|author|reddit|url|creator' || echo "No suspicious metadata found"`, { encoding: 'utf8' });
  console.log('\nSample metadata check:');
  console.log(output);
} catch (e) {
  console.log('Metadata verification skipped');
}
