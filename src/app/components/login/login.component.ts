import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  phoneNumber = '';
  passwordHash = '';
  isPasswordVisible = false;
  isSubmitting = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly toastr: ToastrService
  ) {}

  submit(): void {
    if (!this.phoneNumber.trim() || !this.passwordHash.trim() || this.isSubmitting) {
      this.toastr.error('شماره همراه و رمز عبور را وارد کنید.');
      return;
    }

    this.isSubmitting = true;
    this.authService
      .login({ phoneNumber: this.phoneNumber, passwordHash: this.passwordHash })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.toastr.error(result.message);
          return;
        }

        this.toastr.success(result.message || 'ورود با موفقیت انجام شد');
        const roles = result.data?.roles ?? [];
        const destination = roles.some((role) => role.toLowerCase() === 'admin') ? '/dashboard' : '/consultant/dashboard';
        void this.router.navigateByUrl(destination);
      });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
