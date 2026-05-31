import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { AuthSession } from '../../base/auth-session';
import { getBackendErrorMessage, getResponseMessage, isSuccessfulResponse } from '../../base/api-response.models';
import { AuthService } from '../../services/auth.service';
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

  readonly form = this.fb.nonNullable.group({
    userId: ['', [
      Validators.required,
      Validators.pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    ]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    passwordHash: ['', [Validators.required, Validators.minLength(8)]]
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
          if (!isSuccessfulResponse(response)) {
            this.toastr.error(getResponseMessage(response, 'امکان ورود وجود ندارد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.'), 'خطا در ورود');
            return;
          }

          AuthSession.persistLogin(response);
          const user = AuthSession.getUser();
          const welcomeName = user?.firstName ? `، ${user.firstName}` : '';
          const message = getResponseMessage(response, `به داشبورد کلینیک خوش آمدید${welcomeName}.`);

          this.toastr.success(message, 'ورود موفق');
          void this.router.navigateByUrl(AuthSession.getPostLoginRedirectUrl());
        },
        error: (error: unknown) => {
          this.toastr.error(this.getLoginErrorMessage(error), 'خطا در ورود');
        }
      });
  }

  private showValidationErrors(): void {
    const messages: string[] = [];
    const { userId, phoneNumber, passwordHash } = this.form.controls;

    if (userId.hasError('required')) {
      messages.push('شناسه کاربر را وارد کنید.');
    } else if (userId.hasError('pattern')) {
      messages.push('شناسه کاربر باید یک GUID معتبر باشد.');
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
    }

    this.toastr.error(messages.join('\n'), 'خطا در اعتبارسنجی');
  }

  private getLoginErrorMessage(error: unknown): string {
    return getBackendErrorMessage(error, 'امکان ورود وجود ندارد. لطفاً اطلاعات را بررسی کنید و دوباره تلاش کنید.');
  }
}
