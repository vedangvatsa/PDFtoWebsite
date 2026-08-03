import { NextRequest, NextResponse } from 'next/server';
import { getProfileBySlug } from '@/lib/supabase-server';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
  }

  // Public, CORS-open AI endpoint — cost control is the priority here.
  const { limited, retryAfter } = rateLimit(req, { windowMs: 60 * 60 * 1000, max: 10, scope: 'autofill-ai' });
  if (limited) return rateLimitResponse(retryAfter);

  const { username, question, jobTitle, company } = await req.json();

  if (!username || typeof username !== 'string' || !question || typeof question !== 'string') {
    return NextResponse.json({ error: 'Missing username or question' }, { status: 400 });
  }
  if (question.length > 500) {
    return NextResponse.json({ error: 'Question is too long (max 500 characters)' }, { status: 400 });
  }
  if ((jobTitle && typeof jobTitle !== 'string') || (company && typeof company !== 'string')) {
    return NextResponse.json({ error: 'Invalid jobTitle or company' }, { status: 400 });
  }
  const cleanQuestion = question.slice(0, 500);
  const cleanJobTitle = (jobTitle || '').slice(0, 200);
  const cleanCompany = (company || '').slice(0, 200);

  // Fetch profile
  const result = await getProfileBySlug(username);
  if (!result) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { profile, workExperience } = result;

  // Build context from profile
  const experienceSummary = workExperience.slice(0, 3).map(job =>
    `${job.title} at ${job.company} (${job.startDate}–${job.endDate || 'Present'}): ${job.description?.slice(0, 300) || ''}`
  ).join('\n');

  const skillsList = (profile.skills || []).join(', ');

  const prompt = `You are filling out a job application for ${profile.fullName}.

PROFILE:
- Name: ${profile.fullName}
- Summary: ${profile.summary || 'N/A'}
- Skills: ${skillsList || 'N/A'}
- Recent Experience:
${experienceSummary || 'N/A'}

${cleanCompany ? `COMPANY: ${cleanCompany}` : ''}
${cleanJobTitle ? `JOB TITLE: ${cleanJobTitle}` : ''}

APPLICATION QUESTION:
"${cleanQuestion}"

Write a compelling, specific, and authentic answer to this question using the profile information above. 
Rules:
- Be concise but substantive (2-4 sentences for short questions, 4-6 for detailed ones)
- Reference specific achievements, numbers, and experiences from the profile
- Sound human and genuine, not AI-generated
- Match the tone to the question (casual if casual, professional if professional)
- Do NOT use buzzwords like "leverage", "synergy", "passionate", "excited"
- Do NOT start with "I am" — vary your sentence structure
- If the question asks "Why [Company]?", mention what the company does and connect it to the candidate's background
- Output ONLY the answer text, no labels or formatting`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    const data = await res.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!answer) {
      return NextResponse.json({ error: 'No answer generated' }, { status: 500 });
    }

    return NextResponse.json({ answer }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
