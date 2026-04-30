import re
import os

file_path = '/Users/vedang/PDFtoWebsite/.github/scripts/jobs-sync.mjs'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_str = """      }).filter(j => j.title);
      if (companyJobs.length) console.log(`  ✅ ${slug}: ${companyJobs.length} jobs`);
      jobs.push(...companyJobs);"""

new_str = """      }).filter(j => j.title);

      // --- TECH COMPANY HEURISTIC FILTER ---
      // BambooHR contains many non-tech SMBs.
      // We consider it a tech company if they have at least one engineering/tech role open.
      const isTechCompany = companyJobs.some(j => 
        /engineer|developer|swe|software|frontend|backend|fullstack|data scien|machine learning|ai\\b|product manager|ux design|qa /i.test(j.title)
      );

      if (!isTechCompany) {
        continue;
      }

      if (companyJobs.length) console.log(`  ✅ ${slug}: ${companyJobs.length} jobs (Verified Tech Company)`);
      jobs.push(...companyJobs);"""

if old_str in content:
    content = content.replace(old_str, new_str)
    print("Patched fetchBambooHR successfully!")
else:
    if "isTechCompany" in content:
        print("Already patched fetchBambooHR!")
    else:
        print("Could not find target string in fetchBambooHR.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
