import { PaginatedResult } from '../base/api-response.models';

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
  firstName?: string;
  lastName?: string;
  roleName?: string;
  phoneNumber?: string;
  gender?: number;
  isCompleteName?: boolean;
  isActive?: boolean;
  createDate?: string;
  updateDate?: string;
  deleteDate?: string;
}

export interface UserRoleCommandModel {
  roleName: string;
}

export interface CreateUserCommand {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passwordHash: string;
  isCompleteProfile: boolean;
  avatarImageName?: string | null;
  gender: number;
  birthDate: string;
  roles: UserRoleCommandModel[];
}

export interface UpdateUserCommand {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isCompleteProfile: boolean;
  avatarImageName?: string | null;
  gender: number;
  isActive: boolean;
}

export interface DeleteUserCommand {
  userId: string;
}
