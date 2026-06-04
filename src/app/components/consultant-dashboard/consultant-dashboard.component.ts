import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { ConsultantStatusState } from '../../models/consultant-status.model';
import { AuthSessionService } from '../../services/auth-session.service';
import { ConsultantStatusService } from '../../services/consultant-status.service';

@Component({
  selector: 'app-consultant-dashboard',
  imports: [CommonModule],
  templateUrl: './consultant-dashboard.component.html',
  styleUrl: './consultant-dashboard.component.scss'
})
export class ConsultantDashboardComponent {
  private readonly authSession = inject(AuthSessionService);
  private readonly consultantStatusService = inject(ConsultantStatusService);
  private readonly toastr = inject(ToastrService);

  statusState: ConsultantStatusState = {
    profileId: this.authSession.getSession()?.profileId ?? 1,
    isAvailable: false,
    isOnline: false,
    isSubmittingAvailable: false,
    isSubmittingOnline: false
  };

  setAvailable(isAvailable: boolean): void {
    if (this.statusState.isSubmittingAvailable) {
      return;
    }

    this.statusState = {
      ...this.statusState,
      isSubmittingAvailable: true
    };

    this.consultantStatusService
      .setAvailable({
        profileId: this.statusState.profileId,
        isAvailable
      })
      .pipe(finalize(() => (this.statusState = { ...this.statusState, isSubmittingAvailable: false })))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.toastr.error(result.message || 'ثبت وضعیت حضور ناموفق بود.');
          return;
        }

        this.statusState = {
          ...this.statusState,
          isAvailable,
          isOnline: isAvailable ? this.statusState.isOnline : false
        };
        this.toastr.success(result.message || 'وضعیت حضور ثبت شد.');
      });
  }

  setOnlineOffline(isOnline: boolean): void {
    if (this.statusState.isSubmittingOnline || (isOnline && !this.statusState.isAvailable)) {
      return;
    }

    this.statusState = {
      ...this.statusState,
      isSubmittingOnline: true
    };

    this.consultantStatusService
      .setOnlineOffline({
        profileId: this.statusState.profileId,
        isOnline
      })
      .pipe(finalize(() => (this.statusState = { ...this.statusState, isSubmittingOnline: false })))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.statusState = {
            ...this.statusState,
            isOnline: isOnline ? false : this.statusState.isOnline
          };
          this.toastr.error(result.message || 'ثبت وضعیت آنلاین/آفلاین ناموفق بود.');
          return;
        }

        this.statusState = {
          ...this.statusState,
          isOnline
        };
        this.toastr.success(result.message || 'وضعیت دریافت لید ثبت شد.');
      });
  }
}
