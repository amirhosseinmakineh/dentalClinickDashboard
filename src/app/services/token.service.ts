import { Injectable } from '@angular/core';

import { AppRole, DecodedUser } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly tokenKey = 'authToken';
  private readonly userKey = 'authUser';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  saveUserSnapshot(user: unknown): void {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  hasToken(): boolean {
    return Boolean(this.getToken());
  }

  getUserFromToken(token = this.getToken()): DecodedUser | null {
    if (!token) {
      return null;
    }

    const payload = this.decodePayload(token);

    if (!payload) {
      return null;
    }

    const snapshot = this.getUserSnapshot();
    const roles = this.extractRoles(payload);
    const snapshotRoles = this.toStringArray(snapshot?.['roles'] ?? snapshot?.['role']);
    const resolvedRoles = roles.length ? roles : snapshotRoles;

    return {
      firstName: this.getClaimValue(payload, ['FirstName', 'firstName', 'given_name']) ?? this.getString(snapshot, ['firstName', 'FirstName']) ?? '',
      lastName: this.getClaimValue(payload, ['LastName', 'lastName', 'family_name']) ?? this.getString(snapshot, ['lastName', 'LastName']) ?? '',
      phoneNumber: this.getClaimValue(payload, ['PhoneNumber', 'phoneNumber', 'phone_number', 'nameid']) ?? this.getString(snapshot, ['phoneNumber', 'PhoneNumber']) ?? '',
      roles: resolvedRoles,
      role: this.normalizeRole(resolvedRoles[0]),
      isCompleteProfile: this.resolveProfileStatus(payload, snapshot),
      avatarImageName: this.getClaimValue(payload, ['avatarImageName', 'AvatarImageName']) ?? this.getString(snapshot, ['avatarImageName', 'AvatarImageName']) ?? undefined
    };
  }

  private getUserSnapshot(): Record<string, unknown> | null {
    try {
      const rawUser = localStorage.getItem(this.userKey);

      return rawUser ? JSON.parse(rawUser) as Record<string, unknown> : null;
    } catch {
      return null;
    }
  }

  private decodePayload(token: string): Record<string, unknown> | null {
    try {
      const [, rawPayload] = token.split('.');

      if (!rawPayload) {
        return null;
      }

      const base64 = rawPayload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      const json = decodeURIComponent(
        atob(padded)
          .split('')
          .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join('')
      );

      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private extractRoles(payload: Record<string, unknown>): string[] {
    const roleClaimKeys = [
      'Role',
      'role',
      'roles',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ];

    return roleClaimKeys
      .flatMap((key) => this.toStringArray(payload[key]))
      .filter(Boolean);
  }

  private getClaimValue(payload: Record<string, unknown>, keys: string[]): string | null {
    return this.getString(payload, keys);
  }

  private getString(source: Record<string, unknown> | null | undefined, keys: string[]): string | null {
    if (!source) {
      return null;
    }

    for (const key of keys) {
      const value = source[key];

      if (typeof value === 'string') {
        return value;
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }
    }

    return null;
  }

  private resolveProfileStatus(payload: Record<string, unknown>, snapshot: Record<string, unknown> | null): boolean {
    return this.toBoolean(this.getClaimValue(payload, ['isCompleteProfile', 'IsCompleteProfile', 'completeProfile']))
      ?? this.toBoolean(this.getString(snapshot, ['isCompleteProfile', 'IsCompleteProfile', 'completeProfile']))
      ?? true;
  }

  private toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }

    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }

    return [];
  }

  private normalizeRole(role?: string): AppRole {
    const normalized = (role ?? '').toLowerCase();

    if (normalized.includes('admin')) {
      return 'Admin';
    }

    if (normalized.includes('secretary') || normalized.includes('reception')) {
      return 'Secretary';
    }

    if (normalized.includes('consultant')) {
      return 'Consultant';
    }

    if (normalized.includes('patient')) {
      return 'Patient';
    }

    return 'User';
  }

  private toBoolean(value: string | null): boolean | null {
    if (value === null) {
      return null;
    }

    return value.toLowerCase() === 'true';
  }
}
