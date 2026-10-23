/**
 * Generates realistic Iranian academic documents & ID cards for immediate testing and demo
 */

export interface SampleDoc {
  id: string;
  title: string;
  category: 'degree' | 'melli_card' | 'photo_3x4';
  description: string;
  recommendedMaxKb: number;
  generateDataUrl: () => string;
}

export function createSampleDegreeCertificate(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background: desk or surface texture with slight angle
  ctx.fillStyle = '#2b2c34';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Angled document on desk
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-0.06); // skewed by ~3.5 degrees
  ctx.translate(-500, -700);

  // Paper shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 12;
  ctx.shadowOffsetY = 18;

  // Paper background (slightly aged university parchment)
  ctx.fillStyle = '#fbf9f4';
  ctx.fillRect(0, 0, 1000, 1400);

  ctx.shadowColor = 'transparent';

  // Decorative border
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 940, 1340);
  ctx.strokeStyle = '#9ca3af';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, 920, 1320);

  // Document Content (Persian RTL)
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#111827';

  // Header
  ctx.font = 'bold 36px Vazirmatn, sans-serif';
  ctx.fillText('بسمه تعالی', 500, 120);

  ctx.font = 'bold 28px Vazirmatn, sans-serif';
  ctx.fillText('جمهوری اسلامی ایران', 500, 180);

  ctx.font = 'bold 32px Vazirmatn, sans-serif';
  ctx.fillText('دانشگاه آزاد اسلامی واحد علوم و تحقیقات', 500, 240);

  ctx.font = 'bold 36px Vazirmatn, sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('گواهی موقت پایان تحصیلات دانشگاهی', 500, 320);

  // Text body
  ctx.fillStyle = '#1f2937';
  ctx.font = '22px Vazirmatn, sans-serif';
  ctx.textAlign = 'right';

  const lines = [
    'بدین‌وسیله گواهی می‌شود که خانم / آقای: علیرضا رضایی',
    'فرزند: محمد رضا       شماره شناسنامه / کد ملی: ۰۰۱۲۳۴۵۶۷۸',
    'متولد سال: ۱۳۷۸       شماره دانشجویی: ۹۷۱۱۲۳۴۵۶۷',
    'در دوره: کارشناسی پیوسته       رشته: مهندسی کامپیوتر - نرم‌افزار',
    'با معدل کل: ۱۷.۸۵ (هفده و هشتاد و پنج صدم) فارغ‌التحصیل شده است.',
    'این گواهی جهت ثبت‌نام و پذیرش در مقاطع بالاتر تحصیلی صادر گردیده و فاقد ارزش ترجمه است.',
  ];

  let y = 430;
  for (const line of lines) {
    ctx.fillText(line, 900, y);
    y += 55;
  }

  // Barcode representation
  ctx.fillStyle = '#000000';
  for (let b = 100; b < 400; b += Math.floor(Math.random() * 8) + 4) {
    ctx.fillRect(b, 800, Math.floor(Math.random() * 4) + 1, 60);
  }
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TR-98234-8849-IR', 250, 880);

  // Official Stamp (Blue Circular Stamp with Persian text)
  ctx.save();
  ctx.translate(320, 1050);
  ctx.rotate(-0.15);
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 95, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 85, 0, Math.PI * 2);
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = 'bold 18px Vazirmatn, sans-serif';
  ctx.fillStyle = '#1d4ed8';
  ctx.textAlign = 'center';
  ctx.fillText('دانشگاه آزاد اسلامی', 0, -35);
  ctx.fillText('اداره کل فارغ‌التحصیلان', 0, 0);
  ctx.fillText('مهر رسمی و معتبر', 0, 35);
  ctx.restore();

  // Red Notary / Dean Signature & Seal
  ctx.save();
  ctx.translate(720, 1080);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 80, 50, 0.1, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = 'bold 16px Vazirmatn, sans-serif';
  ctx.fillStyle = '#b91c1c';
  ctx.textAlign = 'center';
  ctx.fillText('معاونت آموزشی و تحصیلات تکمیلی', 0, 0);

  // Handwritten pen signature
  ctx.strokeStyle = '#1e40af';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-60, 40);
  ctx.bezierCurveTo(-30, -30, 20, 80, 60, 20);
  ctx.bezierCurveTo(40, -10, -10, 60, 80, 50);
  ctx.stroke();
  ctx.restore();

  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

