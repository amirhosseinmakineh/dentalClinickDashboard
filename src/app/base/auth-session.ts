import { BaseResponse, getResponseData } from './api-response.models';
import { AuthResponse, DecodedUser } from '../models/auth.models';
import { getAllowedRouteForUser, normalizeRole } from './role-routing';

export class AuthSession {
  private static readonly tokenKey = 'authToken';
  private static readonly userKey = 'authUser';

  static persistLogin(response: BaseResponse<AuthResponse> | AuthResponse): void {
    const data = getResponseData(response);
    const token = this.getAuthResponseValue<string>(data, ['token', 'Token']);
    const user = this.getAuthResponseValue<unknown>(data, ['user', 'User']);

    if (token) {
      localStorage.setItem(this.tokenKey, token);
    }

    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  private static getAuthResponseValue<T>(data: AuthResponse | null | undefined, keys: string[]): T | null {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const source = data as Record<string, unknown>;

    for (const key of keys) {
      if (source[key] !== undefined && source[key] !== null) {
        return source[key] as T;
      }
    }

    return null;
  }

  static clear(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  static hasToken(): boolean {
    return Boolean(this.getToken());
  }

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static getUser(): DecodedUser | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    const payload = this.decodePayload(token);

    if (!payload) {
      return null;
    }

    const snapshot = this.getUserSnapshot();
    const tokenRoles = this.extractRoles(payload);
    const snapshotRoles = this.toStringArray(snapshot?.['roles'] ?? snapshot?.['role'] ?? snapshot?.['Role']);
    const roles = tokenRoles.length ? tokenRoles : snapshotRoles;

    return {
      firstName: this.getString(payload, ['FirstName', 'firstName', 'given_name']) ?? this.getString(snapshot, ['FirstName', 'firstName']) ?? '',
      lastName: this.getString(payload, ['LastName', 'lastName', 'family_name']) ?? this.getString(snapshot, ['LastName', 'lastName']) ?? '',
      phoneNumber: this.getString(payload, ['PhoneNumber', 'phoneNumber', 'phone_number', 'nameid']) ?? this.getString(snapshot, ['PhoneNumber', 'phoneNumber']) ?? '',
      roles,
      role: normalizeRole(roles[0]),
      isCompleteProfile: this.resolveProfileStatus(payload, snapshot),
      avatarImageName: this.getString(payload, ['AvatarImageName', 'avatarImageName']) ?? this.getString(snapshot, ['AvatarImageName', 'avatarImageName']) ?? undefined
    };
  }

  static getPostLoginRedirectUrl(): string {
    return getAllowedRouteForUser(this.getUser());
  }

  private static getUserSnapshot(): Record<string, unknown> | null {
    try {
      const rawUser = localStorage.getItem(this.userKey);

      return rawUser ? JSON.parse(rawUser) as Record<string, unknown> : null;
    } catch {
      return null;
    }
  }

  private static decodePayload(token: string): Record<string, unknown> | null {
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

  private static extractRoles(payload: Record<string, unknown>): string[] {
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

  private static getString(source: Record<string, unknown> | null | undefined, keys: string[]): string | null {
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

  private static resolveProfileStatus(payload: Record<string, unknown>, snapshot: Record<string, unknown> | null): boolean {
    return this.toBoolean(this.getString(snapshot, ['isCompleteProfile', 'IsCompleteProfile', 'iscompleteprofile']))
      ?? this.toBoolean(this.getString(payload, ['isCompleteProfile', 'IsCompleteProfile', 'iscompleteprofile']))
      ?? true;
  }

  private static toStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }

    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim());
    }

    return [];
  }

  private static toBoolean(value: string | null): boolean | null {
    if (value === null) {
      return null;
    }

    return value.toLowerCase() === 'true';
  }
}
