export const Gender = {
  Female: 0,
  Male: 1,
  Other: 2
} as const;

export type Gender = typeof Gender[keyof typeof Gender];
export type AppRole = 'Admin' | 'Secretary' | 'Consultant' | 'Patient' | 'User';

export interface LoginCommand {
  phoneNumber: string;
  passwordHash: string;
}

export interface RegisterCommand {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  isCompleteProfile: boolean;
  avatarImageName?: string;
  gender: Gender;
  birthDate: Date | string;
}

export type CreateUserCommand = RegisterCommand;

export interface DecodedUser {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  role: AppRole;
  isCompleteProfile: boolean;
  avatarImageName?: string;
}

export interface AuthResponse {
  user?: unknown;
  User?: unknown;
  token?: string;
  Token?: string;
}
