import { Component } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { UserRole } from '../../models/auth.model';
import { AuthSessionService } from '../../services/auth-session.service';
import { AuthService } from '../../services/auth.service';
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
  imports: [ReactiveFormsModule, SidebarComponent, DashboardHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  activeKey = 'users';
  isProfileSubmitting = false;
  role: UserRole = 'unknown';
  isCompleteProfile = true;

  readonly profileForm = this.formBuilder.group({
    nationalCode: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    address: ['', [Validators.required, Validators.maxLength(500)]]
  });

  private readonly adminSidebarItems: SidebarItem[] = [
    { key: 'users', label: 'مدیریت کاربران', icon: 'group' },
    { key: 'roles', label: 'مدیریت نقش ها', icon: 'admin_panel_settings' },
    { key: 'appointments', label: 'نوبت‌ها', icon: 'calendar_month' },
    { key: 'reports', label: 'گزارش‌ها', icon: 'monitoring' },
    { key: 'settings', label: 'تنظیمات کلینیک', icon: 'settings' }
  ];

  private readonly consultantSidebarItems: SidebarItem[] = [
    { key: 'appointments', label: 'نوبت‌ها', icon: 'calendar_month' },
    { key: 'reports', label: 'گزارش مشاوره', icon: 'monitoring' }
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
    { title: 'Admin', members: '۲ کاربر', scope: 'مدیریت کاربران، نقش‌ها و مشاوران', access: 'کامل' },
    { title: 'Consultant', members: '۹ مشاور', scope: 'داشبورد مشاور و لیدهای اختصاص‌یافته', access: 'عملیاتی' },
    { title: 'پذیرش', members: '۵ کاربر', scope: 'نوبت‌دهی و بیماران', access: 'محدود' },
    { title: 'مالی', members: '۳ کاربر', scope: 'پرداخت و فاکتور', access: 'محدود' }
  ];

  constructor(
    private readonly formBuilder: NonNullableFormBuilder,
    private readonly authService: AuthService,
    private readonly authSession: AuthSessionService,
    private readonly toastr: ToastrService
  ) {
    const session = this.authSession.getSession();
    this.role = session?.role ?? 'unknown';
    this.isCompleteProfile = session?.isCompleteProfile ?? true;
    this.activeKey = this.role === 'consultant' ? 'appointments' : 'users';
  }

  get sidebarItems(): SidebarItem[] {
    if (this.requiresAdminProfile) {
      return [];
    }

    return this.role === 'consultant' ? this.consultantSidebarItems : this.adminSidebarItems;
  }

  get requiresAdminProfile(): boolean {
    return this.role === 'admin' && !this.isCompleteProfile;
  }

  get activeTitle(): string {
    return this.sidebarItems.find((item) => item.key === this.activeKey)?.label ?? 'داشبورد';
  }

  get activeSubtitle(): string {
    if (this.requiresAdminProfile) {
      return 'برای فعال شدن داشبورد، کد ملی و آدرس پروفایل ادمین را تکمیل کنید.';
    }

    if (this.role === 'consultant') {
      return 'دسترسی شما محدود به امکانات مشاور است.';
    }

    if (this.activeKey === 'users') {
      return 'کنترل کاربران، وضعیت حساب‌ها و سطح فعالیت پرسنل کلینیک';
    }

  setOnlineStatus(isOnline: boolean): void {
    if (isOnline && this.pendingOfflineCount > 0) {
      this.statusMessage = 'ابتدا لیدهای آفلاین خود را تعیین تکلیف کنید.';
      return;
    }

    this.consultantProfileService.setOnlineStatus(isOnline).subscribe((result) => {
      this.statusMessage = result.message;
    });
  }

  selectItem(item: SidebarItem): void {
    this.activeKey = item.key;

    if (item.route) {
      void this.router.navigateByUrl(item.route);
    }
  }

  get roleLabel(): string {
    if (this.role === 'admin') {
      return 'ادمین';
    }

    if (this.role === 'consultant') {
      return 'مشاور';
    }

    return 'کاربر';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  setActive(item: SidebarItem): void {
    if (this.requiresAdminProfile || !this.sidebarItems.some((sidebarItem) => sidebarItem.key === item.key)) {
      return;
    }

    this.activeKey = item.key;
    this.closeSidebar();
  }

  submitAdminProfile(): void {
    if (this.profileForm.invalid || this.isProfileSubmitting) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isProfileSubmitting = true;
    const value = this.profileForm.getRawValue();

    this.authService
      .completeAdminProfile({
        nationalCode: value.nationalCode.trim(),
        address: value.address.trim()
      })
      .pipe(finalize(() => (this.isProfileSubmitting = false)))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.toastr.error(result.message);
          return;
        }

        this.authSession.markProfileCompleted();
        this.isCompleteProfile = true;
        this.toastr.success(result.message);
      });
  }
}
