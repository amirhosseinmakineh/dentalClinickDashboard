import { Component, ElementRef, HostListener, inject } from '@angular/core';
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

interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

interface CalendarDay {
  day: number;
  jalali: JalaliDate;
  iso: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  disabled: boolean;
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
  readonly today = this.formatGregorianDate(new Date());
  readonly persianMonths = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند'
  ];
  readonly persianWeekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  isSubmitting = false;
  isBirthDatePickerOpen = false;
  birthDateDisplay = '';

  private readonly todayJalali = this.toJalali(new Date());
  viewJalaliYear = this.todayJalali.jy;
  viewJalaliMonth = this.todayJalali.jm;

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-zÀ-ÿ\u0600-\u06FF\s'-]+$/)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-zÀ-ÿ\u0600-\u06FF\s'-]+$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
    gender: ['Female' as Gender, [Validators.required]],
    birthDate: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]]
  });

  get calendarDays(): CalendarDay[] {
    const firstDayOfMonth = this.toGregorianDate(this.viewJalaliYear, this.viewJalaliMonth, 1);
    const startOffset = (firstDayOfMonth.getDay() + 1) % 7;
    const calendarStart = this.addDays(firstDayOfMonth, -startOffset);
    const selectedIso = this.form.controls.birthDate.value;

    return Array.from({ length: 42 }, (_, index) => {
      const gregorianDate = this.addDays(calendarStart, index);
      const jalali = this.toJalali(gregorianDate);
      const iso = this.formatGregorianDate(gregorianDate);

      return {
        day: jalali.jd,
        jalali,
        iso,
        isCurrentMonth: jalali.jm === this.viewJalaliMonth,
        isToday: this.isSameJalaliDate(jalali, this.todayJalali),
        isSelected: iso === selectedIso,
        disabled: iso > this.today
      };
    });
  }

  get viewMonthLabel(): string {
    return `${this.persianMonths[this.viewJalaliMonth - 1]} ${this.toPersianDigits(this.viewJalaliYear.toString())}`;
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

  toggleBirthDatePicker(): void {
    this.isBirthDatePickerOpen = !this.isBirthDatePickerOpen;

    if (this.isBirthDatePickerOpen && this.form.controls.birthDate.value) {
      const selectedDate = new Date(`${this.form.controls.birthDate.value}T00:00:00`);
      const selectedJalali = this.toJalali(selectedDate);
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
    this.birthDateDisplay = this.formatJalaliDisplay(day.jalali);
    this.isBirthDatePickerOpen = false;
  }

  toPersianDigits(value: string | number): string {
    return value.toString().replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
  }

  private formatJalaliDisplay(date: JalaliDate): string {
    return `${this.toPersianDigits(date.jy)}/${this.toPersianDigits(date.jm.toString().padStart(2, '0'))}/${this.toPersianDigits(date.jd.toString().padStart(2, '0'))}`;
  }

  private formatGregorianDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private addDays(date: Date, days: number): Date {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
  }

  private isSameJalaliDate(first: JalaliDate, second: JalaliDate): boolean {
    return first.jy === second.jy && first.jm === second.jm && first.jd === second.jd;
  }

  private toGregorianDate(jy: number, jm: number, jd: number): Date {
    const { gy, gm, gd } = this.toGregorian(jy, jm, jd);

    return new Date(gy, gm - 1, gd);
  }

  private toJalali(date: Date): JalaliDate {
    const gy = date.getFullYear();
    const gm = date.getMonth() + 1;
    const gd = date.getDate();
    const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    let gy2 = gy - 1600;
    let gm2 = gm - 1;
    let gd2 = gd - 1;
    let gDayNo = 365 * gy2 + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400);

    for (let index = 0; index < gm2; index += 1) {
      gDayNo += gDaysInMonth[index];
    }

    if (gm2 > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0)) {
      gDayNo += 1;
    }

    gDayNo += gd2;

    let jDayNo = gDayNo - 79;
    const jNp = Math.floor(jDayNo / 12053);
    jDayNo %= 12053;

    let jy = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461);
    jDayNo %= 1461;

    if (jDayNo >= 366) {
      jy += Math.floor((jDayNo - 1) / 365);
      jDayNo = (jDayNo - 1) % 365;
    }

    let jm = 0;

    for (jm = 0; jm < 11 && jDayNo >= jDaysInMonth[jm]; jm += 1) {
      jDayNo -= jDaysInMonth[jm];
    }

    return { jy, jm: jm + 1, jd: jDayNo + 1 };
  }

  private toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
    const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const jDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    let jy2 = jy - 979;
    let jm2 = jm - 1;
    let jd2 = jd - 1;
    let jDayNo = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4);

    for (let index = 0; index < jm2; index += 1) {
      jDayNo += jDaysInMonth[index];
    }

    jDayNo += jd2;

    let gDayNo = jDayNo + 79;
    let gy = 1600 + 400 * Math.floor(gDayNo / 146097);
    gDayNo %= 146097;

    let leap = true;

    if (gDayNo >= 36525) {
      gDayNo -= 1;
      gy += 100 * Math.floor(gDayNo / 36524);
      gDayNo %= 36524;

      if (gDayNo >= 365) {
        gDayNo += 1;
      } else {
        leap = false;
      }
    }

    gy += 4 * Math.floor(gDayNo / 1461);
    gDayNo %= 1461;

    if (gDayNo >= 366) {
      leap = false;
      gDayNo -= 1;
      gy += Math.floor(gDayNo / 365);
      gDayNo %= 365;
    }

    let gm = 0;

    for (gm = 0; gm < 11 && gDayNo >= gDaysInMonth[gm] + (gm === 1 && leap ? 1 : 0); gm += 1) {
      gDayNo -= gDaysInMonth[gm] + (gm === 1 && leap ? 1 : 0);
    }

    return { gy, gm: gm + 1, gd: gDayNo + 1 };
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
      messages.push('تاریخ تولد را از تقویم شمسی انتخاب کنید.');
    } else if (birthDate.hasError('pattern')) {
      messages.push('تاریخ تولد انتخاب‌شده معتبر نیست.');
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
