export interface AdminUser {
  id?: number | string | null;
  userId?: number | string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  name?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  role?: string | null;
  roleName?: string | null;
  status?: string | null;
  lastSeen?: string | null;
}

export interface AdminRole {
  id?: number | string | null;
  roleId?: number | string | null;
  title?: string | null;
  name?: string | null;
  roleName?: string | null;
  members?: string | number | null;
  membersCount?: string | number | null;
  scope?: string | null;
  access?: string | null;
}

export interface UserCommandPayload {
  id?: number | string;
  userId?: number | string;
  firstName: string;
  lastName: string;
  fullName: string;
  name: string;
  role: string;
  roleName: string;
  phone: string;
  phoneNumber: string;
  status: string;
  lastSeen: string;
}

export interface RoleCommandPayload {
  id?: number | string;
  roleId?: number | string;
  title: string;
  name: string;
  roleName: string;
  members: string;
  membersCount: string;
  scope: string;
  access: string;
}
