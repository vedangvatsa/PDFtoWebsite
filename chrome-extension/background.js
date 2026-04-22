/* ─── CVin.Bio Quick Apply — Background Service Worker ─── */

const API_BASE = 'https://www.cvin.bio';

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_PROFILE') {
    getProfile().then(sendResponse).catch(e => sendResponse({ error: e.message }));
    return true; // async
  }

  if (msg.type === 'GENERATE_COVER_LETTER') {
    generateCoverLetter(msg.jobInfo, msg.profile).then(sendResponse).catch(e => sendResponse({ error: e.message }));
    return true;
  }

  if (msg.type === 'LOG_APPLICATION') {
    logApplication(msg.jobInfo, msg.profile).then(sendResponse).catch(e => sendResponse({ error: e.message }));
    return true;
  }
});

// Fetch user profile from CVin.Bio
async function getProfile() {
  // First check local cache
  const cached = await chrome.storage.local.get(['profile', 'profileCachedAt']);
  const cacheAge = Date.now() - (cached.profileCachedAt || 0);

  if (cached.profile && cacheAge < 5 * 60 * 1000) {
    return cached.profile;
  }

  // Fetch from CVin.Bio API
  const token = (await chrome.storage.local.get('authToken')).authToken;
  if (!token) throw new Error('Not logged in. Please sign in via the extension popup.');

  const res = await fetch(`${API_BASE}/api/extension/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to fetch profile. Please re-login.');
  const profile = await res.json();

  // Cache it
  await chrome.storage.local.set({ profile, profileCachedAt: Date.now() });
  return profile;
}

// Generate AI cover letter
async function generateCoverLetter(jobInfo, profile) {
  const token = (await chrome.storage.local.get('authToken')).authToken;
  if (!token) throw new Error('Not logged in');

  const res = await fetch(`${API_BASE}/api/ai/cover-letter`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ jobInfo, profile })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cover letter generation failed: ${err}`);
  }
  return res.json();
}

// Log the application
async function logApplication(jobInfo, profile) {
  const token = (await chrome.storage.local.get('authToken')).authToken;
  if (!token) return;

  try {
    await fetch(`${API_BASE}/api/extension/log-application`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        company: jobInfo.company,
        title: jobInfo.title,
        url: jobInfo.url,
        ats: jobInfo.ats,
      })
    });
  } catch (e) {
    console.warn('Failed to log application:', e);
  }
}
