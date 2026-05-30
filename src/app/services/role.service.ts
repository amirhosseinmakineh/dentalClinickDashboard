import { Injectable, inject } from '@angular/core';

import { AppRole } from '../models/auth.models';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly tokenService = inject(TokenService);

  getCurrentRole(): AppRole {
    return this.tokenService.getUserFromToken()?.role ?? 'User';
  }

  getDashboardUrl(role = this.getCurrentRole()): string {
    const urls: Record<AppRole, string> = {
      Admin: '/dashboard/admin',
      Secretary: '/dashboard/secretary',
      Consultant: '/dashboard/consultant',
      Patient: '/dashboard/patient',
      User: '/dashboard/user'
    };

    return urls[role];
  }

  canCompleteProfile(role = this.getCurrentRole()): boolean {
    return role === 'Patient' || role === 'Consultant';
  }
}
