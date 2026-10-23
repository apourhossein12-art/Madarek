'use client';

import React from 'react';
import {
  Palette,
  FileCheck2,
  Binary,
  User,
  Sliders,
  SunMedium,
  Contrast,
  Sparkles,
  Zap,
} from 'lucide-react';
import { FilterMode, DocumentAdjustment } from '@/lib/image-types';
import { toPersianDigits } from '@/lib/image-math';

interface FilterControlsProps {
  adjustments: DocumentAdjustment;
  onChangeAdjustments: (adjustments: Partial<DocumentAdjustment>) => void;
}

export default function FilterControls({
  adjustments,
  onChangeAdjustments,
}: FilterControlsProps) {
  const modes: {
    id: FilterMode;
    label: string;
    icon: React.ReactNode;
    desc: string;
    tag?: string;
  }[] = [
    {
      id: 'enhanced_color',
      label: 'رنگی بهبودیافته',
      icon: <Palette className="h-4 w-4" />,
      desc: 'سفید کردن کاغذ با حفظ رنگ طبیعی مهرها و افزایش کنتراست (CLAHE)',
      tag: 'محبوب',
    },
    {
      id: 'official_doc',
      label: 'سند رسمی اداری',
      icon: <FileCheck2 className="h-4 w-4" />,
      desc: 'حفظ رنگ اصلی مهر آبی و امضا، تبدیل پس‌زمینه به سفید یکدست',
      tag: 'ویژه دانشگاه',
    },
    {
      id: 'transcript',
      label: 'کارنامه و ریز نمرات',
      icon: <FileCheck2 className="h-4 w-4" />,
      desc: 'تقویت خطوط جدول، پررنگ کردن نمرات کم‌رنگ و حفظ مهرهای رنگی',
      tag: 'جدول و نمره',
    },
    {
      id: 'bw_text',
      label: 'سیاه و سفید متنی',
      icon: <Binary className="h-4 w-4" />,
      desc: 'خوانایی حداکثری متن و کدهای رهگیری با حذف کامل سایه‌ها (Adaptive)',
    },
    {
      id: 'photo_3x4',
      label: 'عکس پرسنلی ۳×۴',
      icon: <User className="h-4 w-4" />,
      desc: 'تنظیم پرتره، وضوح چهره و آماده‌سازی برای پروفایل داوطلب',
    },
    {
      id: 'natural',
      label: 'طبیعی (اصل سند)',
      icon: <Sliders className="h-4 w-4" />,
      desc: 'تصحیح زاویه بدون دستکاری شدید رنگ‌ها',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            حالت‌های خروجی و ارتقای تصویر
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">فیلترهای پردازش هوشمند سند</span>
      </div>

      {/* Filter Mode Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {modes.map((mode) => {
          const isSelected = adjustments.filterMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChangeAdjustments({ filterMode: mode.id })}
              className={`relative flex flex-col items-start rounded-xl border p-2.5 text-right transition ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
                    {mode.icon}
                  </span>
                  <span>{mode.label}</span>
                </div>
                {mode.tag && (
                  <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {mode.tag}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                {mode.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* AI Enhancement Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        {/* Shadow removal */}
        <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 cursor-pointer hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800 transition">
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${adjustments.shadowRemoval ? 'text-amber-500' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                حذف سایه‌های مزاحم گوشی
              </div>
              <div className="text-[10px] text-slate-400">یکنواخت‌سازی نور سطح کاغذ</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={adjustments.shadowRemoval}
            onChange={(e) => onChangeAdjustments({ shadowRemoval: e.target.checked })}
            className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
          />
        </label>

        {/* Sharpen text */}
        <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 cursor-pointer hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800 transition">
          <div className="flex items-center gap-2">
            <Sparkles className={`h-4 w-4 ${adjustments.sharpen ? 'text-emerald-500' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                تیز کردن متون ریز (Sharpen)
              </div>
              <div className="text-[10px] text-slate-400">افزایش وضوح شماره ملی و فونت‌های ریز</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={adjustments.sharpen}
            onChange={(e) => onChangeAdjustments({ sharpen: e.target.checked })}
            className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
          />
        </label>
      </div>

      {/* Manual Brightness & Contrast Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <SunMedium className="h-3.5 w-3.5 text-amber-500" />
              روشنایی دستی:
            </span>
            <span className="font-mono text-[11px] font-semibold">
              {toPersianDigits(adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness)}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={adjustments.brightness}
            onChange={(e) => onChangeAdjustments({ brightness: parseInt(e.target.value, 10) })}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg dark:bg-slate-700"
          />
        </div>

        {/* Contrast */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Contrast className="h-3.5 w-3.5 text-blue-500" />
              کنتراست دستی:
            </span>
            <span className="font-mono text-[11px] font-semibold">
              {toPersianDigits(adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast)}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={adjustments.contrast}
            onChange={(e) => onChangeAdjustments({ contrast: parseInt(e.target.value, 10) })}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg dark:bg-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
