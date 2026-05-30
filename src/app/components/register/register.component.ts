import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { getBackendErrorMessage, getResponseMessage, isSuccessfulResponse } from '../../base/api-response.models';
import {
  CalendarDay,
  buildJalaliCalendarDays,
  formatGregorianDate,
  formatJalaliDisplay,
  persianMonths,
  persianWeekDays,
  toJalali,
  toPersianDigits
} from '../../base/jalali-date';
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
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly genderOptions: GenderOption[] = [
    { value: 'Female', label: 'زن' },
    { value: 'Male', label: 'مرد' },
    { value: 'Other', label: 'سایر' }
  ];
  readonly today = formatGregorianDate(new Date());
  readonly persianMonths = persianMonths;
  readonly persianWeekDays = persianWeekDays;

  isSubmitting = false;
  isBirthDatePickerOpen = false;
  birthDateDisplay = '';

  private readonly todayJalali = toJalali(new Date());
  viewJalaliYear = this.todayJalali.jy;
  viewJalaliMonth = this.todayJalali.jm;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-zÀ-ÿ\u0600-\u06FF\s'-]+$/)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-zÀ-ÿ\u0600-\u06FF\s'-]+$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    passwordHash: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
    isCompleteProfile: [false],
    gender: ['Female' as Gender, [Validators.required]],
    birthDate: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]]
  });

  get calendarDays(): CalendarDay[] {
    return buildJalaliCalendarDays(
      this.viewJalaliYear,
      this.viewJalaliMonth,
      this.form.controls.birthDate.value,
      this.today
    );
  }

  get viewMonthLabel(): string {
    return `${this.persianMonths[this.viewJalaliMonth - 1]} ${toPersianDigits(this.viewJalaliYear.toString())}`;
  }

  @HostListener('document:click', ['$event'])
  closeBirthDatePickerFromOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isBirthDatePickerOpen = false;
    }
  }

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
          if (!isSuccessfulResponse(response)) {
            this.toastr.error(getResponseMessage(response, 'امکان ایجاد حساب وجود ندارد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.'), 'خطا در ثبت‌نام');
            return;
          }

          this.toastr.success(getResponseMessage(response, 'حساب کاربری شما با موفقیت ایجاد شد. اکنون می‌توانید وارد شوید.'), 'ثبت‌نام موفق');
          void this.router.navigateByUrl('/login');
        },
        error: (error: unknown) => {
          this.toastr.error(this.getRegisterErrorMessage(error), 'خطا در ثبت‌نام');
        }
      });
  }

  toggleBirthDatePicker(): void {
    this.isBirthDatePickerOpen = !this.isBirthDatePickerOpen;

    if (this.isBirthDatePickerOpen && this.form.controls.birthDate.value) {
      const selectedDate = new Date(`${this.form.controls.birthDate.value}T00:00:00`);
      const selectedJalali = toJalali(selectedDate);
      this.viewJalaliYear = selectedJalali.jy;
      this.viewJalaliMonth = selectedJalali.jm;
    }
  }

  closeBirthDatePicker(): void {
    this.isBirthDatePickerOpen = false;
  }

  changeJalaliMonth(offset: number): void {
    const nextMonth = this.viewJalaliMonth + offset;

    if (nextMonth < 1) {
      this.viewJalaliYear -= 1;
      this.viewJalaliMonth = 12;
      return;
    }

    if (nextMonth > 12) {
      this.viewJalaliYear += 1;
      this.viewJalaliMonth = 1;
      return;
    }

    this.viewJalaliMonth = nextMonth;
  }

  selectBirthDate(day: CalendarDay): void {
    if (day.disabled) {
      return;
    }

    this.form.controls.birthDate.setValue(day.iso);
    this.form.controls.birthDate.markAsDirty();
    this.form.controls.birthDate.markAsTouched();
    this.birthDateDisplay = formatJalaliDisplay(day.jalali);
    this.isBirthDatePickerOpen = false;
  }

  toPersianDigits(value: string | number): string {
    return toPersianDigits(value);
  }

  private showValidationErrors(): void {
    const messages: string[] = [];
    const { firstName, lastName, phoneNumber, passwordHash, gender, birthDate } = this.form.controls;

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

    if (passwordHash.hasError('required')) {
      messages.push('رمز عبور را وارد کنید.');
    } else if (passwordHash.hasError('minlength')) {
      messages.push('رمز عبور باید حداقل ۸ کاراکتر باشد.');
    } else if (passwordHash.hasError('maxlength')) {
      messages.push('رمز عبور باید حداکثر ۶۴ کاراکتر باشد.');
    } else if (passwordHash.hasError('pattern')) {
      messages.push('رمز عبور باید حداقل شامل یک حرف و یک عدد باشد.');
    }

    if (gender.hasError('required')) {
      messages.push('جنسیت را انتخاب کنید.');
    }

    if (birthDate.hasError('required')) {
      messages.push('تاریخ تولد را از تقویم شمسی انتخاب کنید.');
    } else if (birthDate.hasError('pattern')) {
      messages.push('تاریخ تولد انتخاب‌شده معتبر نیست.');
    }

    this.toastr.error(messages.join('\n'), 'خطا در اعتبارسنجی');
  }

  private getRegisterErrorMessage(error: unknown): string {
    return getBackendErrorMessage(error, 'امکان ایجاد حساب وجود ندارد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.');
  }
}
