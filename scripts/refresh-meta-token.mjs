#!/usr/bin/env node
/**
 * Meta Token Refresher
 * 
 * Exchanges a short-lived Page Access Token for a NEVER-EXPIRING one.
 * 
 * Usage:
 *   1. Go to https://developers.facebook.com/tools/explorer/
 *   2. Select your app, click "Generate Access Token"
 *   3. Grant permissions: pages_manage_posts, pages_read_engagement, 
 *      instagram_basic, instagram_content_publish
 *   4. Copy the token
 *   5. Run: node scripts/refresh-meta-token.mjs <SHORT_LIVED_TOKEN> <APP_ID> <APP_SECRET>
 *
 * If you don't know your App ID/Secret:
 *   Go to https://developers.facebook.com/apps/ → Your App → Settings → Basic
 */

const SHORT_TOKEN = process.argv[2];
const APP_ID = process.argv[3];
const APP_SECRET = process.argv[4];
const PAGE_ID = process.env.META_PAGE_ID || '2076566222625833';

if (!SHORT_TOKEN || !APP_ID || !APP_SECRET) {
  console.error(`
Usage: node scripts/refresh-meta-token.mjs <SHORT_TOKEN> <APP_ID> <APP_SECRET>

Steps:
  1. Go to https://developers.facebook.com/tools/explorer/
  2. Select your app → Get User Token
  3. Check these permissions:
     - pages_manage_posts
     - pages_read_engagement  
     - instagram_basic
     - instagram_content_publish
  4. Click "Generate Access Token" and copy it
  5. Find your App ID + App Secret at:
     https://developers.facebook.com/apps/ → Settings → Basic
  6. Run this script with all 3 values
`);
  process.exit(1);
}

async function main() {
  console.log('Step 1: Exchanging short-lived USER token for long-lived USER token...');
  
  const longLivedRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${SHORT_TOKEN}`
  );
  const longLivedData = await longLivedRes.json();
  
  if (longLivedData.error) {
    console.error('❌ Failed to exchange token:', longLivedData.error.message);
    process.exit(1);
  }
  
  const longLivedUserToken = longLivedData.access_token;
  console.log('✅ Got long-lived user token (60 days)');
  
  console.log('\nStep 2: Getting NEVER-EXPIRING Page Access Token...');
  
  const pageRes = await fetch(
    `https://graph.facebook.com/v21.0/${PAGE_ID}?fields=access_token&access_token=${longLivedUserToken}`
  );
  const pageData = await pageRes.json();
  
  if (pageData.error) {
    console.error('❌ Failed to get page token:', pageData.error.message);
    process.exit(1);
  }
  
  const pageToken = pageData.access_token;
  
  // Verify it's long-lived
  console.log('\nStep 3: Verifying token...');
  const debugRes = await fetch(
    `https://graph.facebook.com/debug_token?input_token=${pageToken}&access_token=${pageToken}`
  );
  const debugData = await debugRes.json();
  
  const expiresAt = debugData.data?.expires_at;
  if (expiresAt === 0) {
    console.log('✅ Token is NEVER-EXPIRING! ✨');
  } else if (expiresAt) {
    const expDate = new Date(expiresAt * 1000);
    console.log(`⚠️  Token expires: ${expDate.toISOString()}`);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('YOUR NEW NEVER-EXPIRING PAGE TOKEN:');
  console.log(`${'='.repeat(60)}`);
  console.log(pageToken);
  console.log(`${'='.repeat(60)}`);
  
  console.log(`\nNow run these commands to update everywhere:\n`);
  console.log(`# 1. Update GitHub Secret:`);
  console.log(`unset GITHUB_TOKEN && gh secret set META_PAGE_TOKEN --repo vedangvatsa/PDFtoWebsite --body "${pageToken}"`);
  console.log(`\n# 2. Update local .env.local:`);
  console.log(`# Replace the META_PAGE_TOKEN line in /Users/vedang/PDFtoWebsite/.env.local`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
