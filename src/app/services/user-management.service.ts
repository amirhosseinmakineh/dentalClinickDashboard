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
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    if (query.search?.trim()) {
      const search = query.search.trim();
      params = params
        .set('search', search)
        .set('Search', search)
        .set('searchTerm', search)
        .set('SearchTerm', search);
    }

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
}
