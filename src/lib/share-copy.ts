// Rotating share copy pools — randomly picked per user so feeds look organic

export const LINKEDIN_CAPTIONS = [
  (s: string) => `Stopped sending PDFs.\n\nHere's my profile instead → https://cvin.bio/${s}`,
  (s: string) => `Killed my resume.pdf. Here's the link.\nhttps://cvin.bio/${s}`,
  (s: string) => `My resume has a URL now.\nhttps://cvin.bio/${s}`,
  (s: string) => `No more "see attached".\nhttps://cvin.bio/${s}`,
  (s: string) => `Recruiters spend 6 seconds on a PDF. Give them something worth clicking.\nhttps://cvin.bio/${s}`,
  (s: string) => `Updated my resume. Didn't attach it.\nhttps://cvin.bio/${s}`,
  (s: string) => `Resume? I've got a link.\nhttps://cvin.bio/${s}`,
  (s: string) => `Just retired resume_final_v3.pdf\nhttps://cvin.bio/${s}`,
  (s: string) => `The attachment era is over.\nhttps://cvin.bio/${s}`,
  (s: string) => `Sharing a link, not a file.\nhttps://cvin.bio/${s}`,
  (s: string) => `My CV is now a website. Wild.\nhttps://cvin.bio/${s}`,
  (s: string) => `No download required.\nhttps://cvin.bio/${s}`,
  (s: string) => `Open to opportunities. Here's my profile → https://cvin.bio/${s}`,
  (s: string) => `Sent my last PDF resume today. Everything else is a link.\nhttps://cvin.bio/${s}`,
  (s: string) => `If you're still emailing PDFs, there's a better way.\nhttps://cvin.bio/${s}`,
];

export const X_COPIES = [
  (s: string) => `stopped attaching resumes\n\ndropped a link instead\nhttps://cvin.bio/${s}`,
  (s: string) => `my resume is a url now\nhttps://cvin.bio/${s}`,
  (s: string) => `pdf resume? nah\n\nhttps://cvin.bio/${s}`,
  (s: string) => `killed my resume.pdf\n\nhttps://cvin.bio/${s} feel free to stalk`,
  (s: string) => `no more "see attached"\n\nhttps://cvin.bio/${s}`,
  (s: string) => `my cv is a link now\nhttps://cvin.bio/${s}`,
  (s: string) => `resume evolution: doc → pdf → link\n\nhttps://cvin.bio/${s}`,
  (s: string) => `finally retired resume.pdf\nhttps://cvin.bio/${s}`,
  (s: string) => `open to work. also open to sharing better than a pdf → https://cvin.bio/${s}`,
  (s: string) => `sharing my profile not a 2mb pdf\nhttps://cvin.bio/${s}`,
  (s: string) => `recruiters: here's the link https://cvin.bio/${s}`,
  (s: string) => `turns out a resume can just be a url\nhttps://cvin.bio/${s}`,
  (s: string) => `your resume can have dark mode\nhttps://cvin.bio/${s}`,
  (s: string) => `dropped the pdf habit\nhttps://cvin.bio/${s}`,
  (s: string) => `no version numbers. no attachments. just a link.\nhttps://cvin.bio/${s}`,
];

export const WHATSAPP_COPIES = [
  (s: string) => `pdf resume? nah\nhere's mine: https://cvin.bio/${s}`,
  (s: string) => `my resume has a url lol\nhttps://cvin.bio/${s}`,
  (s: string) => `bro just share the link\nhttps://cvin.bio/${s}`,
  (s: string) => `no more resume.pdf\nhttps://cvin.bio/${s}`,
  (s: string) => `check my profile: https://cvin.bio/${s}`,
  (s: string) => `my cv is now a website lmao\nhttps://cvin.bio/${s}`,
  (s: string) => `dropped the pdf habit → https://cvin.bio/${s}`,
  (s: string) => `sharing my profile, not a pdf\nhttps://cvin.bio/${s}`,
  (s: string) => `https://cvin.bio/${s} – feel free to share with whoever`,
  (s: string) => `stopped sending pdfs. here's my profile: https://cvin.bio/${s}`,
  (s: string) => `my resume has dark mode now\nhttps://cvin.bio/${s}`,
  (s: string) => `no download needed\nhttps://cvin.bio/${s}`,
  (s: string) => `here's the link instead of a file\nhttps://cvin.bio/${s}`,
  (s: string) => `retired the pdf. got a url.\nhttps://cvin.bio/${s}`,
  (s: string) => `sharing cvin.bio/${s} – way better than a pdf`,
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
