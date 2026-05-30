import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseResponse } from '../base/api-response.models';
import { AuthResponse, LoginCommand, RegisterCommand } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  login(command: LoginCommand): Observable<BaseResponse<AuthResponse>> {
    return this.http.post<BaseResponse<AuthResponse>>(`${this.baseUrl}/LoginCommand`, command);
  }

  register(command: RegisterCommand): Observable<BaseResponse<unknown>> {
    return this.http.post<BaseResponse<unknown>>(`${this.baseUrl}/CreateUserCommand`, command);
  }
}
