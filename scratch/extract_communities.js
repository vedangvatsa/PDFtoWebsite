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

    // Check if new group starts
    if (line.startsWith('  - name:')) {
      if (currentGroup) groups.push(currentGroup);
      currentGroup = {
        name: trimmed.substring(trimmed.indexOf(':') + 1).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'),
        platform: '',
        url: '',
        locations: []
      };
      inLocations = false;
      currentLoc = null;
      continue;
    }

    if (!currentGroup) continue;

    // Parse keys inside the group
    if (line.startsWith('    platform:')) {
      currentGroup.platform = trimmed.substring(trimmed.indexOf(':') + 1).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      inLocations = false;
    } else if (line.startsWith('    url:')) {
      currentGroup.url = trimmed.substring(trimmed.indexOf(':') + 1).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      inLocations = false;
    } else if (line.startsWith('    locations:')) {
      inLocations = true;
    } else if (inLocations) {
      if (line.startsWith('      - continent:')) {
        currentLoc = { continent: trimmed.substring(trimmed.indexOf(':') + 1).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1') };
        currentGroup.locations.push(currentLoc);
      } else if (line.startsWith('        country_id:') && currentLoc) {
        currentLoc.country_id = trimmed.substring(trimmed.indexOf(':') + 1).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      } else if (line.startsWith('        city:') && currentLoc) {
        currentLoc.city = trimmed.substring(trimmed.indexOf(':') + 1).trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
      } else if (!line.startsWith('      ')) {
        // exited locations section
        inLocations = false;
      }
    }
  }
  if (currentGroup) groups.push(currentGroup);
  return groups;
}

(async () => {
  try {
    console.log("Loading nomad-cities.json...");
    const citiesFile = fs.readFileSync('public/nomad-cities.json', 'utf8');
    const cities = JSON.parse(citiesFile);
    
    const citySlugMap = {};
    cities.forEach(c => {
      const normName = c.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!citySlugMap[normName]) {
        citySlugMap[normName] = [];
      }
      citySlugMap[normName].push(c.slug);
    });

    // Manual aliases mapping from lowercase YAML city name to list of our slugs
    const aliases = {
      'ho chi minh': ['ho-chi-minh-city'],
      'bali': ['bali', 'canggu', 'bali-cangguubud'],
      'gran canaria': ['las-palmas', 'gran-canaria-las-palmas'],
      'marrakect': ['marrakech'],
      'florianopolis': ['florianopolis', 'florianopolis-2'],
      'funchal': ['madeira-funchal'],
      'madeira': ['madeira-funchal'],
      'makati': ['manila'],
      'cebu city': ['cebu'],
      'são paulo': ['sao-paulo'],
      'sao paulo': ['sao-paulo'],
      'medellín': ['medellin'],
      'medellin': ['medellin'],
      'oaxaca city': ['oaxaca'],
      'oaxaca': ['oaxaca']
    };

    console.log("Downloading groups YAML...");
    const yaml = await downloadYaml();
    console.log(`Downloaded ${yaml.length} bytes of YAML.`);

    console.log("Parsing YAML...");
    const allGroups = parseYaml(yaml);
    console.log(`Parsed ${allGroups.length} groups.`);

    // Match groups to our 95 cities
    const cityCommunities = {};
    cities.forEach(c => {
      cityCommunities[c.slug] = [];
    });

    for (let group of allGroups) {
      if (!group.locations || group.locations.length === 0) continue;
      // Skip WhatsApp groups as their invite links expire/change frequently
      if (group.platform === 'whatsapp') continue;

      const matchedSlugsThisGroup = new Set();
      
      for (let loc of group.locations) {
        if (!loc.city) continue;
        const normalizedCity = loc.city.toLowerCase().trim();
        
        let targetSlugs = [];
        if (aliases[normalizedCity]) {
          targetSlugs = aliases[normalizedCity];
        } else {
          const cleanCityName = normalizedCity.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (citySlugMap[cleanCityName]) {
            targetSlugs = citySlugMap[cleanCityName];
          }
        }
        
        for (let slug of targetSlugs) {
          if (!matchedSlugsThisGroup.has(slug)) {
            matchedSlugsThisGroup.add(slug);
            const exists = cityCommunities[slug].some(item => item.url === group.url);
            if (!exists) {
              cityCommunities[slug].push({
                name: group.name,
                platform: group.platform,
                url: group.url
              });
            }
          }
        }
      }
    }

    // Print summary stats
    let totalMatched = 0;
    const stats = [];
    for (let slug in cityCommunities) {
      const count = cityCommunities[slug].length;
      totalMatched += count;
      if (count > 0) {
        stats.push({ slug, count });
      }
    }

    stats.sort((a, b) => b.count - a.count);
    console.log(`Matched ${totalMatched} local groups across ${stats.length} cities.`);
    console.log("Top matched cities:", stats.slice(0, 10));

    // Save mapping to public/nomad-communities.json
    fs.writeFileSync('public/nomad-communities.json', JSON.stringify(cityCommunities, null, 2));
    console.log("Successfully wrote public/nomad-communities.json");

  } catch (err) {
    console.error("Error:", err);
  }
})();
