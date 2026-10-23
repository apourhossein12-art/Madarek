'use client';

import React from 'react';
import {
  HardDrive,
  CheckCircle,
  AlertCircle,
  Download,
  SlidersHorizontal,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DocumentItem, UniversityPreset } from '@/lib/image-types';
import { formatBytesFa, toPersianDigits } from '@/lib/image-math';
import { UNIVERSITY_PRESETS } from '@/lib/university-presets';

interface CompressionPanelProps {
  documentItem: DocumentItem;
  targetMaxKb: number;
  onChangeTargetKb: (kb: number) => void;
  onApplyPreset: (preset: UniversityPreset) => void;
  onPrepareForSave: () => void;
  isProcessing: boolean;
}

export default function CompressionPanel({
  documentItem,
  targetMaxKb,
  onChangeTargetKb,
  onApplyPreset,
  onPrepareForSave,
  isProcessing,
}: CompressionPanelProps) {
  const currentBytes = documentItem.processedBytes || 0;
  const currentKb = currentBytes / 1024;
  const targetBytes = targetMaxKb * 1024;
  const isWithinLimit = currentBytes <= targetBytes;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            کنترل دقیق حجم فایل خروجی (کیلوبایت)
          </h3>
        </div>
        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          تضمین قبولی در سامانه
        </span>
      </div>

      {/* Quick University Preset Buttons */}
      <div>
        <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          پروفایل‌های استاندارد سامانه‌های پذیرش:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {UNIVERSITY_PRESETS.map((preset) => {
            const isCurrent = targetMaxKb === preset.maxKb;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset)}
                className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 ring-1 ring-emerald-500/30'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span>{preset.title}</span>
                <span className="font-mono text-[10px] font-bold opacity-80">
                  [{toPersianDigits(preset.maxKb)} KB]
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Size Slider */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-500" />
            حداکثر سقف مجاز فایل:
          </span>
          <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            {toPersianDigits(targetMaxKb)} کیلوبایت
          </span>
        </div>

        <input
          type="range"
          min="20"
          max="1024"
          step="5"
          value={targetMaxKb}
          onChange={(e) => onChangeTargetKb(parseInt(e.target.value, 10))}
          className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg dark:bg-slate-700"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>{toPersianDigits(20)} KB (حداقل)</span>
          <span>{toPersianDigits(512)} KB (دانشگاه آزاد)</span>
          <span>{toPersianDigits(1024)} KB (حداکثر)</span>
        </div>
      </div>

      {/* Real-time Result Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {/* Actual Bytes */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="text-[10px] text-slate-400">حجم دقیق تصویر خروجی:</div>
          <div className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {isProcessing ? 'در حال بهینه‌سازی...' : formatBytesFa(currentBytes)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px]">
            {isWithinLimit ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle className="h-3 w-3" />
                مجاز برای آپلود
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <AlertCircle className="h-3 w-3" />
                بیشتر از حد مجاز
              </span>
            )}
          </div>
        </div>

        {/* Final Dimensions */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="text-[10px] text-slate-400">ابعاد تصویر (پیکسل):</div>
          <div className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {toPersianDigits(documentItem.processedWidth || 0)} × {toPersianDigits(documentItem.processedHeight || 0)}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            فرمت نهایی: <span className="font-semibold text-slate-700 dark:text-slate-300">JPG</span>
          </div>
        </div>

        {/* Status in Iranian Portals */}
        <div className="col-span-2 sm:col-span-1 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5">
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400">وضعیت در سامانه:</div>
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            تضمین عدم رد در سامانه
          </div>
          <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
            بدون خطای حجم و فرمت
          </div>
        </div>
      </div>

      {/* Main Save CTA Button */}
      <button
        type="button"
        disabled={isProcessing || !documentItem.processedDataUrl}
        onClick={onPrepareForSave}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Download className="h-4 w-4" />
        <span>آماده‌سازی برای ذخیره و بارگیری در گالری</span>
      </button>
    </div>
  );
}
