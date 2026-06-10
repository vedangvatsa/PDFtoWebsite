const fs = require('fs');
const path = require('path');

const dataPath = '/Users/vedang/.gemini/antigravity/scratch/PDFtoWebsite/public/nomad-data-v2.json';
const v2 = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const CATEGORIES = ['coliving', 'hostel', 'apartment', 'guesthouse', 'coworking'];

function expandV2(v2Data) {
  const { c: cityLookup, d: rows } = v2Data;
  const result = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cityCountry = cityLookup[row[5]];
    if (!cityCountry) {
      console.error(`Missing lookup index ${row[5]} at row ${i}`);
      continue;
    }
    const sepIdx = cityCountry.indexOf('|');
    const city = cityCountry.substring(0, sepIdx);
    const country = cityCountry.substring(sepIdx + 1);

    result.push({
      osm_id: row[0],
      name: row[1],
      category: CATEGORIES[row[2]],
      lat: row[3],
      lon: row[4],
      city,
      country
    });
  }

  return result;
}

const expanded = expandV2(v2);
console.log("Total expanded places:", expanded.length);

const chiangMaiFilter = "chiang-mai";
const matched = expanded.filter(p => {
  const slug = p.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '');
  return slug === chiangMaiFilter;
});

console.log("Matched places for 'chiang-mai':", matched.length);
if (matched.length > 0) {
  console.log("Sample matched place:", matched[0]);
} else {
  // Let's print unique slugs generated for cities in the database
  const uniqueSlugs = Array.from(new Set(expanded.map(p => p.city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, ''))));
  console.log("Sample generated slugs (first 20):", uniqueSlugs.slice(0, 20));
}
