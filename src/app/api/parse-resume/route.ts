import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/utils/supabase/server';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { getClientIp } from '@/lib/rate-limit';
import {
  validateParsedData,
  repairParsedData,
  extractSalvageResumeText,
  ensureMinimalProfile,
  isDisposableProfileSlug,
  nameToProfileSlug,
  enrichNameFromContact,
} from '@/lib/parse-guard';
import { resumeParseContentScore } from '@/lib/resume-parser';
import {
  tryRegexResumeFallback,
  emptyProfileShell,
  scrubProtectedArtifacts,
} from '@/lib/parse-resume-fallback';
import {
  PARSE_SYSTEM_INSTRUCTION,
  PARSE_USER_PROMPT,
  MIN_TEXT_CHARS,
  convertHeicToJpeg,
  callParseAI,
  type OpenAIMessage,
  type ParseMedia,
} from '@/lib/parse-resume-ai';

export const maxDuration = 60;

// Supported file types — accept everything users commonly send as a CV.
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/x-pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/rtf': 'rtf',
  'text/rtf': 'rtf',
  'text/plain': 'txt',
  'text/markdown': 'txt',
  'text/csv': 'txt',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'image/bmp': 'image',
  'image/tiff': 'image',
  'image/tif': 'image',
  'image/heic': 'image-heic',
  'image/heif': 'image-heic',
  // Some browsers send octet-stream / empty MIME — extension fallback handles these.
  'application/octet-stream': 'binary',
};

// Rate Limiter: In-memory for guests (best-effort in serverless), Supabase-backed for auth users
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

async function isUserRateLimited(userId: string): Promise<boolean> {
  try {
    const oneHourAgo = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count } = await supabaseAdmin
      .from('parse_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);
    return (count || 0) >= RATE_LIMIT;
  } catch {
    return false; // Fail open — don't block if DB is unreachable
  }
}

async function logParseEvent(userId: string | null, ip: string): Promise<void> {
  try {
    await supabaseAdmin.from('parse_logs').insert({ user_id: userId, ip });
  } catch {
    // Non-fatal
  }
}

