const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'public', 'nomad-data-v2.json');
const v2 = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const { c: cityLookup } = v2;
const uniqueLookupCities = Array.from(new Set(cityLookup.map(c => c.substring(0, c.indexOf('|')))));

console.log("Unique cities in nomad-data-v2.json:");
console.log(uniqueLookupCities.filter(c => 
  c.toLowerCase().includes('bali') || 
  c.toLowerCase().includes('roat') || 
  c.toLowerCase().includes('ka') || 
  c.toLowerCase().includes('florian')
));
