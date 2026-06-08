"use client";

import { useState, useEffect, useCallback } from 'react';
import { X, Send, BriefcaseBusiness } from 'lucide-react';

const STORAGE_KEY = 'tg-popup-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SHOW_DELAY_MS = 8000; // Show after 8s on page

export function TelegramJobPopup() {
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    // Don't show if dismissed recently
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return;
    }

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    setAnimateOut(true);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setTimeout(() => setVisible(false), 300);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          animateOut ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        role="dialog"
        aria-labelledby="tg-popup-title"
        aria-describedby="tg-popup-desc"
        className={`fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none transition-all duration-300 ${
          animateOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="relative w-full max-w-[380px] pointer-events-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
          {/* Close button */}
          <button
            onClick={dismiss}
            aria-label="Close popup"
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Gradient accent strip */}
          <div className="h-1 w-full bg-gradient-to-r from-[#0088cc] via-[#29b6f6] to-[#0088cc]" />

          <div className="px-6 pt-6 pb-5">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-[#0088cc]/10 dark:bg-[#0088cc]/15 flex items-center justify-center mb-4">
              <BriefcaseBusiness className="w-6 h-6 text-[#0088cc]" />
            </div>

            {/* Copy */}
            <h3
              id="tg-popup-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-1.5"
            >
              Never miss a tech job
            </h3>
            <p
              id="tg-popup-desc"
              className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5"
            >
              Join <span className="font-semibold text-zinc-700 dark:text-zinc-300">Tech Jobs Daily</span> on Telegram — curated roles from top companies, delivered straight to your phone. Free, no spam.
            </p>

            {/* CTA */}
            <a
              href="https://t.me/techjobsdaily"
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#0088cc] hover:bg-[#006da3] text-white font-semibold text-sm transition-colors shadow-sm shadow-[#0088cc]/20"
            >
              <Send className="w-4 h-4" />
              Join on Telegram
            </a>

            {/* Dismiss link */}
            <button
              onClick={dismiss}
              className="w-full mt-3 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-center"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
