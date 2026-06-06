import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { ApiResult } from '../models/api-result.model';
import { ConsultantStatusApiData, ConsultantStatusApiResult, ConsultantStatusSnapshot, SetAvailableCommand, SetOnlineOfflineCommand } from '../models/consultant-status.model';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class ConsultantStatusService {
  private readonly apiBaseUrl = 'http://localhost:5182/api/consultant';
  private readonly statusStorageKeyPrefix = 'dental_dashboard_consultant_status_';

  constructor(
    private readonly http: HttpClient,
    private readonly authSession: AuthSessionService
  ) {}

  getStatus(profileId: number): Observable<ApiResult<ConsultantStatusSnapshot>> {
    return this.http
      .get<ConsultantStatusApiResult>(`${this.apiBaseUrl}/GetConsultantStatus`, {
        headers: this.getAuthorizationHeaders(),
        params: { profileId }
      })
      .pipe(
        map((response) => this.normalizeResult(response, this.getStoredStatus(profileId))),
        tap((result) => {
          if (result.isSuccess && result.data) {
            this.storeStatus(result.data);
          }
        }),
        catchError((error: HttpErrorResponse) => of(this.toStatusFailureResult(error, profileId)))
      );
  }

  setAvailable(command: SetAvailableCommand): Observable<ApiResult<ConsultantStatusSnapshot>> {
    return this.http
      .post<ConsultantStatusApiResult>(`${this.apiBaseUrl}/SetAvalableConsultant`, command, {
        headers: this.getAuthorizationHeaders()
      })
      .pipe(
        map((response) => this.normalizeResult(response, this.mergeWithStoredStatus(command.profileId, { isAvailable: command.isAvailable, isOnline: command.isAvailable ? undefined : false }))),
        tap((result) => {
          if (result.isSuccess && result.data) {
            this.storeStatus(result.data);
          }
        }),
        catchError((error: HttpErrorResponse) => of(this.toFailureResult(error, command.profileId)))
      );
  }

  setOnlineOffline(command: SetOnlineOfflineCommand): Observable<ApiResult<ConsultantStatusSnapshot>> {
    return this.http
      .post<ConsultantStatusApiResult>(`${this.apiBaseUrl}/SetOnlineOfflineConsultant`, command, {
        headers: this.getAuthorizationHeaders()
      })
      .pipe(
        map((response) => this.normalizeResult(response, this.mergeWithStoredStatus(command.profileId, { isOnline: command.isOnline }))),
        tap((result) => {
          if (result.isSuccess && result.data) {
            this.storeStatus(result.data);
          }
        }),
        catchError((error: HttpErrorResponse) => of(this.toFailureResult(error, command.profileId)))
      );
  }

  private getAuthorizationHeaders(): HttpHeaders {
    const token = this.authSession.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private normalizeResult(response: ConsultantStatusApiResult, fallback: ConsultantStatusSnapshot): ApiResult<ConsultantStatusSnapshot> {
    const data = response.data ?? response.Data ?? null;

    return {
      isSuccess: response.isSuccess ?? response.IsSuccess ?? false,
      message: response.message ?? response.Message ?? '',
      data: this.normalizeStatus(data, fallback)
    };
  }

  private toStatusFailureResult(error: HttpErrorResponse, profileId: number): ApiResult<ConsultantStatusSnapshot> {
    const storedStatus = this.getStoredStatus(profileId);
    const body = error.error as ConsultantStatusApiResult | string | null;

    if (storedStatus) {
      return {
        isSuccess: true,
        message: 'آخرین وضعیت ثبت‌شده نمایش داده شد.',
        data: storedStatus
      };
    }

    if (body && typeof body === 'object') {
      return this.normalizeResult(body, this.getDefaultStatus(profileId));
    }

    return {
      isSuccess: false,
      message: typeof body === 'string' && body.trim() ? body : error.message,
      data: this.getDefaultStatus(profileId)
    };
  }

  private toFailureResult(error: HttpErrorResponse, profileId: number): ApiResult<ConsultantStatusSnapshot> {
    const body = error.error as ConsultantStatusApiResult | string | null;

    if (body && typeof body === 'object') {
      return this.normalizeResult(body, this.getStoredStatus(profileId));
    }

    return {
      isSuccess: false,
      message: typeof body === 'string' && body.trim() ? body : error.message,
      data: this.getStoredStatus(profileId)
    };
  }

  private mergeWithStoredStatus(profileId: number, patch: Partial<ConsultantStatusSnapshot>): ConsultantStatusSnapshot {
    const current = this.getStoredStatus(profileId);

    return {
      ...current,
      ...patch,
      profileId,
      isAvailable: patch.isAvailable ?? current.isAvailable,
      isOnline: patch.isOnline ?? current.isOnline
    };
  }

  private normalizeStatus(data: ConsultantStatusApiData | null, fallback: ConsultantStatusSnapshot): ConsultantStatusSnapshot {
    return {
      profileId: Number(data?.profileId ?? data?.ProfileId ?? fallback.profileId),
      isAvailable: this.toBoolean(data?.isAvailable ?? data?.IsAvailable, fallback.isAvailable),
      isOnline: this.toBoolean(data?.isOnline ?? data?.IsOnline, fallback.isOnline)
    };
  }

  private toBoolean(value: unknown, fallback: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalizedValue = value.trim().toLowerCase();

      if (['true', '1', 'yes'].includes(normalizedValue)) {
        return true;
      }

      if (['false', '0', 'no'].includes(normalizedValue)) {
        return false;
      }
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    return fallback;
  }

  private getStoredStatus(profileId: number): ConsultantStatusSnapshot {
    const rawValue = localStorage.getItem(`${this.statusStorageKeyPrefix}${profileId}`);

    if (!rawValue) {
      return this.getDefaultStatus(profileId);
    }

    try {
      return this.normalizeStatus(JSON.parse(rawValue) as ConsultantStatusApiData, this.getDefaultStatus(profileId));
    } catch {
      return this.getDefaultStatus(profileId);
    }
  }

  private storeStatus(status: ConsultantStatusSnapshot): void {
    localStorage.setItem(`${this.statusStorageKeyPrefix}${status.profileId}`, JSON.stringify(status));
  }

  private getDefaultStatus(profileId: number): ConsultantStatusSnapshot {
    return {
      profileId,
      isAvailable: false,
      isOnline: false
    };
  }
}
