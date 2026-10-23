'use client';

import React, { useState } from 'react';
import { X, Github, Copy, Check, ExternalLink, Terminal, Code2, Heart } from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GitHubModal({ isOpen, onClose }: GitHubModalProps) {
  const [copiedClone, setCopiedClone] = useState(false);

  if (!isOpen) return null;

  const cloneCommand = `git clone https://github.com/alirezassezar/docscan-iran.git
cd docscan-iran
npm install
npm run dev`;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                سورس‌کد و مخزن گیت‌هاب (GitHub)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                پروژه منبع‌باز اسکنر مدارک دانشگاهی ایران
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs leading-relaxed">
          {/* AI Studio Export Notice */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-1">
              <Code2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              نحوه انتقال مستقیم به گیت‌هاب شخصی شما از AI Studio:
            </div>
            <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/90 leading-normal">
              در نوار بالای محیط <strong>Google AI Studio</strong>، با کلیک روی گزینه <strong>Export</strong> یا <strong>Download Code</strong> می‌توانید این پروژه را مستقیماً به حساب گیت‌هاب شخصی خود متصل (Push) کرده یا فایل زیپ کامل آن را دانلود نمایید.
            </p>
          </div>

          {/* Terminal Clone Commands */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <Terminal className="h-3.5 w-3.5 text-slate-500" />
                دستورات کلون و اجرای محلی:
              </span>
              <button
                type="button"
                onClick={handleCopyClone}
                className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                {copiedClone ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedClone ? 'کپی شد!' : 'کپی دستورات'}</span>
              </button>
            </div>
            <pre className="rounded-xl bg-slate-950 p-3 text-left font-mono text-[11px] text-emerald-400 overflow-x-auto dir-ltr">
              <code>{cloneCommand}</code>
            </pre>
          </div>

          {/* Stack Info */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-slate-400">تکنولوژی: </span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Next.js 15 (App Router) + OpenCV.js
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-slate-400">مجوز: </span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                MIT Open Source (رایگان)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>توسعه‌یافته برای دانشجویان ایران</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500 inline" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
            >
              بستن
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition shadow-sm"
            >
              <Github className="h-3.5 w-3.5" />
              <span>مشاهده در GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