export function createSampleMelliCard(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1100;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Surface background
  ctx.fillStyle = '#374151';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Card tilted
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(0.04);
  ctx.translate(-428, -270);

  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 10;
  ctx.shadowOffsetY = 14;

  // National ID Card body
  const cardW = 856;
  const cardH = 540;
  const radius = 24;

  ctx.beginPath();
  ctx.roundRect(0, 0, cardW, cardH, radius);
  const grad = ctx.createLinearGradient(0, 0, cardW, cardH);
  grad.addColorStop(0, '#e0f2fe');
  grad.addColorStop(0.5, '#f0fdf4');
  grad.addColorStop(1, '#fef3c7');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Flag stripes on top header
  ctx.fillStyle = '#15803d';
  ctx.fillRect(40, 20, 220, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 28, 220, 8);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(40, 36, 220, 8);

  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px Vazirmatn, sans-serif';
  ctx.fillText('جمهوری اسلامی ایران', 810, 60);
  ctx.font = 'bold 24px Vazirmatn, sans-serif';
  ctx.fillStyle = '#0369a1';
  ctx.fillText('کارت هوشمند ملی', 810, 95);

  // Photo Box on left
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(60, 140, 180, 240);
  ctx.strokeStyle = '#64748b';
  ctx.strokeRect(60, 140, 180, 240);

  // Person silhouette
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(150, 220, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(150, 340, 70, 50, 0, Math.PI, 0);
  ctx.fill();

  // Smart Chip Graphic
  ctx.fillStyle = '#d97706';
  ctx.fillRect(280, 180, 100, 75);
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.strokeRect(280, 180, 100, 75);

  // Personal Info Fields
  ctx.fillStyle = '#1e293b';
  ctx.font = '20px Vazirmatn, sans-serif';
  ctx.fillText('نام: علی', 810, 190);
  ctx.fillText('نام خانوادگی: محمدی تبریزی', 810, 235);
  ctx.fillText('نام پدر: حسن', 810, 280);
  ctx.fillText('تاریخ تولد: ۱۳۷۵/۰۶/۱۵', 810, 325);
  ctx.fillText('تاریخ اعتبار: ۱۴۰۸/۰۶/۱۵', 810, 370);

  // National Code with bold typography
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px Vazirmatn, monospace';
  ctx.fillText('شماره ملی:   ۰۰۸ - ۳۴۵۶۷۸ - ۹', 810, 440);

  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.92);
}

export function createSamplePortraitPhoto(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800; // 3:4 ratio
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Standard university portrait background: clean studio light blue/white
  const grad = ctx.createRadialGradient(300, 350, 50, 300, 400, 450);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.8, '#dbeafe');
  grad.addColorStop(1, '#bfdbfe');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Student bust / portrait
  // Shoulders & Shirt
  ctx.fillStyle = '#1e3a8a';
  ctx.beginPath();
  ctx.ellipse(300, 780, 250, 180, 0, Math.PI, 0);
  ctx.fill();

  // Collar
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(250, 600);
  ctx.lineTo(300, 660);
  ctx.lineTo(350, 600);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = '#fbcfe8';
  ctx.fillRect(265, 480, 70, 130);

  // Head
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.ellipse(300, 380, 120, 160, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.arc(300, 330, 125, Math.PI * 0.8, Math.PI * 2.2);
  ctx.fill();

  // Eyes & Eyebrows
  ctx.fillStyle = '#44403c';
  ctx.fillRect(240, 360, 35, 10);
  ctx.fillRect(325, 360, 35, 10);
  ctx.beginPath();
  ctx.arc(257, 390, 8, 0, Math.PI * 2);
  ctx.arc(342, 390, 8, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(300, 440, 30, 0.2, Math.PI - 0.2);
  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.9);
}

