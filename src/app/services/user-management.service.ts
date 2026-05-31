import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseResponse } from '../base/api-response.models';
import { CreateUserCommand, DeleteUserCommand, GetUsersQuery, UpdateUserCommand, UserListResult } from '../models/user-management.models';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5182/api/User';

  getUsers(query: GetUsersQuery): Observable<BaseResponse<UserListResult>> {
    let params = new HttpParams()
      .set('PageNumber', query.pageNumber || 1)
      .set('PageSize', query.pageSize || 10);

    const normalizedQuery = this.normalizeUserQuery(query);

    Object.entries(normalizedQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<BaseResponse<UserListResult>>(this.baseUrl, { params });
  }

  createUser(command: CreateUserCommand): Observable<BaseResponse<unknown>> {
    return this.http.post<BaseResponse<unknown>>(this.baseUrl, command);
  }

  updateUser(command: UpdateUserCommand): Observable<BaseResponse<unknown>> {
    return this.http.patch<BaseResponse<unknown>>(this.baseUrl, command);
  }

  deleteUser(command: DeleteUserCommand): Observable<BaseResponse<unknown>> {
    return this.http.delete<BaseResponse<unknown>>(this.baseUrl, { body: command });
  }

  private normalizeUserQuery(query: GetUsersQuery): Record<string, string | number | boolean | undefined> {
    const search = query.search?.trim();
    const isPhoneSearch = Boolean(search && /^\d+$/.test(search));

    return {
      FirstName: query.firstName ?? (isPhoneSearch ? undefined : search),
      LastName: query.lastName,
      RoleName: query.roleName,
      PhoneNumber: query.phoneNumber ?? (isPhoneSearch ? search : undefined),
      Gender: query.gender,
      IsCompleteName: query.isCompleteName,
      IsActive: query.isActive,
      CreateDate: query.createDate,
      UpdateDate: query.updateDate,
      DeleteDate: query.deleteDate
    };
  }
}
