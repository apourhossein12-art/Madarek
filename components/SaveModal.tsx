'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Smartphone,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { DocumentItem } from '@/lib/image-types';
import { formatBytesFa, toPersianDigits } from '@/lib/image-math';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentItem: DocumentItem;
}

export default function SaveModal({ isOpen, onClose, documentItem }: SaveModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !documentItem.processedDataUrl) return null;

  const fileName = `madrak-${documentItem.id.slice(0, 6)}.jpg`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentItem.processedDataUrl!;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!documentItem.processedBlob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': documentItem.processedBlob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative flex flex-col w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">مدرک نهایی آماده بارگذاری در سایت دانشگاه</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                حجم: {formatBytesFa(documentItem.processedBytes || 0)} • ابعاد:{' '}
                {toPersianDigits(documentItem.processedWidth || 0)} ×{' '}
                {toPersianDigits(documentItem.processedHeight || 0)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body with Image */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center bg-slate-950/90 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={documentItem.processedDataUrl}
            alt="مدرک آماده ذخیره"
            className="max-h-[50vh] max-w-full rounded-lg object-contain shadow-2xl border border-slate-800 select-auto touch-auto"
          />

          {/* Mobile Long Press Tip */}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-2 text-xs text-amber-700 dark:text-amber-300 border border-amber-500/20 max-w-md">
            <Smartphone className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-right text-[11px] leading-relaxed">
              <span className="font-bold">کاربران گوشی موبایل:</span> می‌توانید انگشت خود را روی تصویر بالا نگه دارید (لمس طولانی / Long Press) و گزینه «ذخیره تصویر / Save Image» را بزنید.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>مطابق با مشخصات فنی سامانه سنجش و آزمون</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'کپی شد!' : 'کپی تصویر'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
            >
              <Download className="h-4 w-4" />
              <span>دانلود فایل JPG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
