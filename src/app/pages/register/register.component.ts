import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Gender } from '../../core/auth/auth.models';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonComponent } from '../../shared/button/button.component';

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

  readonly genders: Gender[] = ['Female', 'Male', 'Other'];
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
  submitError = '';

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError = '';
    this.isSubmitting = true;

    this.authService.register(this.form.getRawValue())
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
          this.submitError = 'We could not create your account. Please review the form and try again.';
        }
      });
  }

  hasError(controlName: 'firstName' | 'lastName' | 'phoneNumber' | 'password' | 'gender' | 'birthDate', errorName: string): boolean {
    const control = this.form.controls[controlName];
    return control.hasError(errorName) && (control.dirty || control.touched);
  }
}
