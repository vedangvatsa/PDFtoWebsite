/**
 * Ping IndexNow for URLs.
 * Usage:
 *   node .github/scripts/ping-indexnow.mjs /pdf-to-website /cv-website-vs-pdf
 *   node .github/scripts/ping-indexnow.mjs --india
 */
import { pingIndexNow } from './lib/indexnow.mjs';

const args = process.argv.slice(2).filter((a) => a !== '--');
const india = args.includes('--india');
const paths = args.filter((a) => a !== '--india');

async function main() {
  let urls = [...paths];
  if (india) {
    urls.push(
      '/indian-army',
      '/mospi',
      '/niti-aayog',
      '/niti-aayog/internship',
      '/mospi/nios',
      '/jobs'
    );
  }
  if (!urls.length) {
    console.error('Usage: node .github/scripts/ping-indexnow.mjs <path...> [--india]');
    process.exit(1);
  }
  const result = await pingIndexNow(urls);
  console.log(result);
  if (!result.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
