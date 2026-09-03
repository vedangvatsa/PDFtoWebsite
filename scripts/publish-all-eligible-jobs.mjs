#!/usr/bin/env node
/**
 * scripts/publish-all-eligible-jobs.mjs
 * 
 * Tags ALL eligible jobs across the entire database (138,000+ total rows)
 * meeting the 600-word floor with 'curated-jd' so their dedicated pages render live on cvin.bio.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

const BATCH_SIZE = 100;
const PAGE_SIZE = 1000;

async function publishAllEligibleJobs() {
  console.log('Publishing ALL eligible jobs across the entire database...');

  let page = 0;
  let totalPublished = 0;

  while (true) {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, title, company, tags, description')
      .not('tags', 'cs', '{"curated-jd"}')
      .range(0, PAGE_SIZE - 1);

    if (error) {
      console.error('Error fetching jobs batch:', error);
      break;
    }

    if (!jobs || jobs.length === 0) {
      console.log('No more un-published jobs found.');
      break;
    }

    console.log(`Processing un-published batch of ${jobs.length} jobs (Total published so far: ${totalPublished})...`);
    let batch = [];
    let skippedCount = 0;

    for (const j of jobs) {
      const tags = Array.isArray(j.tags) ? [...j.tags] : [];
      if (tags.includes('curated-jd')) continue;

      if (!j.description) {
        skippedCount++;
        continue;
      }
      const wordCount = j.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
      if (wordCount < 600) {
        skippedCount++;
        continue;
      }

      tags.push('curated-jd');
      batch.push({ id: j.id, tags });

      if (batch.length >= BATCH_SIZE) {
        await updateBatch(batch);
        totalPublished += batch.length;
        batch = [];
      }
    }

    if (batch.length > 0) {
      await updateBatch(batch);
      totalPublished += batch.length;
    }

    // Break loop if all jobs in current batch were processed or skipped without changes
    if (batch.length === 0 && skippedCount === jobs.length) {
      console.log('All remaining un-published jobs in DB do not meet word count requirements.');
      break;
    }

    page++;
  }

  console.log(`\n🎉 Successfully published ${totalPublished} additional job pages across cvin.bio!`);
}

async function updateBatch(items) {
  await Promise.all(
    items.map(item =>
      supabase
        .from('jobs')
        .update({ tags: item.tags })
        .eq('id', item.id)
    )
  );
}

publishAllEligibleJobs();
