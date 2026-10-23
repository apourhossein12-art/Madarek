'use client';

import React from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, Camera, ShieldAlert } from 'lucide-react';
import { toPersianDigits } from '@/lib/image-math';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UniversityGuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-7 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">راهنمای بارگذاری مدارک در سامانه‌های دانشگاهی</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مشخصات فنی و شرایط پذیرش مدارک در سایت‌های آزمون و دانشگاه آزاد
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="بستن پنجره"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 pt-5 text-sm leading-relaxed">
          {/* Table of Portals */}
          <div>
            <h3 className="mb-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              سقف مجاز حجم و ابعاد مدارک در سامانه‌های ایران
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3">سامانه / دانشگاه</th>
                    <th className="p-3">نوع مدرک</th>
                    <th className="p-3">حداکثر حجم مجاز</th>
                    <th className="p-3">ابعاد استاندارد</th>
                    <th className="p-3">فرمت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      پذیرش دانشگاه آزاد (paziresh.azmoon.iau.ir)
                    </td>
                    <td className="p-3">عکس پرسنلی ۳×۴</td>
                    <td className="p-3 font-bold">{toPersianDigits(35)} کیلوبایت</td>
                    <td className="p-3">۳۰۰ × ۴۰۰ پیکسل</td>
                    <td className="p-3">JPG</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      دانشگاه آزاد و آزمون
                    </td>
                    <td className="p-3">کارت ملی، شناسنامه، مدرک دیپلم</td>
                    <td className="p-3 font-bold">{toPersianDigits(512)} کیلوبایت</td>
                    <td className="p-3">حداقل ۸۰۰ × ۱۲۰۰</td>
                    <td className="p-3">JPG</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-amber-600 dark:text-amber-400">
                      سازمان سنجش (sanjesh.org)
                    </td>
                    <td className="p-3">عکس داوطلب کنکور / ارشد</td>
                    <td className="p-3 font-bold">{toPersianDigits(70)} کیلوبایت</td>
                    <td className="p-3">بین ۲۰۰×۳۰۰ تا ۳۰۰×۴۰۰</td>
                    <td className="p-3">JPG</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-purple-600 dark:text-purple-400">
                      سامانه جامع گلستان
                    </td>
                    <td className="p-3">مدارک پذیرش غیرحضوری</td>
                    <td className="p-3 font-bold">{toPersianDigits(250)} کیلوبایت</td>
                    <td className="p-3">A4 خوانا</td>
                    <td className="p-3">JPG / JPEG</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">
                      سامانه آموزشیار (edu.iau.ac.ir)
                    </td>
                    <td className="p-3">مدارک ثبت‌نام و تطبیق واحد</td>
                    <td className="p-3 font-bold">{toPersianDigits(512)} کیلوبایت</td>
                    <td className="p-3">بدون حاشیه اضافه</td>
                    <td className="p-3">JPG</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Common Errors & Solutions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
              <h4 className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 mb-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                خطای رایج: «حجم فایل بیش از حد مجاز است»
              </h4>
              <p className="text-xs text-red-800/90 dark:text-red-300">
                سامانه‌های دانشگاهی حتی با ۱ بایت بیشتر فایل را رد می‌کنند!
                الگوریتم فشرده‌سازی باینری‌سرچ این اپ، حجم تصویر را دقیقاً به اندازه زیر سقف انتخابی شما (مثلاً کمتر از ۳۵ یا ۵۱۲ کیلوبایت) تضمین می‌کند.
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
              <h4 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 mb-2">
                <Camera className="h-4 w-4 shrink-0" />
                نکات عکس‌برداری با گوشی موبایل
              </h4>
              <ul className="text-xs space-y-1 text-blue-800/90 dark:text-blue-300 list-disc list-inside">
                <li>مدرک را روی سطح صاف با نور طبیعی قرار دهید (بدون فلش مستقیم).</li>
                <li>حتی اگر عکس کج باشد، ابزار تصحیح پرسپکتیو ۴ گوشه آن را صاف می‌کند.</li>
                <li>سایه دست یا گوشی با فعال‌سازی گزینه «حذف سایه» پاک می‌شود.</li>
              </ul>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-bold">تضمین حریم خصوصی مدارک هویتی: </span>
              کارت ملی، شناسنامه و مدارک تحصیلی شما به هیچ سروری آپلود نمی‌شوند. تمامی مراحل برش، اصلاح رنگ، و فشرده‌سازی مستقیماً در پردازنده مرورگر گوشی یا رایانه شما انجام می‌پذیرد.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
          >
            متوجه شدم، بستن راهنما
          </button>
        </div>
      </div>
    </div>
  );
}
