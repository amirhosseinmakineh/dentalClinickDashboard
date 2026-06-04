import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { ApiResult } from '../models/api-result.model';
import { LoginCommand } from '../models/login-command.model';
import { LoginResponse } from '../models/login-response.model';
import { RegisterCommand } from '../models/register-command.model';

type ApiResultResponse<T> = ApiResult<T> & {
  IsSuccess?: boolean;
  Message?: string;
  Data?: T | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiBaseUrl = 'http://localhost:5001/api';

  constructor(private readonly http: HttpClient) {}

  login(command: LoginCommand): Observable<ApiResult<LoginResponse>> {
    return this.http.post<ApiResultResponse<LoginResponse>>(`${this.apiBaseUrl}/Auth/Login`, command).pipe(
      map((response) => this.normalizeResult(response)),
      map((result) => {
        if (result.isSuccess && result.data) {
          this.saveSession(result.data);
        }

        return result;
      }),
      catchError((error: HttpErrorResponse) => of(this.toFailureResult<LoginResponse>(error)))
    );
  }

  register(command: RegisterCommand): Observable<ApiResult<object>> {
    return this.http.post<ApiResultResponse<object>>(`${this.apiBaseUrl}/Auth/Register`, command).pipe(
      map((response) => this.normalizeResult(response)),
      catchError((error: HttpErrorResponse) => of(this.toFailureResult<object>(error)))
    );
  }

  getCurrentRoles(): string[] {
    const savedRoles = localStorage.getItem('userRoles');

    if (savedRoles) {
      try {
        return JSON.parse(savedRoles) as string[];
      } catch {
        return [];
      }
    }

    const token = localStorage.getItem('authToken');

    try {
      return token ? this.extractRolesFromToken(token) : [];
    } catch {
      return [];
    }
  }

  hasAnyRole(expectedRoles: string[]): boolean {
    const normalizedRoles = this.getCurrentRoles().map((role) => role.toLowerCase());
    return expectedRoles.some((role) => normalizedRoles.includes(role.toLowerCase()));
  }

  private saveSession(login: LoginResponse): void {
    const roles = login.roles ?? (login as unknown as { Roles?: string[] }).Roles ?? [];
    const token = login.token ?? (login as unknown as { Token?: string }).Token ?? '';

    localStorage.setItem('authToken', token);
    localStorage.setItem('userRoles', JSON.stringify(roles));
    localStorage.setItem('currentUser', JSON.stringify(login));
  }

  private extractRolesFromToken(token: string): string[] {
    const [, payload] = token.split('.');

    if (!payload) {
      return [];
    }

    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
    const roleClaim =
      decodedPayload['role'] ??
      decodedPayload['roles'] ??
      decodedPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (Array.isArray(roleClaim)) {
      return roleClaim.map(String);
    }

    return typeof roleClaim === 'string' ? [roleClaim] : [];
  }

  private normalizeResult<T>(response: ApiResultResponse<T>): ApiResult<T> {
    return {
      isSuccess: response.isSuccess ?? response.IsSuccess ?? false,
      message: response.message ?? response.Message ?? '',
      data: response.data ?? response.Data ?? null
    };
  }

  private toFailureResult<T>(error: HttpErrorResponse): ApiResult<T> {
    const body = error.error as Partial<ApiResultResponse<object>> | string | null;

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
