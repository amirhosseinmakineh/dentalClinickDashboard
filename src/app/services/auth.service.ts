import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthResponse, CreateUserCommand, LoginCommand } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  login(command: LoginCommand): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/LoginCommand`, command);
  }

  register(command: CreateUserCommand): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/CreateUserCommand`, command);
  }

  getRedirectUrl(response: AuthResponse): string {
    const role = this.resolveRole(response).toLowerCase();

    if (role.includes('admin')) {
      return '/admin';
    }

    if (role.includes('dentist') || role.includes('doctor')) {
      return '/dentist';
    }

    if (role.includes('reception')) {
      return '/reception';
    }

    if (role.includes('patient')) {
      return '/patient';
    }

    return '/';
  }

  private resolveRole(response: AuthResponse): string {
    return response.role ?? response.user?.role ?? response.roles?.[0] ?? response.user?.roles?.[0] ?? '';
  }
}
