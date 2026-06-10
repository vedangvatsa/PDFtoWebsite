const fs = require('fs');
const path = require('path');

const citiesPath = path.join(__dirname, '..', 'public', 'nomad-cities.json');
const dataPath = path.join(__dirname, '..', 'public', 'nomad-data-v2.json');

const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
const v2 = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Compact v2 format
const CATEGORIES = ['coliving', 'hostel', 'apartment', 'guesthouse', 'coworking'];
const { c: cityLookup, d: rows } = v2;

// Decompress/expand rows to get list of places
const places = rows.map(row => {
  const cityCountry = cityLookup[row[5]];
  const sepIdx = cityCountry.indexOf('|');
  const cityName = cityCountry.substring(0, sepIdx);
  const countryName = cityCountry.substring(sepIdx + 1);
  return {
    city: cityName,
    country: countryName,
  };
});

console.log(`Loaded ${cities.length} cities and ${places.length} total places.`);

const slugify = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '');
};

const results = [];
for (const city of cities) {
  const targetSlug = city.slug;
  const matched = places.filter(p => {
    const pSlug = slugify(p.city);
    return pSlug === targetSlug;
  });
  
  if (matched.length === 0) {
    results.push({
      name: city.name,
      slug: city.slug,
      expected: city.spaces.total,
      actual: matched.length
    });
  }
}

if (results.length > 0) {
  console.log("Found cities with 0 matches:");
  console.log(results);
} else {
  console.log("All cities matched at least 1 place!");
}
