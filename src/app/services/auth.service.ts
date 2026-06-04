import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { ApiResult } from '../models/api-result.model';
import { CompleteAdminProfileCommand, LoginCommand, LoginResponseData } from '../models/auth.model';
import { RegisterCommand } from '../models/register-command.model';
import { AuthSessionService } from './auth-session.service';

type ApiResultResponse<T> = ApiResult<T> & {
  IsSuccess?: boolean;
  Message?: string;
  Data?: T | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiBaseUrl = 'http://localhost:5001/api';

  constructor(
    private readonly http: HttpClient,
    private readonly authSession: AuthSessionService
  ) {}

  login(command: LoginCommand): Observable<ApiResult<LoginResponseData>> {
    return this.http.post<ApiResultResponse<LoginResponseData>>(`${this.apiBaseUrl}/Auth/Login`, command).pipe(
      map((response) => this.normalizeResult(response)),
      catchError((error: HttpErrorResponse) => of(this.toFailureResult<LoginResponseData>(error)))
    );
  }

  register(command: RegisterCommand): Observable<ApiResult<object>> {
    return this.http.post<ApiResultResponse<object>>(`${this.apiBaseUrl}/Auth/Register`, command).pipe(
      map((response) => this.normalizeResult(response)),
      catchError((error: HttpErrorResponse) => of(this.toFailureResult<object>(error)))
    );
  }

  completeAdminProfile(command: CompleteAdminProfileCommand): Observable<ApiResult<object>> {
    return this.http.post<ApiResultResponse<object>>(`${this.apiBaseUrl}/Auth/CompleteAdminProfile`, command, {
      headers: this.getAuthorizationHeaders()
    }).pipe(
      map((response) => this.normalizeResult(response)),
      catchError((error: HttpErrorResponse) => of(this.toFailureResult<object>(error)))
    );
  }

  private getAuthorizationHeaders(): HttpHeaders {
    const token = this.authSession.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private normalizeResult<T>(response: ApiResultResponse<T>): ApiResult<T> {
    return {
      isSuccess: response.isSuccess ?? response.IsSuccess ?? false,
      message: response.message ?? response.Message ?? '',
      data: response.data ?? response.Data ?? null
    };
  }

  private toFailureResult<T>(error: HttpErrorResponse): ApiResult<T> {
    const body = error.error as Partial<ApiResultResponse<T>> | string | null;

    if (body && typeof body === 'object' && ('message' in body || 'Message' in body)) {
      return this.normalizeResult(body as ApiResultResponse<T>);
    }

    if (typeof body === 'string' && body.trim()) {
      return {
        isSuccess: false,
        message: body,
        data: null
      };
    }

    return {
      isSuccess: false,
      message: error.message,
      data: null
    };
  }
}