export function createSampleTranscript(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background surface with slight angle
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-0.04);
  ctx.translate(-500, -700);

  // Paper Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 14;

  // Paper
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1000, 1400);

  ctx.shadowColor = 'transparent';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';

  // University Header
  ctx.font = 'bold 28px Vazirmatn, sans-serif';
  ctx.fillText('دانشگاه آزاد اسلامی', 500, 100);
  ctx.font = 'bold 22px Vazirmatn, sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.fillText('کارنامه تحصیلی / فارغ‌التحصیل', 500, 145);

  ctx.font = '18px Vazirmatn, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.textAlign = 'right';
  ctx.fillText('نام: علیرضا        نام خانوادگی: سزار        شماره دانشجویی: ۹۴۱۲۳۴۵۶', 920, 210);
  ctx.fillText('رشته: مهندسی مواد و متالورژی - متالورژی صنعتی        مقطع: کارشناسی پیوسته', 920, 245);
  ctx.fillText('وضعیت: فارغ‌التحصیل        معدل کل: ۱۵.۷۹', 920, 280);

  // Transcript Table
  const tableTop = 320;
  const tableW = 860;
  const tableX = 70;

  // Header row
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(tableX, tableTop, tableW, 40);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tableX, tableTop, tableW, 40);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px Vazirmatn, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('کد درس', tableX + 80, tableTop + 26);
  ctx.fillText('نام درس', tableX + 340, tableTop + 26);
  ctx.fillText('تعداد واحد', tableX + 580, tableTop + 26);
  ctx.fillText('نمره', tableX + 690, tableTop + 26);
  ctx.fillText('وضعیت', tableX + 790, tableTop + 26);

  // Table rows
  const courses = [
    { code: '۳۴۹۴۱۰۲۳', name: 'آزمایشگاه جوشکاری', unit: '۱', grade: '۱۹.۵۰', status: 'قبول' },
    { code: '۱۰۲۱۰۴۳۹', name: 'اندیشه اسلامی ۱ (مبدأ و معاد)', unit: '۲', grade: '۱۷.۰۰', status: 'قبول' },
    { code: '۳۴۹۴۱۵۳۲', name: 'روش‌های نوین آنالیز مواد', unit: '۳', grade: '۱۶.۲۵', status: 'قبول' },
    { code: '۳۴۹۴۱۲۱۶', name: 'ریاضی مهندسی پیشرفته', unit: '۳', grade: '۱۴.۵۰', status: 'قبول' },
    { code: '۳۴۹۴۱۶۱۰', name: 'فیزیک جامدات', unit: '۳', grade: '۱۸.۰۰', status: 'قبول' },
    { code: '۳۴۹۴۱۶۵۸', name: 'مبانی مهندسی برق', unit: '۳', grade: '۱۵.۰۰', status: 'قبول' },
    { code: '۳۴۹۴۱۶۱۱', name: 'متالورژی جوشکاری و بازرسی', unit: '۳', grade: '۱۸.۷۵', status: 'قبول' },
    { code: '۳۴۹۴۱۶۷۳', name: 'محاسبات عددی', unit: '۲', grade: '۱۶.۰۰', status: 'قبول' },
    { code: '۳۴۹۴۱۶۴۷', name: 'استخراج فلزات ۲ (پیرو متالورژی)', unit: '۳', grade: '۱۷.۵۰', status: 'قبول' },
    { code: '۳۴۹۴۱۵۳۶', name: 'پروژه کارشناسی و سمینار', unit: '۳', grade: '۲۰.۰۰', status: 'قبول' },
  ];

  ctx.font = '15px Vazirmatn, sans-serif';
  let ry = tableTop + 40;
  for (const c of courses) {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(tableX, ry, tableW, 36);

    ctx.fillStyle = '#1e293b';
    ctx.fillText(c.code, tableX + 80, ry + 24);
    ctx.textAlign = 'right';
    ctx.fillText(c.name, tableX + 500, ry + 24);
    ctx.textAlign = 'center';
    ctx.fillText(c.unit, tableX + 580, ry + 24);
    ctx.fillText(c.grade, tableX + 690, ry + 24);
    ctx.fillText(c.status, tableX + 790, ry + 24);

    ry += 36;
  }

  // Summary box
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(tableX, ry + 20, tableW, 50);
  ctx.strokeStyle = '#64748b';
  ctx.strokeRect(tableX, ry + 20, tableW, 50);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px Vazirmatn, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('تعداد واحد گذرانده: ۱۴۲ واحد        معدل نیمسال: ۱۶.۴۰        معدل کل دانش‌آموختگی: ۱۵.۷۹', tableX + tableW - 30, ry + 52);

  // Seals and Signatures at bottom
  // 1. Blue circular seal: اداره امتحانات
  ctx.save();
  ctx.translate(280, 1160);
  ctx.rotate(-0.1);
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, 75, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = 'bold 14px Vazirmatn, sans-serif';
  ctx.fillStyle = '#1d4ed8';
  ctx.textAlign = 'center';
  ctx.fillText('دانشگاه آزاد اسلامی', 0, -20);
  ctx.fillText('مسئول اداره امتحانات', 0, 10);
  ctx.restore();

  // 2. Notary Stamp & Signature: معاون علمی و آموزشی
  ctx.save();
  ctx.translate(680, 1170);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 75, 45, 0.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = 'bold 14px Vazirmatn, sans-serif';
  ctx.fillStyle = '#b91c1c';
  ctx.textAlign = 'center';
  ctx.fillText('معاون علمی (آموزشی و پژوهشی)', 0, 0);

  // Pen signature
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-50, 30);
  ctx.bezierCurveTo(-20, -40, 30, 60, 70, 10);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.92);
}
