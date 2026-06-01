import { PaginatedResult } from '../base/api-response.models';
import { Gender } from './auth.models';

export interface UserListItem {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleName: string;
  isActive: boolean;
}

export interface UserListResult extends PaginatedResult<UserListItem> {
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface GetUsersQuery {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

export interface CreateUserCommand {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  isCompleteProfile: boolean;
  avatarImageName?: string | null;
  gender: Gender;
  birthDate: string;
  roleName: string;
}

export interface UpdateUserCommand {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isCompleteProfile: boolean;
  avatarImageName?: string | null;
  gender: Gender;
  isActive: boolean;
}

export interface DeleteUserCommand {
  userId: string;
}
