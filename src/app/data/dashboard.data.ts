import { PaginatedResult } from '../base/api-response.models';
import { AppRole } from '../models/auth.models';

export interface SidebarItem {
  icon: string;
  label: string;
  badge?: string;
}

export interface DashboardMetric {
  icon: string;
  label: string;
  value: string;
  trend: string;
}

export interface DashboardTableRow {
  name: string;
  detail: string;
  status: string;
  time: string;
}

export interface DashboardConfig {
  role: AppRole;
  title: string;
  subtitle: string;
  sidebarItems: SidebarItem[];
  metrics: DashboardMetric[];
  tableTitle: string;
  table: PaginatedResult<DashboardTableRow>;
  quickActions: SidebarItem[];
}

export const dashboardConfigs: Record<AppRole, DashboardConfig> = {
  Admin: {
    role: 'Admin',
    title: 'داشبورد ادمین',
    subtitle: 'کنترل مرکزی کلینیک، کاربران و دسترسی‌ها',
    sidebarItems: [
      { icon: '👥', label: 'مدیریت کاربران' },
      { icon: '🦷', label: 'مدیریت بیماران' },
      { icon: '🗂️', label: 'مدیریت منشی‌ها' },
      { icon: '💬', label: 'مدیریت مشاوران' },
      { icon: '🛡️', label: 'مدیریت ادمین‌ها' }
    ],
    metrics: [
      { icon: '👥', label: 'کاربران فعال', value: '۱,۲۴۸', trend: '۱۲٪ رشد ماهانه' },
      { icon: '📅', label: 'نوبت‌های امروز', value: '۳۶', trend: '۸ نوبت در انتظار' },
      { icon: '💳', label: 'پرداخت‌های موفق', value: '۲۸', trend: '۹۵٪ نرخ موفقیت' }
    ],
    tableTitle: 'آخرین فعالیت‌های مدیریتی',
    table: {
      items: [
      { name: 'ایجاد دسترسی منشی', detail: 'کاربر: سارا احمدی', status: 'تکمیل شده', time: '۱۰:۲۰' },
      { name: 'بازبینی پرونده بیمار', detail: 'بیمار: علی محمدی', status: 'در جریان', time: '۱۱:۱۵' },
      { name: 'گزارش نقش‌ها', detail: 'سطح دسترسی ادمین‌ها', status: 'آماده', time: '۱۲:۴۰' }
      ],
      totalCount: 3,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1
    },
    quickActions: [
      { icon: '➕', label: 'افزودن کاربر' },
      { icon: '📊', label: 'گزارش کلینیک' },
      { icon: '⚙️', label: 'تنظیمات دسترسی' }
    ]
  },
  Secretary: {
    role: 'Secretary',
    title: 'داشبورد منشی',
    subtitle: 'مدیریت نوبت‌ها، پذیرش و هماهنگی بیماران',
    sidebarItems: [
      { icon: '📆', label: 'برنامه امروز' },
      { icon: '🧾', label: 'پذیرش بیماران' },
      { icon: '📞', label: 'تماس‌های پیگیری' },
      { icon: '💳', label: 'پرداخت‌ها' }
    ],
    metrics: [
      { icon: '📆', label: 'نوبت امروز', value: '۲۴', trend: '۵ نفر منتظر تایید' },
      { icon: '🧾', label: 'پذیرش شده', value: '۱۸', trend: '۷۵٪ برنامه روز' },
      { icon: '📞', label: 'تماس‌های باز', value: '۹', trend: '۳ تماس فوری' }
    ],
    tableTitle: 'لیست پذیرش نمونه',
    table: {
      items: [
      { name: 'مریم رضایی', detail: 'جرم‌گیری', status: 'در انتظار', time: '۱۰:۰۰' },
      { name: 'محمد کریمی', detail: 'ترمیم دندان', status: 'پذیرش شد', time: '۱۰:۳۰' },
      { name: 'نگار حسینی', detail: 'مشاوره ارتودنسی', status: 'پیگیری', time: '۱۱:۰۰' }
      ],
      totalCount: 3,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1
    },
    quickActions: [
      { icon: '➕', label: 'ثبت نوبت' },
      { icon: '✅', label: 'تایید حضور' },
      { icon: '📨', label: 'ارسال پیامک' }
    ]
  },
  Consultant: {
    role: 'Consultant',
    title: 'داشبورد مشاور',
    subtitle: 'پیگیری مشاوره‌ها و برنامه درمان بیماران',
    sidebarItems: [
      { icon: '💬', label: 'مشاوره‌های امروز' },
      { icon: '📋', label: 'برنامه درمان' },
      { icon: '🦷', label: 'پرونده‌های ارجاعی' },
      { icon: '📈', label: 'گزارش مشاوره' }
    ],
    metrics: [
      { icon: '💬', label: 'جلسات امروز', value: '۱۲', trend: '۴ جلسه آنلاین' },
      { icon: '📋', label: 'طرح درمان باز', value: '۲۱', trend: '۶ مورد نیازمند تایید' },
      { icon: '⭐', label: 'رضایت بیماران', value: '۹۴٪', trend: 'بر اساس نظرسنجی' }
    ],
    tableTitle: 'پرونده‌های مشاوره نمونه',
    table: {
      items: [
      { name: 'سینا صالحی', detail: 'ایمپلنت', status: 'نیازمند تماس', time: '۰۹:۴۵' },
      { name: 'الهام قربانی', detail: 'ارتودنسی', status: 'طرح آماده', time: '۱۱:۳۰' },
      { name: 'پارسا نوری', detail: 'زیبایی لبخند', status: 'در بررسی', time: '۱۳:۱۵' }
      ],
      totalCount: 3,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1
    },
    quickActions: [
      { icon: '📝', label: 'ثبت یادداشت' },
      { icon: '📞', label: 'تماس با بیمار' },
      { icon: '📎', label: 'افزودن فایل' }
    ]
  },
  Patient: {
    role: 'Patient',
    title: 'داشبورد بیمار',
    subtitle: 'مشاهده نوبت‌ها، درمان‌ها و پیام‌های کلینیک',
    sidebarItems: [
      { icon: '📅', label: 'نوبت‌های من' },
      { icon: '🦷', label: 'پرونده درمان' },
      { icon: '💳', label: 'پرداخت‌ها' },
      { icon: '💬', label: 'پیام‌ها' }
    ],
    metrics: [
      { icon: '📅', label: 'نوبت بعدی', value: '۲ روز', trend: 'سه‌شنبه ساعت ۱۰' },
      { icon: '🦷', label: 'درمان‌های فعال', value: '۳', trend: 'یک مورد نیازمند پیگیری' },
      { icon: '💬', label: 'پیام‌های جدید', value: '۲', trend: 'از پذیرش و مشاور' }
    ],
    tableTitle: 'نوبت‌های نمونه من',
    table: {
      items: [
      { name: 'ویزیت دندان‌پزشک', detail: 'اتاق ۲', status: 'تایید شده', time: 'سه‌شنبه ۱۰:۰۰' },
      { name: 'رادیولوژی', detail: 'مرکز تصویربرداری', status: 'در انتظار', time: 'پنجشنبه ۱۲:۳۰' },
      { name: 'مشاوره درمان', detail: 'تماس آنلاین', status: 'برنامه‌ریزی', time: 'شنبه ۱۶:۰۰' }
      ],
      totalCount: 3,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1
    },
    quickActions: [
      { icon: '📅', label: 'درخواست نوبت' },
      { icon: '💳', label: 'پرداخت آنلاین' },
      { icon: '💬', label: 'ارسال پیام' }
    ]
  },
  User: {
    role: 'User',
    title: 'داشبورد کاربر عادی',
    subtitle: 'دسترسی عمومی به خدمات و اطلاعیه‌های کلینیک',
    sidebarItems: [
      { icon: '🏠', label: 'نمای کلی' },
      { icon: '🦷', label: 'خدمات کلینیک' },
      { icon: '📣', label: 'اطلاعیه‌ها' },
      { icon: '☎️', label: 'ارتباط با کلینیک' }
    ],
    metrics: [
      { icon: '🦷', label: 'خدمات فعال', value: '۸', trend: 'زیبایی، ترمیمی و درمانی' },
      { icon: '📣', label: 'اطلاعیه جدید', value: '۳', trend: 'آخرین بروزرسانی امروز' },
      { icon: '⭐', label: 'امتیاز کلینیک', value: '۴.۸', trend: 'میانگین نظرات بیماران' }
    ],
    tableTitle: 'اطلاعیه‌های نمونه',
    table: {
      items: [
      { name: 'طرح لبخند بهاری', detail: 'تخفیف خدمات زیبایی', status: 'فعال', time: 'این هفته' },
      { name: 'ساعات کاری جدید', detail: 'شنبه تا پنجشنبه', status: 'منتشر شده', time: 'امروز' },
      { name: 'راهنمای مراجعه', detail: 'مدارک لازم پذیرش', status: 'قابل مشاهده', time: 'همیشه' }
      ],
      totalCount: 3,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 1
    },
    quickActions: [
      { icon: '📄', label: 'مشاهده خدمات' },
      { icon: '☎️', label: 'تماس با ما' },
      { icon: '📍', label: 'مسیریابی' }
    ]
  }
};
