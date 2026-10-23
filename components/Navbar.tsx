'use client';

import React from 'react';
import { ShieldCheck, HelpCircle, Sun, Moon, GraduationCap, Sparkles } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenGuide: () => void;
  isOpenCvLoaded: boolean;
}

export default function Navbar({
  darkMode,
  onToggleDarkMode,
  onOpenGuide,
  isOpenCvLoaded,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                اسکنر هوشمند مدارک دانشگاهی
              </h1>
              <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                ویژه سامانه‌های پذیرش
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden xs:block">
              دانشگاه آزاد (paziresh.azmoon.iau.ir) • سنجش • گلستان • آموزشیار
            </p>
          </div>
        </div>

        {/* Action badges & Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* OpenCV Status indicator */}
          <div
            title={isOpenCvLoaded ? 'موتور پردازش تصویر OpenCV فعال است' : 'در حال بارگذاری هوش مصنوعی OpenCV...'}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/70 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isOpenCvLoaded ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
            <span className="text-[11px]">
              {isOpenCvLoaded ? 'OpenCV.js فعال' : 'بارگذاری هوش‌مصنوعی...'}
            </span>
          </div>

          {/* Privacy badge */}
          <div
            title="پردازش تصاویر ۱۰۰٪ درون مرورگر شما انجام می‌شود و هیچ مدرکی به اینترنت ارسال نخواهد شد."
            className="flex items-center gap-1.5 rounded-lg bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-300 border border-teal-500/20"
          >
            <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="hidden sm:inline">۱۰۰٪ محلی و امن</span>
          </div>

          {/* University Guide button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
            aria-label="راهنمای استانداردهای دانشگاهی"
          >
            <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xs:inline">راهنمای سایت دانشگاه</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            aria-label={darkMode ? 'حالت روز' : 'حالت شب'}
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
