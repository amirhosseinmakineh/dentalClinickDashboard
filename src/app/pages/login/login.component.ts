import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/button/button.component';

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

  readonly form = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  isSubmitting = false;
  submitError = '';

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError = '';
    this.isSubmitting = true;

    this.authService.login(this.form.getRawValue())
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          const token = response.accessToken ?? response.token;

          if (token) {
            localStorage.setItem('authToken', token);
          }

          void this.router.navigateByUrl(this.authService.getRedirectUrl(response));
        },
        error: () => {
          this.submitError = 'We could not sign you in. Please check your phone number and password.';
        }
      });
  }

  hasError(controlName: 'phoneNumber' | 'password', errorName: string): boolean {
    const control = this.form.controls[controlName];
    return control.hasError(errorName) && (control.dirty || control.touched);
  }
}
