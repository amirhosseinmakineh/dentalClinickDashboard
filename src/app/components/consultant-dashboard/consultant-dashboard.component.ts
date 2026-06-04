import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthSessionService } from '../../services/auth-session.service';
import { ConsultantProfileService } from '../../services/consultant-profile.service';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { SidebarComponent, SidebarItem } from '../sidebar/sidebar.component';

interface ConsultantStat {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

@Component({
  selector: 'app-consultant-dashboard',
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, DashboardHeaderComponent],
  templateUrl: './consultant-dashboard.component.html',
  styleUrl: './consultant-dashboard.component.scss'
})
export class ConsultantDashboardComponent {
  isSidebarOpen = true;
  activeKey = 'overview';
  isProfileSubmitting = false;
  isCompleteProfile = true;

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authSession = inject(AuthSessionService);
  private readonly consultantProfileService = inject(ConsultantProfileService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly profileForm = this.formBuilder.group({
    nationalCode: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    address: ['', [Validators.required, Validators.maxLength(500)]]
  });

  readonly sidebarItems: SidebarItem[] = [
    { key: 'overview', label: 'نمای اولیه', icon: 'dashboard' },
    { key: 'appointments', label: 'نوبت‌ها', icon: 'calendar_month' },
    { key: 'reports', label: 'گزارش مشاوره', icon: 'monitoring' }
  ];

  readonly stats: ConsultantStat[] = [
    { label: 'نوبت‌های امروز', value: '۳۶', trend: '۸ نوبت در انتظار تایید', icon: 'event_available' },
    { label: 'پیگیری‌های فعال', value: '۱۲', trend: '۴ پیام جدید بیماران', icon: 'task_alt' },
    { label: 'لیدهای آنلاین', value: '۸', trend: 'آماده تماس اولیه', icon: 'support_agent' },
    { label: 'صف آفلاین', value: '۵', trend: 'نیازمند بررسی مشاور', icon: 'schedule' }
  ];

  constructor() {
    const session = this.authSession.getSession();
    this.isCompleteProfile = session?.isCompleteProfile ?? true;
  }

  get requiresProfileCompletion(): boolean {
    return !this.isCompleteProfile;
  }

  get activeTitle(): string {
    return this.sidebarItems.find((item) => item.key === this.activeKey)?.label ?? 'داشبورد مشاور';
  }

  get activeSubtitle(): string {
    return this.requiresProfileCompletion
      ? 'برای فعال شدن داشبورد، کد ملی و آدرس پروفایل مشاور را تکمیل کنید.'
      : 'دسترسی شما محدود به امکانات مشاور است.';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  setActive(item: SidebarItem): void {
    if (this.requiresProfileCompletion || !this.sidebarItems.some((sidebarItem) => sidebarItem.key === item.key)) {
      return;
    }

    this.activeKey = item.key;
    this.closeSidebar();
  }

  logout(): void {
    this.authSession.clear();
    void this.router.navigate(['/login']);
  }

  submitConsultantProfile(): void {
    if (this.profileForm.invalid || this.isProfileSubmitting) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const session = this.authSession.getSession();

    if (!session?.userId) {
      this.toastr.error('شناسه کاربر برای تکمیل پروفایل در توکن یافت نشد.');
      return;
    }

    const value = this.profileForm.getRawValue();
    this.isProfileSubmitting = true;

    this.consultantProfileService
      .completeProfile({
        UserId: session.userId,
        NationalityCode: value.nationalCode.trim(),
        Address: value.address.trim(),
        IsCompleteProfile: true
      })
      .pipe(finalize(() => (this.isProfileSubmitting = false)))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.toastr.error(result.message || 'تکمیل پروفایل مشاور ناموفق بود.');
          return;
        }

        this.authSession.markProfileCompleted();
        this.isCompleteProfile = true;
        this.toastr.success(result.message || 'پروفایل مشاور تکمیل شد.');
      });
  }

  trackByLabel(_index: number, item: { label: string }): string {
    return item.label;
  }
}