export async function POST(request: NextRequest) {
  // cf-connecting-ip is set by Cloudflare and cannot be spoofed by the
  // client (x-forwarded-for alone is user-controlled).
  const ip = getClientIp(request);

  // Auth-based rate limiting (persistent across cold starts)
  let authUserId: string | null = null;
  try {
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (user) {
      authUserId = user.id;
      if (await isUserRateLimited(user.id)) {
        return NextResponse.json({ error: 'Too many requests. Max 10 uploads per hour.' }, { status: 429 });
      }
    }
  } catch { /* continue without auth rate limiting */ }

  // Fallback IP-based rate limiting (best-effort for guests)
  if (!authUserId && isRateLimited(ip)) {
    console.warn(`Rate limit hit: ${ip}`);
    return NextResponse.json({ error: 'Too many requests. Max 10 uploads per hour.' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 400 });
    }

    let fileType = ALLOWED_TYPES[file.type];
    // Fallback: extension when MIME is wrong/empty (common for HEIC, mobile, Windows).
    if (!fileType || fileType === 'binary') {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') fileType = 'pdf';
      else if (ext === 'docx') fileType = 'docx';
      else if (ext === 'doc') fileType = 'doc';
      else if (ext === 'rtf') fileType = 'rtf';
      else if (ext === 'txt' || ext === 'md' || ext === 'markdown' || ext === 'csv') fileType = 'txt';
      else if (ext && ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tif', 'tiff'].includes(ext)) fileType = 'image';
      else if (ext && ['heic', 'heif'].includes(ext)) fileType = 'image-heic';
      else if (!fileType) {
        // Best-effort: sniff magic bytes, then fall through as text/pdf/image
        fileType = 'unknown';
      }
    }

    let fileBuffer = Buffer.from(await file.arrayBuffer());
    const startTime = Date.now();

    // HEIC/HEIF (iPhone photos) → JPEG for vision models
    if (fileType === 'image-heic') {
      try {
        fileBuffer = await convertHeicToJpeg(fileBuffer);
        fileType = 'image';
      } catch (err) {
        console.warn('HEIC conversion failed; sending original bytes to vision:', err);
        fileType = 'image-heic-raw';
      }
    }

    let pageCount = 0;
    let extractedText = '';
    let aiStructuredData: any = null;
    let imageDataUri = '';
    let parseMedia: ParseMedia = { kind: 'none' };
    /** Keep original PDF bytes so a bad text parse can re-try as a scanned document. */
    let pdfBase64ForFallback: string | null = null;
    /** Non-AI baseline built before AI so catch/timeout can reuse it. */
    let regexBaseline: any = null;

    try {
      if (fileType === 'pdf') {
        pdfBase64ForFallback = fileBuffer.toString('base64');
        let pdfData: { text?: string; numpages?: number } | null = null;
        try {
          pdfData = await pdf(fileBuffer);
        } catch (err: any) {
          // Password / corrupt PDF — still attempt vision/document models with raw bytes
          console.warn('pdf-parse failed; routing to document vision:', err?.message || err);
          pdfData = null;
        }

        pageCount = pdfData?.numpages || 0;
        // Don't reject long CVs — keep text from all pages for the model (capped later)

        extractedText = (pdfData?.text || '').trim();
        // Enough selectable text → text path (cheaper, structured). Sparse/empty →
        // treat as image-only/scanned PDF and send document bytes to vision models.
        if (extractedText.length >= MIN_TEXT_CHARS) {
          parseMedia = { kind: 'none' };
        } else {
          parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          // Keep any sparse OCR crumbs for the prompt
        }

      } else if (fileType === 'image') {
        const mimeType =
          file.type && file.type.startsWith('image/') && !file.type.includes('heic') && !file.type.includes('heif')
            ? file.type === 'image/jpg'
              ? 'image/jpeg'
              : file.type
            : 'image/jpeg';
        imageDataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
        parseMedia = { kind: 'image', dataUri: imageDataUri, mimeType };

      } else if (fileType === 'image-heic-raw') {
        // Unconverted HEIC — Gemini only
        imageDataUri = `data:image/heic;base64,${fileBuffer.toString('base64')}`;
        parseMedia = { kind: 'image', dataUri: imageDataUri, mimeType: 'image/heic' };

      } else if (fileType === 'doc') {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const WordExtractor = require('word-extractor');
          const extractor = new WordExtractor();
          const doc = await extractor.extract(fileBuffer);
          extractedText = doc.getBody() || '';
        } catch (err) {
          console.warn('word-extractor failed; trying latin1 text fallback:', err);
          extractedText = fileBuffer.toString('latin1').replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ' ');
        }

      } else if (fileType === 'docx') {
        try {
          const mammothResult = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = mammothResult.value || '';
        } catch (err) {
          console.warn('mammoth failed; trying buffer as text/pdf vision:', err);
          extractedText = fileBuffer.toString('utf-8').replace(/\0/g, ' ');
          if (extractedText.trim().length < MIN_TEXT_CHARS) {
            pdfBase64ForFallback = fileBuffer.toString('base64');
            parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          }
        }

      } else if (fileType === 'rtf') {
        const rtfContent = fileBuffer.toString('utf-8');
        extractedText = rtfContent
          .replace(/\\[a-z]+\d*\s?/gi, '')
          .replace(/[{}]/g, '')
          .replace(new RegExp("\\\\'[0-9a-f]{2}", 'gi'), '')
          .trim();

      } else if (fileType === 'unknown') {
        // Sniff: PDF magic, image magic, else text
        const head = fileBuffer.subarray(0, 8);
        const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46; // %PDF
        const isPng = head[0] === 0x89 && head[1] === 0x50;
        const isJpg = head[0] === 0xff && head[1] === 0xd8;
        const isGif = head[0] === 0x47 && head[1] === 0x49;
        const isWebp = fileBuffer.length > 12 && fileBuffer.toString('ascii', 0, 4) === 'RIFF';
        if (isPdf) {
          pdfBase64ForFallback = fileBuffer.toString('base64');
          try {
            const pdfData = await pdf(fileBuffer);
            extractedText = (pdfData?.text || '').trim();
            pageCount = pdfData?.numpages || 0;
          } catch { /* vision path */ }
          if (extractedText.length < MIN_TEXT_CHARS) {
            parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          }
        } else if (isPng || isJpg || isGif || isWebp) {
          const mime = isPng ? 'image/png' : isGif ? 'image/gif' : isWebp ? 'image/webp' : 'image/jpeg';
          imageDataUri = `data:${mime};base64,${fileBuffer.toString('base64')}`;
          parseMedia = { kind: 'image', dataUri: imageDataUri, mimeType: mime };
        } else {
          extractedText = fileBuffer.toString('utf-8').replace(/\0/g, ' ');
          if (extractedText.trim().length < MIN_TEXT_CHARS) {
            // Last resort: treat as PDF bytes for vision models
            pdfBase64ForFallback = fileBuffer.toString('base64');
            parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          }
        }
      } else {
        // txt / markdown / csv
        extractedText = fileBuffer.toString('utf-8');
      }

      // Build the AI payload
      let baseMessages: OpenAIMessage[];
      if (parseMedia.kind === 'image') {
        baseMessages = [
          { role: 'system', content: PARSE_SYSTEM_INSTRUCTION },
          {
            role: 'user',
            content: [
              { type: 'text', text: PARSE_USER_PROMPT },
              { type: 'image_url', image_url: { url: imageDataUri } },
            ],
          },
        ];
      } else if (parseMedia.kind === 'pdf') {
        const crumbs =
          extractedText && extractedText.length > 0
            ? `\n\nText extracted from the PDF (use with the document; do not omit any content from either):\n${extractedText}`
            : '';
        baseMessages = [
          { role: 'system', content: PARSE_SYSTEM_INSTRUCTION },
          {
            role: 'user',
            content:
              `${PARSE_USER_PROMPT}\n\nThis is a scanned or image-based PDF resume. Read every page carefully.${crumbs}`,
          },
        ];
      } else {
        if (!extractedText || extractedText.trim().length < MIN_TEXT_CHARS) {
          // Never reject — push whatever bytes we have to vision/document models
          if (pdfBase64ForFallback) {
            parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          } else if (!imageDataUri && fileBuffer.length > 0) {
            pdfBase64ForFallback = fileBuffer.toString('base64');
            parseMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
          }
          baseMessages = [
            { role: 'system', content: PARSE_SYSTEM_INSTRUCTION },
            {
              role: 'user',
              content:
                `${PARSE_USER_PROMPT}\n\nExtract every detail from this resume document. Read pages carefully even if text extraction was empty.`,
            },
          ];
        } else {
          baseMessages = [
            { role: 'system', content: PARSE_SYSTEM_INSTRUCTION },
            {
              role: 'user',
              content: `${PARSE_USER_PROMPT}\n\nRESUME TEXT:\n${extractedText}`,
            },
          ];
        }
      }

      // Non-AI baseline first so an AI outage never leaves an empty editor.
      regexBaseline = tryRegexResumeFallback(extractedText, {
        fileName: file.name,
        reason: 'pre-AI baseline',
      });

      const AI_PARSE_TIMEOUT_MS = 35_000;
      const aiCall = callParseAI(baseMessages, { media: parseMedia });
      try {
        aiStructuredData = await Promise.race([
          aiCall,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`AI parse timed out after ${AI_PARSE_TIMEOUT_MS}ms`)),
              AI_PARSE_TIMEOUT_MS
            )
          ),
        ]);
      } catch (timeoutOrAiErr) {
        // If we timed out, swallow a late AI rejection so it isn't an unhandled rejection.
        void aiCall.catch(() => {});
        throw timeoutOrAiErr;
      }

      // Validate RAW model output FIRST. Repair used to truncate education dumps
      // to 500 chars, which hid the dump from validators (yash2 / education-dump bug).
      aiStructuredData = scrubProtectedArtifacts(aiStructuredData);
      let validation = validateParsedData(aiStructuredData);

      // Critical failure → one corrective re-parse with the raw source + the bad
      // output + explicit instructions. This recovers education-dump corruption.
      if (validation.critical) {
        // If text parse of a PDF was bad, escalate to full document vision.
        let corrMedia = parseMedia;
        if (corrMedia.kind === 'none' && pdfBase64ForFallback) {
          corrMedia = { kind: 'pdf', base64: pdfBase64ForFallback };
        }

        const issueLines = validation.issues.map((i) => `- ${i}`).join('\n');
        const sourceHint =
          corrMedia.kind === 'image' || corrMedia.kind === 'pdf'
            ? 'Re-parse the resume document attached to this message (image or PDF).'
            : `RAW RESUME TEXT:\n${extractedText}`;

        const correctionText = [
          sourceHint,
          '',
          'Your previous parse was INCORRECT. Fix these problems and re-extract the FULL resume:',
          issueLines,
          'Critical instructions:',
          '- fullName MUST be the candidate\'s real first + last name only (Title Case). NEVER append city/country (wrong: "Yash Kathait New Delhi"). NEVER use screenshot/file names as the name.',
          '- If the CV shows only one name token, still recover full name from the email handle when possible (e.g. shivamrajput@… → Shivam Rajput).',
          '- education MUST contain ONE entry per real degree/institution with a SHORT description (max 3 lines). NEVER put the contact header, email, phone, LinkedIn, or the whole resume into institution/description.',
          '- Map EVERY job/internship into workExperience (separate entry per role). If one job has multiple named projects, keep them under that role with clear project headings and bullet lines — do not glue two project names mid-sentence.',
          '- company field: one employer name (use "A / B" only if dual-badge is required). Do not dump product codes without context.',
          '- skills MUST be a flat array of individual skill strings; no version dups like both Python and Python 3.11+.',
          '- summary MUST be a short professional summary (2–4 sentences) when experience exists — never leave summary empty if the CV has jobs.',
          'Return ONLY the corrected JSON for the ENTIRE resume. Do not lose any data.',
        ].join('\n');

        console.warn('Parse failed validation; re-parsing. Issues:', validation.issues.join(' | '));
        const correctionMessages: OpenAIMessage[] = [
          { role: 'system', content: PARSE_SYSTEM_INSTRUCTION },
          { role: 'user', content: correctionText },
        ];

        aiStructuredData = await callParseAI(correctionMessages, { media: corrMedia });
        aiStructuredData = scrubProtectedArtifacts(aiStructuredData);
        validation = validateParsedData(aiStructuredData);
      }

      // If still critical, re-parse using the dump blob as resume text (yash2 recovery)
      if (validation.critical) {
        const salvage = extractSalvageResumeText(aiStructuredData);
        if (salvage && salvage.length >= 200) {
          console.warn('Salvaging resume from dumped education/work blob…');
          try {
            const salvageMessages: OpenAIMessage[] = [
              { role: 'system', content: PARSE_SYSTEM_INSTRUCTION },
              {
                role: 'user',
                content:
                  `${PARSE_USER_PROMPT}\n\nThe previous extract collapsed the CV into one field. Re-parse this full resume text carefully. Split education, experience, projects, skills, certifications into the correct arrays.\n\nRESUME TEXT:\n${salvage}`,
              },
            ];
            aiStructuredData = await callParseAI(salvageMessages, { media: { kind: 'none' } });
            aiStructuredData = scrubProtectedArtifacts(aiStructuredData);
            validation = validateParsedData(aiStructuredData);
          } catch (salvageErr) {
            console.warn('Salvage re-parse failed:', salvageErr);
          }
        }
      }

      // Always return best-effort structured data — never 422 the user.
      // Auth name/email hints applied again after repair for last-mile name recovery.
      let authHint = '';
      try {
        const supabaseUserClient = await createClient();
        const { data: { user: u } } = await supabaseUserClient.auth.getUser();
        authHint =
          (u?.user_metadata?.full_name as string) ||
          (u?.user_metadata?.name as string) ||
          '';
        if (aiStructuredData?.personalInfo && !aiStructuredData.personalInfo.email && u?.email) {
          aiStructuredData.personalInfo.email = u.email;
        }
      } catch {
        /* non-fatal */
      }
      aiStructuredData = repairParsedData(aiStructuredData, { authName: authHint });
      aiStructuredData = ensureMinimalProfile(aiStructuredData, { fileName: file.name });
      // Re-validate soft warnings after repair (do not re-loop AI)
      validation = validateParsedData(aiStructuredData);
      if (validation.issues.length) {
        console.warn(
          'Parse warnings after repair:',
          validation.issues.join(' | ')
        );
        aiStructuredData._parseWarnings = validation.issues;
      }

      // AI returned a critical / empty shell → prefer regex if extracted text exists
      const aiScore = resumeParseContentScore(aiStructuredData);
      if (validation.critical || aiScore < 5) {
        const regexData =
          regexBaseline ||
          tryRegexResumeFallback(extractedText, {
            fileName: file.name,
            authName: authHint,
            reason: validation.critical
              ? `AI output still critical: ${validation.issues.slice(0, 3).join('; ')}`
              : 'AI output too sparse',
          });
        if (regexData && resumeParseContentScore(regexData) > aiScore) {
          aiStructuredData = regexData;
        }
      } else if (
        regexBaseline &&
        resumeParseContentScore(regexBaseline) > aiScore + 5
      ) {
        // Rare: regex clearly richer than a weak-but-non-critical AI pass
        aiStructuredData = regexBaseline;
      }
      if (!aiStructuredData._parseMethod) aiStructuredData._parseMethod = 'ai';

    } catch (aiError) {
      console.error('AI parsing failed; trying non-AI resume parser:', aiError);
      let authHint = '';
      try {
        const supabaseUserClient = await createClient();
        const {
          data: { user: u },
        } = await supabaseUserClient.auth.getUser();
        authHint =
          (u?.user_metadata?.full_name as string) ||
          (u?.user_metadata?.name as string) ||
          '';
      } catch {
        /* non-fatal */
      }

      const reason =
        aiError instanceof Error ? aiError.message : 'AI parsing failed';
      const regexData =
        regexBaseline ||
        tryRegexResumeFallback(extractedText, {
          fileName: file.name,
          authName: authHint,
          reason,
        });

      if (regexData) {
        aiStructuredData = regexData;
      } else {
        aiStructuredData = emptyProfileShell(file.name, [
          reason,
          extractedText?.trim()?.length
            ? 'Non-AI parser could not structure this CV — continue in the editor.'
            : 'No selectable text (scanned/image CV) and AI unavailable — continue in the editor and fill details manually, or re-upload when parsing is back.',
        ]);
      }
    }

    // Strip any residual reconstruction markers before returning to the client.
    aiStructuredData = scrubProtectedArtifacts(aiStructuredData);

    // Resume processing after successful extraction
    const duration = Date.now() - startTime;

    // ---------- Option C: Safe Slug Generation (Non-Fatal — frontend has its own fallback) ----------
    try {
      const supabaseUserClient = await createClient();
      const { data: { user } } = await supabaseUserClient.auth.getUser();

      if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { data: currentProfile } = await supabaseAdmin
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        const isBadProfileSlug = (s: string | null | undefined) => {
          if (!s) return true;
          if (s === user.id) return true;
          return isDisposableProfileSlug(s);
        };

        const nameToSlug = (name: string) => nameToProfileSlug(name || 'profile');

        // Prefer auth display name when parse name is weak
        const authName =
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          '';
        if (aiStructuredData?.personalInfo) {
          aiStructuredData.personalInfo.fullName = enrichNameFromContact(
            aiStructuredData.personalInfo.fullName || '',
            {
              email: aiStructuredData.personalInfo.email || user.email || '',
              github: aiStructuredData.personalInfo.github,
              linkedin: aiStructuredData.personalInfo.linkedin,
              authName,
            }
          );
          if (!aiStructuredData.personalInfo.email && user.email) {
            aiStructuredData.personalInfo.email = user.email;
          }
        }

        let finalSlug: string;
        if (currentProfile?.username && !isBadProfileSlug(currentProfile.username)) {
          finalSlug = currentProfile.username;
        } else {
          const prefixSlug = nameToSlug(
            aiStructuredData.personalInfo?.fullName || authName || 'profile'
          );
          finalSlug = prefixSlug;
          let isUnique = false;
          let attempt = 0;

          while (!isUnique && attempt < 100) {
            const { data: existingProfile, error: existErr } = await supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('username', finalSlug)
              .maybeSingle();

            if (existErr) {
              console.error("Slug uniqueness check failed, frontend will handle:", existErr);
              break;
            }

            if (!existingProfile || existingProfile.id === user.id) {
              isUnique = true;
            } else {
              attempt++;
              finalSlug = `${prefixSlug}${attempt}`;
            }
          }
        }

        if (finalSlug) {
          if (!aiStructuredData.personalInfo) {
            aiStructuredData.personalInfo = {};
          }
          aiStructuredData.personalInfo.slug = finalSlug;
        }
      }
    } catch (slugError) {
      console.warn('Slug generation failed (non-fatal, frontend will handle):', slugError);
    }

    console.log(JSON.stringify({
      event: 'cv_parse_success',
      parseMethod: aiStructuredData._parseMethod || 'ai',
      fileType,
      fileSizeKB: Math.round(file.size / 1024),
      pageCount,
      durationMs: duration,
      sectionsFound: {
        work: aiStructuredData.workExperience?.length || 0,
        education: aiStructuredData.education?.length || 0,
        skills: aiStructuredData.skills?.length || 0,
        custom: aiStructuredData.customSections?.length || 0,
      },
      ip,
    }));

    logParseEvent(authUserId, ip);

    return NextResponse.json(aiStructuredData, { status: 200 });

  } catch (error) {
    console.error('Fatal API Error (returning empty shell for UX):', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Return shell for graceful frontend handling, but use 422 so
    // monitoring tools can detect parse failures.
    const shell = emptyProfileShell(undefined, [message]);
    return NextResponse.json(shell, { status: 422 });
  }
}
