const fs = require('fs');
const https = require('https');

function downloadYaml() {
  return new Promise((resolve, reject) => {
    https.get('https://raw.githubusercontent.com/rignaneseleo/groups-for-nomads/main/data.yaml', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', err => reject(err));
  });
}

function parseYaml(yamlText) {
  const lines = yamlText.split('\n');
  const groups = [];
  let currentGroup = null;
  let inLocations = false;
  let currentLoc = null;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (line.startsWith('  - name:')) {
      if (currentGroup) groups.push(currentGroup);
      currentGroup = {
        name: trimmed.substring('name:'.length).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'),
        locations: []
      };
      inLocations = false;
      currentLoc = null;
      continue;
    }

    if (!currentGroup) continue;

    if (line.startsWith('    locations:')) {
      inLocations = true;
    } else if (inLocations) {
      if (line.startsWith('      - continent:')) {
        currentLoc = { continent: trimmed.substring('- continent:'.length).trim() };
        currentGroup.locations.push(currentLoc);
      } else if (line.startsWith('        country_id:') && currentLoc) {
        currentLoc.country_id = trimmed.substring('country_id:'.length).trim();
      } else if (line.startsWith('        city:') && currentLoc) {
        currentLoc.city = trimmed.substring('city:'.length).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      } else if (!line.startsWith('      ')) {
        inLocations = false;
      }
    }
  }
  if (currentGroup) groups.push(currentGroup);
  return groups;
}

(async () => {
  try {
    const citiesFile = fs.readFileSync('public/nomad-cities.json', 'utf8');
    const cities = JSON.parse(citiesFile);
    
    const yaml = await downloadYaml();
    const allGroups = parseYaml(yaml);

    // Get unique cities in YAML
    const yamlCities = new Set();
    allGroups.forEach(g => {
      if (g.locations) {
        g.locations.forEach(loc => {
          if (loc.city) yamlCities.add(loc.city);
        });
      }
    });

    const yamlCitiesArr = Array.from(yamlCities).sort();
    console.log(`Unique cities in YAML: ${yamlCitiesArr.length}`);
    console.log(yamlCitiesArr.join(', '));

    // Check which of our cities are NOT matched
    const unmatched = [];
    const matched = [];
    cities.forEach(c => {
      const nameLower = c.name.toLowerCase();
      let found = false;
      for (let yc of yamlCities) {
        if (yc.toLowerCase() === nameLower) {
          found = true;
          break;
        }
      }
      if (found) {
        matched.push(c.name);
      } else {
        unmatched.push(c);
      }
    });

    console.log(`\nUnmatched cities (${unmatched.length} out of ${cities.length}):`);
    console.log(unmatched.map(c => `${c.name} (${c.country})`).join(', '));

    // Try fuzzy matches or variations
    console.log("\nPotential Matches/Aliases in YAML:");
    unmatched.forEach(c => {
      const name = c.name;
      const candidates = yamlCitiesArr.filter(yc => {
        const ycLower = yc.toLowerCase();
        const nLower = name.toLowerCase();
        return ycLower.includes(nLower) || nLower.includes(ycLower) || 
               (ycLower.replace(/ /g, '') === nLower.replace(/ /g, '')) ||
               (ycLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === nLower.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      });
      if (candidates.length > 0) {
        console.log(`- Our city: "${name}" (${c.country}) -> YAML Candidates: ${candidates.map(x => `"${x}"`).join(', ')}`);
      }
    });

  } catch (err) {
    console.error("Error:", err);
  }
})();
