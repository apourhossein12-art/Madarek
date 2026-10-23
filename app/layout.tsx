import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'اسکنر مدارک دانشگاهی ایران | DocScan Iran',
  description: 'ابزار هوشمند اسکن، تصحیح پرسپکتیو، حذف سایه، افزایش خوانایی و کنترل دقیق حجم فایل مدارک برای سامانه‌های دانشگاهی (آزمون، سنجش، گلستان)',
  openGraph: {
    title: 'اسکنر مدارک دانشگاهی ایران | DocScan Iran',
    description: 'ابزار هوشمند اسکن، تصحیح پرسپکتیو، حذف سایه، افزایش خوانایی و کنترل دقیق حجم فایل مدارک برای سامانه‌های دانشگاهی (آزمون، سنجش، گلستان)',
    type: 'website',
    locale: 'fa_IR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'اسکنر مدارک دانشگاهی ایران | DocScan Iran',
    description: 'ابزار هوشمند اسکن، تصحیح پرسپکتیو، حذف سایه و کنترل دقیق حجم فایل مدارک',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        {/* Load OpenCV.js asynchronously */}
        <Script
          src="https://docs.opencv.org/4.8.0/opencv.js"
          strategy="lazyOnload"
          id="opencv-script"
        />
        {children}
      </body>
    </html>
  );
}
