import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { RoleService } from '../../services/role.service';

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
  private readonly roleService = inject(RoleService);

  readonly dashboardUrl = this.roleService.getDashboardUrl();

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
    void this.router.navigateByUrl(this.roleService.getDashboardUrl());
  }
}
