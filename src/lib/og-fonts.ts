const cache = new Map<string, Promise<FontData[]>>();

export type FontData = {
  name: string;
  data: ArrayBuffer;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: 'normal';
};

/** Load Inter (the CVin.Bio brand font) for next/og ImageResponse canvases. */
export function loadInterFont(weights: FontData['weight'][] = [400, 500, 700, 800]): Promise<FontData[]> {
  const key = weights.join(',');
  if (!cache.has(key)) {
    cache.set(
      key,
      (async () => {
        const css = await fetch(
          `https://fonts.googleapis.com/css2?family=Inter:wght@${weights.join(';')}&display=swap`,
          { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }
        ).then((r) => r.text());
        const blocks = [...css.matchAll(/@font-face\s*{([^}]+)}/g)];
        const out: FontData[] = [];
        for (const block of blocks) {
          const urlMatch = block[1].match(/url\((https:\/\/[^)]+)\)/);
          const weightMatch = block[1].match(/font-weight:\s*(\d+)/);
          if (!urlMatch) continue;
          const buf = await (await fetch(urlMatch[1])).arrayBuffer();
          const w = Number(weightMatch?.[1] || 400);
          out.push({
            name: 'Inter',
            data: buf,
            weight: (w as FontData['weight']) || 400,
            style: 'normal',
          });
        }
        return out;
      })()
    );
  }
  return cache.get(key)!;
}
