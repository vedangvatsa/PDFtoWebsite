// Rotating share copy pools — randomly picked per user so feeds look organic

export const LINKEDIN_CAPTIONS = [
  (s: string) => `Stopped sending my resume as a PDF. Here's the link.\nhttps://cvin.bio/${s}`,
  (s: string) => `My CV is a website now.\nhttps://cvin.bio/${s}`,
  (s: string) => `No more "see attached" from me.\nhttps://cvin.bio/${s}`,
  (s: string) => `Updated my resume. Didn't attach it.\nhttps://cvin.bio/${s}`,
  (s: string) => `Recruiters spend 6 seconds on a PDF. I gave them something worth clicking.\nhttps://cvin.bio/${s}`,
  (s: string) => `My profile lives here now.\nhttps://cvin.bio/${s}`,
  (s: string) => `I retired resume_final_v3.pdf\nhttps://cvin.bio/${s}`,
  (s: string) => `No download required. Here's my profile.\nhttps://cvin.bio/${s}`,
  (s: string) => `Open to new roles. Here's my work.\nhttps://cvin.bio/${s}`,
  (s: string) => `Sharing my profile, not a file.\nhttps://cvin.bio/${s}`,
  (s: string) => `My next role starts with someone clicking this link.\nhttps://cvin.bio/${s}`,
  (s: string) => `I stopped emailing PDFs.\nhttps://cvin.bio/${s}`,
  (s: string) => `My resume is now a link, not an attachment.\nhttps://cvin.bio/${s}`,
  (s: string) => `If you're hiring, here's where to start.\nhttps://cvin.bio/${s}`,
  (s: string) => `Here's where I've been and what I'm building toward.\nhttps://cvin.bio/${s}`,
];

export const X_COPIES = [
  (s: string) => `my resume is a url now\nhttps://cvin.bio/${s}`,
  (s: string) => `stopped attaching my resume. here's the link instead\nhttps://cvin.bio/${s}`,
  (s: string) => `my cv is a link now\nhttps://cvin.bio/${s}`,
  (s: string) => `finally killed my resume.pdf\nhttps://cvin.bio/${s} feel free to stalk`,
  (s: string) => `i retired resume_final_v3.pdf\nhttps://cvin.bio/${s}`,
  (s: string) => `my resume has dark mode now\nhttps://cvin.bio/${s}`,
  (s: string) => `my cv evolution: doc -> pdf -> link\nhttps://cvin.bio/${s}`,
  (s: string) => `dropped my pdf habit\nhttps://cvin.bio/${s}`,
  (s: string) => `my profile, not a 2mb attachment\nhttps://cvin.bio/${s}`,
  (s: string) => `recruiters: here's my link\nhttps://cvin.bio/${s}`,
  (s: string) => `turns out my resume can just be a url\nhttps://cvin.bio/${s}`,
  (s: string) => `no more "see attached" from me\nhttps://cvin.bio/${s}`,
  (s: string) => `my resume is live at https://cvin.bio/${s}`,
  (s: string) => `i stopped sending pdfs. here's my profile\nhttps://cvin.bio/${s}`,
  (s: string) => `my link, not an attachment\nhttps://cvin.bio/${s}`,
];

export const WHATSAPP_COPIES = [
  (s: string) => `my resume is a link now\nhttps://cvin.bio/${s}`,
  (s: string) => `stopped sending pdfs. here's mine: https://cvin.bio/${s}`,
  (s: string) => `here's my profile if you're looking: https://cvin.bio/${s}`,
  (s: string) => `my cv is a website lol\nhttps://cvin.bio/${s}`,
  (s: string) => `replaced my resume with a url\nhttps://cvin.bio/${s}`,
  (s: string) => `my profile is live. https://cvin.bio/${s}`,
  (s: string) => `sharing my link not a pdf\nhttps://cvin.bio/${s}`,
  (s: string) => `i stopped attaching my resume. here's the link instead: https://cvin.bio/${s}`,
  (s: string) => `my resume has no filename anymore\nhttps://cvin.bio/${s}`,
  (s: string) => `here's my profile: https://cvin.bio/${s}`,
  (s: string) => `my cv has dark mode now\nhttps://cvin.bio/${s}`,
  (s: string) => `dropped my pdf. here's my url.\nhttps://cvin.bio/${s}`,
  (s: string) => `https://cvin.bio/${s} my profile if anyone needs it`,
  (s: string) => `my resume is now a website. https://cvin.bio/${s}`,
  (s: string) => `here's mine: https://cvin.bio/${s}`,
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
