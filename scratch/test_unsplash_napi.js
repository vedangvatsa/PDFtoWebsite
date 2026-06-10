const https = require('https');

function fetchNapi(query) {
  return new Promise((resolve) => {
    const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=3`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve({ error: 'JSON parse error', status: res.statusCode, body: data.slice(0, 200) });
        }
      });
    }).on('error', (err) => resolve({ error: err.message }));
  });
}

(async () => {
  console.log("Fetching Da Nang...");
  const res = await fetchNapi("da nang");
  console.log(JSON.stringify(res, null, 2).slice(0, 1000));
})();
