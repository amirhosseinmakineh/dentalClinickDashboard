import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly tokenService = inject(TokenService);

  readonly form = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  isSubmitting = false;

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.showValidationErrors();
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.form.getRawValue())
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          this.authService.persistLogin(response);
          const user = this.tokenService.getUserFromToken();
          const welcomeName = user?.firstName ? `، ${user.firstName}` : '';

          this.toastr.success(`به داشبورد کلینیک خوش آمدید${welcomeName}.`, 'ورود موفق');
          void this.router.navigateByUrl(this.authService.getLandingRedirectUrl());
        },
        error: (error: unknown) => {
          this.toastr.error(this.getLoginErrorMessage(error), 'خطا در ورود');
        }
      });
  }

  private showValidationErrors(): void {
    const messages: string[] = [];
    const { phoneNumber, password } = this.form.controls;

    if (phoneNumber.hasError('required')) {
      messages.push('شماره موبایل را وارد کنید.');
    } else if (phoneNumber.hasError('pattern')) {
      messages.push('شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.');
    }

    if (password.hasError('required')) {
      messages.push('رمز عبور را وارد کنید.');
    } else if (password.hasError('minlength')) {
      messages.push('رمز عبور باید حداقل ۸ کاراکتر باشد.');
    }

    this.toastr.error(messages.join('\n'), 'خطا در اعتبارسنجی');
  }

  private getLoginErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت یا وضعیت سرور را بررسی کنید.';
      }

      if (error.status === 401 || error.status === 403) {
        return 'شماره موبایل یا رمز عبور نادرست است.';
      }

      if (error.status >= 500) {
        return 'در سرور مشکلی رخ داده است. لطفاً کمی بعد دوباره تلاش کنید.';
      }
    }

    return 'امکان ورود وجود ندارد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.';
  }
}
