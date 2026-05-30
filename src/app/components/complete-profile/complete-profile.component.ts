import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { AuthSession } from '../../base/auth-session';
import { getDashboardUrl } from '../../base/role-routing';

@Component({
  selector: 'app-complete-profile',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './complete-profile.component.html',
  styleUrl: './complete-profile.component.scss'
})
export class CompleteProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly user = AuthSession.getUser();

  readonly dashboardUrl = getDashboardUrl(this.user?.role);

  readonly form = this.fb.nonNullable.group({
    nationalCode: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    emergencyPhone: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    address: ['', [Validators.required, Validators.minLength(8)]],
    medicalNotes: ['']
  });

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.toastr.error('لطفاً فیلدهای ضروری پروفایل را تکمیل کنید.', 'اطلاعات ناقص');
      return;
    }

    this.toastr.success('اطلاعات پروفایل به صورت نمایشی ثبت شد.', 'تکمیل پروفایل');
    void this.router.navigateByUrl(getDashboardUrl(this.user?.role));
  }
}
