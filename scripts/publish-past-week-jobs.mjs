#!/usr/bin/env node
/**
 * scripts/publish-past-week-jobs.mjs
 * 
 * Tags all eligible un-published jobs created in the past 7–14 days
 * with 'curated-jd' so their dedicated job pages render live on cvin.bio.
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

async function publishPastWeekJobs() {
  const cutoffDate = new Date(Date.now() - 14 * 86400000).toISOString();
  console.log(`Ingesting and publishing jobs created since ${cutoffDate}...`);

  let page = 0;
  const pageSize = 1000;
  let totalPublished = 0;

  while (true) {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, title, company, tags, description, apply_url')
      .gte('created_at', cutoffDate)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error fetching jobs batch:', error);
      break;
    }

    if (!jobs || jobs.length === 0) break;

    console.log(`Processing batch ${page + 1} (${jobs.length} jobs)...`);
    let batch = [];

    for (const j of jobs) {
      const tags = Array.isArray(j.tags) ? [...j.tags] : [];
      if (tags.includes('curated-jd')) continue;

      if (!j.description) continue;
      const wordCount = j.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;
      if (wordCount < 600) continue;

      tags.push('curated-jd');
      batch.push({ id: j.id, tags });

      if (batch.length >= BATCH_SIZE) {
        await updateBatch(batch);
        totalPublished += batch.length;
        console.log(`Published ${totalPublished} job pages...`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await updateBatch(batch);
      totalPublished += batch.length;
    }

    page++;
  }

  console.log(`\n🎉 Successfully published ${totalPublished} new dedicated job pages on cvin.bio!`);
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

publishPastWeekJobs();
