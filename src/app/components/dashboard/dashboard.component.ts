import { Component } from '@angular/core';

import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { SidebarComponent, SidebarItem } from '../sidebar/sidebar.component';

interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

interface UserRow {
  name: string;
  role: string;
  phone: string;
  status: string;
  lastSeen: string;
}

interface RoleRow {
  title: string;
  members: string;
  scope: string;
  access: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [SidebarComponent, DashboardHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  isSidebarOpen = true;
  activeKey = 'users';

  readonly sidebarItems: SidebarItem[] = [
    { key: 'users', label: 'مدیریت کاربران', icon: 'group' },
    { key: 'roles', label: 'مدیریت نقش ها', icon: 'admin_panel_settings' },
    { key: 'appointments', label: 'نوبت‌ها', icon: 'calendar_month' },
    { key: 'reports', label: 'گزارش‌ها', icon: 'monitoring' },
    { key: 'settings', label: 'تنظیمات کلینیک', icon: 'settings' }
  ];

  readonly stats: DashboardStat[] = [
    { label: 'بیماران فعال', value: '۲,۴۸۰', trend: '+۱۲٪ نسبت به ماه قبل', icon: 'groups' },
    { label: 'نوبت‌های امروز', value: '۳۶', trend: '۸ نوبت در انتظار تایید', icon: 'event_available' },
    { label: 'درآمد ماه جاری', value: '۴۸۰م', trend: '+۱۸٪ رشد ماهانه', icon: 'payments' },
    { label: 'درمان‌های باز', value: '۱۲۴', trend: '۲۱ پرونده نیازمند پیگیری', icon: 'medical_services' }
  ];

  readonly users: UserRow[] = [
    { name: 'دکتر نرگس محمدی', role: 'مدیر کلینیک', phone: '۰۹۱۲ ۴۴۴ ۱۲۰۰', status: 'فعال', lastSeen: '۱۰ دقیقه پیش' },
    { name: 'مریم احمدی', role: 'پذیرش', phone: '۰۹۳۵ ۸۸۱ ۳۴۰۰', status: 'فعال', lastSeen: 'امروز، ۱۲:۳۰' },
    { name: 'علی رضایی', role: 'حسابداری', phone: '۰۹۱۹ ۲۲۱ ۷۶۵۴', status: 'در انتظار تایید', lastSeen: 'دیروز' },
    { name: 'سارا کریمی', role: 'دستیار پزشک', phone: '۰۹۰۲ ۳۳۸ ۵۴۱۱', status: 'غیرفعال', lastSeen: '۳ روز پیش' }
  ];

  readonly roles: RoleRow[] = [
    { title: 'مدیر سیستم', members: '۲ کاربر', scope: 'تمام بخش‌ها', access: 'کامل' },
    { title: 'پذیرش', members: '۵ کاربر', scope: 'نوبت‌دهی و بیماران', access: 'عملیاتی' },
    { title: 'پزشک', members: '۹ کاربر', scope: 'پرونده درمانی', access: 'تخصصی' },
    { title: 'مالی', members: '۳ کاربر', scope: 'پرداخت و فاکتور', access: 'محدود' }
  ];

  get activeTitle(): string {
    return this.sidebarItems.find((item) => item.key === this.activeKey)?.label ?? 'داشبورد مدیریت';
  }

  get activeSubtitle(): string {
    if (this.activeKey === 'users') {
      return 'کنترل کاربران، وضعیت حساب‌ها و سطح فعالیت پرسنل کلینیک';
    }

    if (this.activeKey === 'roles') {
      return 'تعریف نقش‌ها، گروه‌های دسترسی و محدوده مجوزهای پنل';
    }

    return 'نمای کلی عملیات کلینیک، دسترسی‌ها، گزارش‌ها و وضعیت روزانه';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  selectItem(item: SidebarItem): void {
    this.activeKey = item.key;
  }
}
