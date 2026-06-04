import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthSessionService } from '../../services/auth-session.service';
import { ConsultantProfileService } from '../../services/consultant-profile.service';

interface ConsultantStat {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

@Component({
  selector: 'app-consultant-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consultant-dashboard.component.html',
  styleUrl: './consultant-dashboard.component.scss'
})
export class ConsultantDashboardComponent {
  @Input() activeKey = 'consultant-dashboard';

  isProfileSubmitting = false;
  isCompleteProfile = true;

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authSession = inject(AuthSessionService);
  private readonly consultantProfileService = inject(ConsultantProfileService);
  private readonly toastr = inject(ToastrService);

  readonly profileForm = this.formBuilder.group({
    nationalCode: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    address: ['', [Validators.required, Validators.maxLength(500)]]
  });

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

  get isInitialView(): boolean {
    return this.activeKey === 'consultant-dashboard';
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
