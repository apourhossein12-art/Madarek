'use client';

import React, { useRef } from 'react';
import { Plus, Trash2, Camera, Upload, Sparkles, FileText, CreditCard, User, ChevronDown } from 'lucide-react';
import { DocumentItem } from '@/lib/image-types';
import { formatBytesFa, toPersianDigits } from '@/lib/image-math';
import {
  createSampleDegreeCertificate,
  createSampleMelliCard,
  createSamplePortraitPhoto,
  createSampleTranscript,
} from '@/lib/sample-docs';

interface DocumentQueueProps {
  documents: DocumentItem[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onAddDocument: (file: File) => void;
  onAddDataUrl: (dataUrl: string, name: string) => void;
  onDeleteDoc: (id: string) => void;
}

export default function DocumentQueue({
  documents,
  activeDocId,
  onSelectDoc,
  onAddDocument,
  onAddDataUrl,
  onDeleteDoc,
}: DocumentQueueProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showSampleMenu, setShowSampleMenu] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        onAddDocument(files[i]);
      }
    }
    // reset input
    e.target.value = '';
  };

  const handleAddSample = (type: 'degree' | 'melli' | 'photo' | 'transcript') => {
    setShowSampleMenu(false);
    if (type === 'degree') {
      const dataUrl = createSampleDegreeCertificate();
      onAddDataUrl(dataUrl, 'گواهی موقت دانشگاهی (نمونه)');
    } else if (type === 'transcript') {
      const dataUrl = createSampleTranscript();
      onAddDataUrl(dataUrl, 'کارنامه و ریز نمرات (نمونه)');
    } else if (type === 'melli') {
      const dataUrl = createSampleMelliCard();
      onAddDataUrl(dataUrl, 'کارت هوشمند ملی (نمونه)');
    } else {
      const dataUrl = createSamplePortraitPhoto();
      onAddDataUrl(dataUrl, 'عکس پرسنلی ۳×۴ (نمونه)');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition">
      {/* Hidden File inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/bmp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header with Upload Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            صف مدارک ({toPersianDigits(documents.length)} برگ)
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            (امکان اسکن و پردازش چند مدرک پشت‌سرهم)
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          {/* Sample Test Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSampleMenu(!showSampleMenu)}
              className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/70 px-2.5 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300 transition"
              aria-expanded={showSampleMenu}
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>تست با مدارک نمونه</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showSampleMenu && (
              <div
                className="absolute left-0 mt-1.5 z-30 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-xs"
                onMouseLeave={() => setShowSampleMenu(false)}
              >
                <button
                  type="button"
                  onClick={() => handleAddSample('degree')}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-right hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-semibold">گواهی موقت دانشگاهی</div>
                    <div className="text-[10px] text-slate-400">سند کج با مهر آبی و امضا</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSample('transcript')}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-right hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <FileText className="h-4 w-4 text-teal-500 shrink-0" />
                  <div>
                    <div className="font-semibold">کارنامه و ریز نمرات</div>
                    <div className="text-[10px] text-slate-400">جدول نمرات با مهرهای دانشگاه</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSample('melli')}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-right hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <CreditCard className="h-4 w-4 text-blue-500 shrink-0" />
                  <div>
                    <div className="font-semibold">کارت هوشمند ملی</div>
                    <div className="text-[10px] text-slate-400">کارت زاویه‌دار با شماره ملی</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSample('photo')}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-right hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <User className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <div className="font-semibold">عکس پرسنلی ۳×۴</div>
                    <div className="text-[10px] text-slate-400">برای سقف ۳۵ کیلوبایت سنجش</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Camera capture */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
            title="عکس با دوربین موبایل"
          >
            <Camera className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden sm:inline">دوربین</span>
          </button>

          {/* Gallery / File Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>بارگذاری مدرک</span>
          </button>
        </div>
      </div>

      {/* Queue items slider */}
      <div className="mt-3 flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5">
        {documents.map((doc, idx) => {
          const isActive = doc.id === activeDocId;
          const displayBytes = doc.processedBytes || 0;

          return (
            <div
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={`group relative flex cursor-pointer items-center gap-2.5 rounded-xl border p-2 text-right transition shrink-0 ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30 ring-1 ring-emerald-500/30'
                  : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={doc.processedDataUrl || doc.originalDataUrl}
                  alt={doc.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0 right-0 rounded-tl bg-slate-900/80 px-1 py-0.2 text-[9px] font-bold text-white">
                  #{toPersianDigits(idx + 1)}
                </span>
              </div>

              {/* Info */}
              <div className="min-w-[100px] max-w-[150px]">
                <div className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {doc.name}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {displayBytes > 0 ? formatBytesFa(displayBytes) : 'در حال پردازش'}
                  </span>
                </div>
              </div>

              {/* Delete button (if more than 1 doc) */}
              {documents.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDoc(doc.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 transition"
                  title="حذف مدرک"
                  aria-label={`حذف مدرک ${doc.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* Quick Add Card */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition"
          title="افزودن مدرک جدید"
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px] mt-0.5 font-medium">+ برگ جدید</span>
        </button>
      </div>
    </div>
  );
}
