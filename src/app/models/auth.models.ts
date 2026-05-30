export type Gender = 'Female' | 'Male' | 'Other';

export interface LoginCommand {
  phoneNumber: string;
  password: string;
}

export interface CreateUserCommand {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  gender: Gender;
  birthDate: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  role?: string;
  user?: {
    role?: string;
    roles?: string[];
  };
  roles?: string[];
}
