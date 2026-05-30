import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { Gender } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../button/button.component';

interface GenderOption {
  value: Gender;
  label: string;
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly genderOptions: GenderOption[] = [
    { value: 'Female', label: 'زن' },
    { value: 'Male', label: 'مرد' },
    { value: 'Other', label: 'سایر' }
  ];
  readonly today = new Date().toISOString().split('T')[0];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-zÀ-ÿ\u0600-\u06FF\s'-]+$/)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-zÀ-ÿ\u0600-\u06FF\s'-]+$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
    gender: ['Female' as Gender, [Validators.required]],
    birthDate: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]]
  });

  isSubmitting = false;

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.showValidationErrors();
      return;
    }

    this.isSubmitting = true;

    this.authService.register(this.form.getRawValue())
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          const token = response.accessToken ?? response.token;

          if (token) {
            localStorage.setItem('authToken', token);
          }

          this.toastr.success('حساب کاربری شما با موفقیت ایجاد شد.', 'ثبت‌نام موفق');
          void this.router.navigateByUrl(this.authService.getRedirectUrl(response));
        },
        error: (error: unknown) => {
          this.toastr.error(this.getRegisterErrorMessage(error), 'خطا در ثبت‌نام');
        }
      });
  }

  private showValidationErrors(): void {
    const messages: string[] = [];
    const { firstName, lastName, phoneNumber, password, gender, birthDate } = this.form.controls;

    if (firstName.hasError('required')) {
      messages.push('نام را وارد کنید.');
    } else if (firstName.hasError('minlength')) {
      messages.push('نام باید حداقل ۲ کاراکتر باشد.');
    } else if (firstName.hasError('maxlength')) {
      messages.push('نام باید حداکثر ۵۰ کاراکتر باشد.');
    } else if (firstName.hasError('pattern')) {
      messages.push('نام فقط می‌تواند شامل حروف، فاصله، خط تیره یا آپاستروف باشد.');
    }

    if (lastName.hasError('required')) {
      messages.push('نام خانوادگی را وارد کنید.');
    } else if (lastName.hasError('minlength')) {
      messages.push('نام خانوادگی باید حداقل ۲ کاراکتر باشد.');
    } else if (lastName.hasError('maxlength')) {
      messages.push('نام خانوادگی باید حداکثر ۵۰ کاراکتر باشد.');
    } else if (lastName.hasError('pattern')) {
      messages.push('نام خانوادگی فقط می‌تواند شامل حروف، فاصله، خط تیره یا آپاستروف باشد.');
    }

    if (phoneNumber.hasError('required')) {
      messages.push('شماره موبایل را وارد کنید.');
    } else if (phoneNumber.hasError('pattern')) {
      messages.push('شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.');
    }

    if (password.hasError('required')) {
      messages.push('رمز عبور را وارد کنید.');
    } else if (password.hasError('minlength')) {
      messages.push('رمز عبور باید حداقل ۸ کاراکتر باشد.');
    } else if (password.hasError('maxlength')) {
      messages.push('رمز عبور باید حداکثر ۶۴ کاراکتر باشد.');
    } else if (password.hasError('pattern')) {
      messages.push('رمز عبور باید حداقل شامل یک حرف و یک عدد باشد.');
    }

    if (gender.hasError('required')) {
      messages.push('جنسیت را انتخاب کنید.');
    }

    if (birthDate.hasError('required')) {
      messages.push('تاریخ تولد را وارد کنید.');
    } else if (birthDate.hasError('pattern')) {
      messages.push('تاریخ تولد باید با قالب YYYY-MM-DD وارد شود.');
    }

    this.toastr.error(messages.join('\n'), 'خطا در اعتبارسنجی');
  }

  private getRegisterErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت یا وضعیت سرور را بررسی کنید.';
      }

      if (error.status === 400) {
        return 'اطلاعات واردشده معتبر نیست. لطفاً فرم را بررسی کنید و دوباره تلاش کنید.';
      }

      if (error.status === 409) {
        return 'این شماره موبایل قبلاً ثبت شده است.';
      }

      if (error.status >= 500) {
        return 'در سرور مشکلی رخ داده است. لطفاً کمی بعد دوباره تلاش کنید.';
      }
    }

    return 'امکان ایجاد حساب وجود ندارد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.';
  }
}
