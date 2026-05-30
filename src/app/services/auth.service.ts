import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthResponse, LoginCommand, RegisterCommand } from '../models/auth.models';
import { RoleService } from './role.service';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly roleService = inject(RoleService);
  private readonly baseUrl = '/api';

  login(command: LoginCommand): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/LoginCommand`, command);
  }

  register(command: RegisterCommand): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/CreateUserCommand`, command);
  }

  persistLogin(response: AuthResponse): void {
    const token = response.token ?? response.accessToken;

    if (token) {
      this.tokenService.saveToken(token);
    }

    if (response.user) {
      this.tokenService.saveUserSnapshot(response.user);
    }
  }

  logout(): void {
    this.tokenService.clearToken();
  }

  getLandingRedirectUrl(): string {
    return '/';
  }

  getDashboardRedirectUrl(): string {
    return this.roleService.getDashboardUrl();
  }
}
