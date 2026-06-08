"use client";

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'tg-popup-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 8000;

export function TelegramJobPopup() {
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < DISMISS_DURATION_MS) return;

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
    <div
      role="dialog"
      aria-label="Join Tech Jobs Daily on Telegram"
      className={`fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 transition-all duration-300 ease-out ${
        animateOut ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100 animate-in slide-in-from-bottom-4'
      }`}
    >
      <div className="mx-auto max-w-xl flex items-center gap-3 rounded-lg border bg-background px-4 py-3 shadow-sm">
        <p className="flex-1 text-sm text-muted-foreground min-w-0">
          <span className="font-medium text-foreground">Tech Jobs Daily</span>
          {' '}— curated roles, straight to Telegram.
        </p>
        <a
          href="https://t.me/techjobsdaily"
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Join
        </a>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
