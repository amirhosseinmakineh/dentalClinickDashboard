export type Gender = 'Female' | 'Male' | 'Other';
export type AppRole = 'Admin' | 'Secretary' | 'Consultant' | 'Patient' | 'User';

export interface LoginCommand {
  phoneNumber: string;
  password: string;
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
  user: any;
  token: string;
  accessToken?: string;
  role?: string;
  roles?: string[];
}
