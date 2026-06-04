import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { ApiResult } from '../models/api-result.model';
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

  register(command: RegisterCommand): Observable<ApiResult<object>> {
    return this.http.post<ApiResultResponse<object>>(`${this.apiBaseUrl}/Auth/Register`, command).pipe(
      map((response) => this.normalizeResult(response)),
      catchError((error: HttpErrorResponse) => of(this.toFailureResult(error)))
    );
  }

  private normalizeResult<T>(response: ApiResultResponse<T>): ApiResult<T> {
    return {
      isSuccess: response.isSuccess ?? response.IsSuccess ?? false,
      message: response.message ?? response.Message ?? '',
      data: response.data ?? response.Data ?? null
    };
  }

  private toFailureResult(error: HttpErrorResponse): ApiResult<object> {
    const body = error.error as Partial<ApiResultResponse<object>> | string | null;

    if (body && typeof body === 'object' && ('message' in body || 'Message' in body)) {
      return this.normalizeResult(body as ApiResultResponse<object>);
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
