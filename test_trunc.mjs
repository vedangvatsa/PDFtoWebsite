function safelyTruncate(text, limit = 280) {
  if (text.length <= limit) return text;
  const urlMatch = text.match(/\n(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)$/i);
  if (!urlMatch) {
    return text.substring(0, limit - 1).replace(/\n[^\n]*$/, '') + '…';
  }
  const url = urlMatch[1];
  const urlChunk = '\n\n' + url;
  const rawText = text.slice(0, text.length - urlMatch[0].length).trim();
  const allowedLength = limit - urlChunk.length - 1;
  const truncatedText = rawText.substring(0, allowedLength).replace(/\n[^\n]*$/, '') + '…';
  return truncatedText + urlChunk;
}
const test1 = '8/ Stanford CS229 - Machine Learning (Full Course on YouTube)\n\nThe Stanford ML course that started it all.\n\n20 lectures. Andrew Ng era.\n\nMore math-heavy than Coursera version. Great if you want the theory depth.\n\nyoutube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU';
const res = safelyTruncate(test1, 270);
console.log(res);
