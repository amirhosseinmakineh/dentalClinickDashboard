import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { ConsultantStatusSnapshot, ConsultantStatusState } from '../../models/consultant-status.model';
import { AuthSessionService } from '../../services/auth-session.service';
import { ConsultantStatusService } from '../../services/consultant-status.service';

@Component({
  selector: 'app-consultant-dashboard',
  imports: [CommonModule],
  templateUrl: './consultant-dashboard.component.html',
  styleUrl: './consultant-dashboard.component.scss'
})
export class ConsultantDashboardComponent implements OnInit {
  private readonly authSession = inject(AuthSessionService);
  private readonly consultantStatusService = inject(ConsultantStatusService);
  private readonly toastr = inject(ToastrService);

  statusState: ConsultantStatusState = {
    profileId: this.authSession.getSession()?.profileId ?? 0,
    isAvailable: false,
    isOnline: false,
    isLoading: true,
    isSubmittingAvailable: false,
    isSubmittingOnline: false
  };

  ngOnInit(): void {
    this.loadStatus();
  }

  setAvailable(isAvailable: boolean): void {
    const profileId = this.getProfileId();

    if (!profileId || this.statusState.isSubmittingAvailable || (!isAvailable && this.statusState.isOnline)) {
      this.showMissingProfileIdError(profileId);
      return;
    }

    this.statusState = {
      ...this.statusState,
      profileId,
      isSubmittingAvailable: true
    };

    this.consultantStatusService
      .setAvailable({
        profileId,
        isAvailable
      })
      .pipe(finalize(() => (this.statusState = { ...this.statusState, isSubmittingAvailable: false })))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.toastr.error(result.message || 'ثبت وضعیت حضور ناموفق بود.');
          return;
        }

        this.applyStatus(result.data ?? {
          profileId: this.statusState.profileId,
          isAvailable,
          isOnline: isAvailable ? this.statusState.isOnline : false
        });
        this.toastr.success(result.message || 'وضعیت حضور ثبت شد.');
      });
  }

  setOnlineOffline(isOnline: boolean): void {
    const profileId = this.getProfileId();

    if (!profileId || this.statusState.isSubmittingOnline || (isOnline && !this.statusState.isAvailable)) {
      this.showMissingProfileIdError(profileId);
      return;
    }

    this.statusState = {
      ...this.statusState,
      profileId,
      isSubmittingOnline: true
    };

    this.consultantStatusService
      .setOnlineOffline({
        profileId,
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

        this.applyStatus(result.data ?? {
          profileId: this.statusState.profileId,
          isAvailable: this.statusState.isAvailable,
          isOnline
        });
        this.toastr.success(result.message || 'وضعیت دریافت لید ثبت شد.');
      });
  }

  private loadStatus(): void {
    const profileId = this.getProfileId();

    this.statusState = {
      ...this.statusState,
      profileId,
      isLoading: true
    };

    if (!profileId) {
      this.statusState = { ...this.statusState, isLoading: false };
      this.toastr.error('شناسه پروفایل مشاور پیدا نشد. لطفاً دوباره وارد شوید.');
      return;
    }

    this.consultantStatusService
      .getStatus(profileId)
      .pipe(finalize(() => (this.statusState = { ...this.statusState, isLoading: false })))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.toastr.error(result.message || 'دریافت وضعیت مشاور ناموفق بود.');
          return;
        }

        if (result.data) {
          this.applyStatus(result.data);
        }
      });
  }

  private getProfileId(): number {
    const profileId = this.authSession.getSession()?.profileId ?? this.statusState.profileId;
    return Number.isFinite(profileId) && profileId > 0 ? profileId : 0;
  }

  private showMissingProfileIdError(profileId: number): void {
    if (!profileId) {
      this.toastr.error('شناسه پروفایل مشاور پیدا نشد. لطفاً دوباره وارد شوید.');
    }
  }

  private applyStatus(status: ConsultantStatusSnapshot): void {
    this.statusState = {
      ...this.statusState,
      profileId: status.profileId,
      isAvailable: status.isAvailable,
      isOnline: status.isAvailable && status.isOnline
    };
  }
}
