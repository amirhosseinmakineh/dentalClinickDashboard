export type UserRole = 'admin' | 'consultant' | 'unknown';

export interface LoginCommand {
  phoneNumber: string;
  passwordHash: string;
}

export interface LoginResponseData {
  token?: string;
  accessToken?: string;
  jwtToken?: string;
  jwt?: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  role: UserRole;
  isCompleteProfile: boolean;
}

export interface CompleteConsultantProfileCommand {
  UserId: string;
  NationalityCode: string;
  Address: string;
  IsCompleteProfile: boolean;
}
