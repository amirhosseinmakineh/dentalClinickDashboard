import { AppRole, DecodedUser } from '../models/auth.models';

const dashboardUrls: Record<AppRole, string> = {
  Admin: '/dashboard/admin',
  Secretary: '/dashboard/secretary',
  Consultant: '/dashboard/consultant',
  Patient: '/dashboard/patient',
  User: '/dashboard/user'
};

export function normalizeRole(role?: string): AppRole {
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

export function canCompleteProfile(role: AppRole): boolean {
  return role === 'Patient' || role === 'Consultant';
}

export function needsCompleteProfile(user: DecodedUser | null): boolean {
  return Boolean(user && canCompleteProfile(user.role) && user.isCompleteProfile === false);
}

export function getDashboardUrl(role: AppRole | undefined = 'User'): string {
  return dashboardUrls[role];
}

export function getAllowedRouteForUser(user: DecodedUser | null): string {
  if (!user) {
    return '/login';
  }

  return needsCompleteProfile(user) ? '/complete-profile' : getDashboardUrl(user.role);
}
