// ── CVin.Bio Auto-Fill — Content Script ──
// Detects form fields on any page and fills them with profile data.

(() => {
  'use strict';

  // ── Field matchers ──
  // Each entry: { profileKey, patterns (matched against name, id, placeholder, label, autocomplete) }
  const FIELD_MAP = [
    // ── Name fields ──
    {
      profileKey: 'first_name',
      extract: (p) => (p.full_name || '').split(' ')[0],
      patterns: ['first.?name', 'fname', 'given.?name', 'first'],
      autocomplete: ['given-name'],
    },
    {
      profileKey: 'last_name',
      extract: (p) => (p.full_name || '').split(' ').slice(1).join(' '),
      patterns: ['last.?name', 'lname', 'surname', 'family.?name', 'last'],
      autocomplete: ['family-name'],
    },
    {
      profileKey: 'full_name',
      extract: (p) => p.full_name || '',
      patterns: ['full.?name', 'name', 'your.?name', 'candidate.?name', 'applicant.?name'],
      autocomplete: ['name'],
      excludePatterns: ['first', 'last', 'company', 'user', 'middle'],
    },

    // ── Contact ──
    {
      profileKey: 'email',
      extract: (p) => p.email || '',
      patterns: ['email', 'e.?mail', 'email.?address'],
      autocomplete: ['email'],
      inputTypes: ['email'],
    },
    {
      profileKey: 'phone',
      extract: (p) => p.phone || '',
      patterns: ['phone', 'tel', 'mobile', 'cell', 'phone.?number'],
      autocomplete: ['tel'],
      inputTypes: ['tel'],
    },

    // ── Location ──
    {
      profileKey: 'location',
      extract: (p) => p.location || '',
      patterns: ['location', 'city', 'address', 'current.?location', 'where.?are.?you'],
      autocomplete: ['address-level2'],
    },

    // ── URLs ──
    {
      profileKey: 'linkedin',
      extract: (p) => p.linkedin || '',
      patterns: ['linkedin', 'linked.?in'],
    },
    {
      profileKey: 'github',
      extract: (p) => p.github || '',
      patterns: ['github', 'git.?hub'],
    },
    {
      profileKey: 'website',
      extract: (p) => p.website || '',
      patterns: ['website', 'portfolio', 'personal.?site', 'homepage', 'blog'],
      excludePatterns: ['linkedin', 'github', 'twitter', 'company'],
    },
    {
      profileKey: 'twitter',
      extract: (p) => {
        const link = (p.links || []).find((l) => l.type === 'twitter');
        return link ? link.value : '';
      },
      patterns: ['twitter', 'x\\.com', 'twitter.?x', 'x\\/twitter'],
    },
    {
      profileKey: 'google_scholar',
      extract: (p) => {
        const link = (p.links || []).find((l) => l.type === 'google-scholar' || l.type === 'scholar');
        return link ? link.value : '';
      },
      patterns: ['scholar', 'google.?scholar', 'publications'],
    },
    {
      profileKey: 'telegram',
      extract: (p) => {
        const link = (p.links || []).find((l) => l.type === 'telegram');
        return link ? link.value : '';
      },
      patterns: ['telegram', 't\\.me'],
    },
    {
      profileKey: 'instagram',
      extract: (p) => {
        const link = (p.links || []).find((l) => l.type === 'instagram');
        return link ? link.value : '';
      },
      patterns: ['instagram', 'insta'],
    },
    {
      profileKey: 'youtube',
      extract: (p) => {
        const link = (p.links || []).find((l) => l.type === 'youtube');
        return link ? link.value : '';
      },
      patterns: ['youtube'],
    },
    {
      profileKey: 'any_url',
      extract: (p) => p.website || p.linkedin || '',
      patterns: ['url', 'link', 'profile.?url', 'social'],
      excludePatterns: ['linkedin', 'github', 'twitter', 'company', 'email', 'website', 'portfolio', 'instagram', 'youtube', 'telegram', 'scholar'],
    },

    // ── Professional ──
    {
      profileKey: 'current_company',
      extract: (p) => {
        const exp = p.experience;
        if (exp && exp.length > 0) return exp[0].company || '';
        return '';
      },
      patterns: ['company', 'current.?company', 'employer', 'organization', 'org'],
      excludePatterns: ['name'],
    },
    {
      profileKey: 'current_title',
      extract: (p) => {
        const exp = p.experience;
        if (exp && exp.length > 0) return exp[0].title || '';
        return '';
      },
      patterns: ['title', 'job.?title', 'current.?title', 'position', 'role', 'current.?role'],
      excludePatterns: ['name', 'mr', 'mrs'],
    },
    {
      profileKey: 'summary',
      extract: (p) => p.summary || '',
      patterns: ['summary', 'about', 'bio', 'cover.?letter', 'additional.?info', 'intro', 'tell.?us.?about'],
      isTextarea: true,
    },
  ];

  // ── Get identifying text for an input ──
  function getFieldSignals(el) {
    const signals = [];

    // Direct attributes
    const name = (el.getAttribute('name') || '').toLowerCase();
    const id = (el.getAttribute('id') || '').toLowerCase();
    const placeholder = (el.getAttribute('placeholder') || '').toLowerCase();
    const autocomplete = (el.getAttribute('autocomplete') || '').toLowerCase();
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    const dataField = (el.getAttribute('data-field') || '').toLowerCase();

    signals.push(name, id, placeholder, autocomplete, ariaLabel, dataField);

    // Associated label
    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label) signals.push(label.textContent.toLowerCase().trim());
    }

    // Parent label
    const parentLabel = el.closest('label');
    if (parentLabel) {
      signals.push(parentLabel.textContent.toLowerCase().trim());
    }

    // Nearby label (sibling or parent container)
    const container = el.closest('.field, .form-group, .form-field, [class*="field"], [class*="input"], [class*="form"]');
    if (container) {
      const label = container.querySelector('label, .label, [class*="label"]');
      if (label) signals.push(label.textContent.toLowerCase().trim());
    }

    return {
      signals: signals.filter(Boolean),
      autocomplete,
      inputType: (el.getAttribute('type') || '').toLowerCase(),
    };
  }

  // ── Match a field against patterns ──
  function matchField(fieldInfo, matcher) {
    const { signals, autocomplete, inputType } = fieldInfo;

    // Check autocomplete match
    if (matcher.autocomplete && matcher.autocomplete.includes(autocomplete)) {
      return true;
    }

    // Check input type match
    if (matcher.inputTypes && matcher.inputTypes.includes(inputType)) {
      return true;
    }

    // Check pattern match against all signals
    for (const signal of signals) {
      if (!signal) continue;

      // Check exclude patterns first
      if (matcher.excludePatterns) {
        const excluded = matcher.excludePatterns.some((ep) =>
          new RegExp(ep, 'i').test(signal)
        );
        if (excluded) continue;
      }

      for (const pattern of matcher.patterns) {
        if (new RegExp(pattern, 'i').test(signal)) {
          return true;
        }
      }
    }

    return false;
  }

  // ── Set value on an input (React-compatible) ──
  function setNativeValue(el, value) {
    // Store original value
    const lastValue = el.value;

    // Use native setter to bypass React's synthetic event system
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;
    const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    )?.set;

    if (el.tagName === 'TEXTAREA' && nativeTextareaValueSetter) {
      nativeTextareaValueSetter.call(el, value);
    } else if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, value);
    } else {
      el.value = value;
    }

    // Dispatch events that React and other frameworks listen to
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  // ── Handle select elements ──
  function fillSelect(el, value) {
    if (!value) return false;
    const valueLower = value.toLowerCase();

    for (const option of el.options) {
      if (
        option.value.toLowerCase() === valueLower ||
        option.textContent.toLowerCase().trim() === valueLower ||
        option.textContent.toLowerCase().includes(valueLower)
      ) {
        el.value = option.value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
    return false;
  }

  // ── Visual feedback ──
  function flashField(el) {
    const originalBorder = el.style.border;
    const originalShadow = el.style.boxShadow;
    el.style.border = '2px solid #6366f1';
    el.style.boxShadow = '0 0 8px rgba(99, 102, 241, 0.4)';
    el.style.transition = 'border 0.3s, box-shadow 0.3s';

    setTimeout(() => {
      el.style.border = originalBorder;
      el.style.boxShadow = originalShadow;
    }, 1500);
  }

  // ── Main fill logic ──
  function fillForm(profile) {
    // Gather all fillable elements
    const inputs = document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea, select'
    );

    let filled = 0;
    let skipped = 0;
    const filledFields = new Set();

    for (const el of inputs) {
      // Skip invisible elements
      if (el.offsetParent === null && el.getAttribute('type') !== 'hidden') continue;
      // Skip disabled/readonly
      if (el.disabled || el.readOnly) continue;

      const fieldInfo = getFieldSignals(el);

      for (const matcher of FIELD_MAP) {
        // Skip if we already filled this profileKey
        if (filledFields.has(matcher.profileKey)) continue;
        // Skip textarea matchers for non-textarea elements
        if (matcher.isTextarea && el.tagName !== 'TEXTAREA') continue;

        if (matchField(fieldInfo, matcher)) {
          const value = matcher.extract(profile);
          if (!value) break;

          // Skip if field already has a value
          if (el.value && el.value.trim() !== '') {
            skipped++;
            filledFields.add(matcher.profileKey);
            break;
          }

          if (el.tagName === 'SELECT') {
            if (fillSelect(el, value)) {
              filled++;
              filledFields.add(matcher.profileKey);
              flashField(el);
            }
          } else {
            setNativeValue(el, value);
            filled++;
            filledFields.add(matcher.profileKey);
            flashField(el);
          }
          break;
        }
      }
    }

    return { filled, skipped };
  }

  // ── Detect custom questions (textareas with question-like labels) ──
  function detectCustomQuestions() {
    const textareas = document.querySelectorAll('textarea');
    const questions = [];

    for (const ta of textareas) {
      if (ta.offsetParent === null || ta.disabled || ta.readOnly) continue;
      if (ta.value && ta.value.trim() !== '') continue;

      const fieldInfo = getFieldSignals(ta);
      // Check if this is already handled by a standard matcher
      let isStandard = false;
      for (const matcher of FIELD_MAP) {
        if (matchField(fieldInfo, matcher)) {
          isStandard = true;
          break;
        }
      }
      if (isStandard) continue;

      // Find the question text from labels or nearby elements
      let questionText = '';

      // Try label[for]
      if (ta.id) {
        const label = document.querySelector(`label[for="${ta.id}"]`);
        if (label) questionText = label.textContent.trim();
      }
      // Try parent label
      if (!questionText) {
        const parentLabel = ta.closest('label');
        if (parentLabel) questionText = parentLabel.textContent.trim();
      }
      // Try nearby heading or label in container
      if (!questionText) {
        const container = ta.closest('.field, .form-group, .form-field, [class*="field"], [class*="question"], [class*="form"]');
        if (container) {
          const label = container.querySelector('label, .label, h3, h4, [class*="label"], [class*="question"]');
          if (label) questionText = label.textContent.trim();
        }
      }
      // Try previous sibling
      if (!questionText) {
        let prev = ta.previousElementSibling;
        while (prev && !questionText) {
          if (['LABEL', 'H3', 'H4', 'P', 'SPAN', 'DIV'].includes(prev.tagName)) {
            const text = prev.textContent.trim();
            if (text.length > 5 && text.length < 500) questionText = text;
          }
          prev = prev.previousElementSibling;
        }
      }

      if (questionText && questionText.length > 5) {
        questions.push({ element: ta, question: questionText });
      }
    }

    return questions;
  }

  // ── Extract job context from page ──
  function getJobContext() {
    const title = document.title || '';
    let jobTitle = '';
    let company = '';

    // Try common patterns in title
    const titleParts = title.split(/[|\-–—]/);
    if (titleParts.length > 1) {
      jobTitle = titleParts[0].trim();
      company = titleParts[titleParts.length - 1].trim();
    }

    // Try h1
    const h1 = document.querySelector('h1');
    if (h1 && !jobTitle) jobTitle = h1.textContent.trim();

    // Try common selectors for company name
    const companyEl = document.querySelector('[class*="company"], [data-company], .employer');
    if (companyEl && !company) company = companyEl.textContent.trim();

    return { jobTitle, company };
  }

  // ── AI fill for custom questions ──
  async function fillWithAI(username) {
    const questions = detectCustomQuestions();
    if (questions.length === 0) return { aiFilled: 0, aiTotal: 0 };

    const { jobTitle, company } = getJobContext();
    let aiFilled = 0;

    for (const { element, question } of questions) {
      try {
        const res = await fetch('https://cvin.bio/api/autofill-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, question, jobTitle, company }),
        });

        if (res.ok) {
          const { answer } = await res.json();
          if (answer) {
            setNativeValue(element, answer);
            flashField(element);
            aiFilled++;
          }
        }
      } catch (e) {
        console.warn('AI fill failed for:', question, e);
      }
    }

    return { aiFilled, aiTotal: questions.length };
  }

  // ── Listen for messages from popup ──
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'FILL_FORM' && msg.profile) {
      const result = fillForm(msg.profile);
      sendResponse(result);
    }
    if (msg.action === 'FILL_AI' && msg.username) {
      fillWithAI(msg.username).then(sendResponse);
      return true; // async
    }
    return true;
  });
})();
