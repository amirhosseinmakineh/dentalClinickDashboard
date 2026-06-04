import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { ApiResult } from '../models/api-result.model';
import { ConsultantStatusApiResult, SetAvailableCommand, SetOnlineOfflineCommand } from '../models/consultant-status.model';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class ConsultantStatusService {
  private readonly apiBaseUrl = 'http://localhost:5181/api/consultant';

  constructor(
    private readonly http: HttpClient,
    private readonly authSession: AuthSessionService
  ) {}

  setAvailable(command: SetAvailableCommand): Observable<ApiResult> {
    return this.http
      .post<ConsultantStatusApiResult>(`${this.apiBaseUrl}/SetAvalableConsultant`, command, {
        headers: this.getAuthorizationHeaders()
      })
      .pipe(
        map((response) => this.normalizeResult(response)),
        catchError((error: HttpErrorResponse) => of(this.toFailureResult(error)))
      );
  }

  setOnlineOffline(command: SetOnlineOfflineCommand): Observable<ApiResult> {
    return this.http
      .post<ConsultantStatusApiResult>(`${this.apiBaseUrl}/SetOnlineOfflineConsultant`, command, {
        headers: this.getAuthorizationHeaders()
      })
      .pipe(
        map((response) => this.normalizeResult(response)),
        catchError((error: HttpErrorResponse) => of(this.toFailureResult(error)))
      );
  }

  private getAuthorizationHeaders(): HttpHeaders {
    const token = this.authSession.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private normalizeResult(response: ConsultantStatusApiResult): ApiResult {
    return {
      isSuccess: response.isSuccess ?? response.IsSuccess ?? false,
      message: response.message ?? response.Message ?? ''
    };
  }

  private toFailureResult(error: HttpErrorResponse): ApiResult {
    const body = error.error as ConsultantStatusApiResult | string | null;

    if (body && typeof body === 'object') {
      return this.normalizeResult(body);
    }

    return {
      isSuccess: false,
      message: typeof body === 'string' && body.trim() ? body : error.message
    };
  }
}
