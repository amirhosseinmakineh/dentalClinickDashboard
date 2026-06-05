import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { GetLeadsQueryParams, LeadAssignmentItem, LeadAssignmentState, LeadAssignmentType } from '../models/lead-assignment.model';
import { PaginatedResult } from '../models/paginated-result.model';
import { AuthSessionService } from './auth-session.service';

type PaginatedResultResponse<T> = PaginatedResult<T> & {
  Items?: readonly T[];
  TotalCount?: number;
  PageNumber?: number;
  PageSize?: number;
  TotalPages?: number;
};

type LeadAssignmentItemResponse = LeadAssignmentItem & {
  UserName?: string;
  PhoneNumber?: string;
  LeadAssignmentState?: LeadAssignmentState;
  AssignmentType?: LeadAssignmentType;
  assignmentType?: LeadAssignmentType;
};

@Injectable({ providedIn: 'root' })
export class LeadAssignmentService {
  private readonly apiBaseUrl = 'http://localhost:5182/api';

  constructor(
    private readonly http: HttpClient,
    private readonly authSession: AuthSessionService
  ) {}

  getLeads(query: GetLeadsQueryParams): Observable<PaginatedResult<LeadAssignmentItem>> {
    return this.http.get<PaginatedResultResponse<LeadAssignmentItemResponse>>(`${this.apiBaseUrl}/consultant/getleads`, {
      headers: this.getAuthorizationHeaders(),
      params: this.buildParams(query)
    }).pipe(
      map((response) => this.normalizePaginatedResult(response, query)),
      catchError((_error: HttpErrorResponse) => of(this.emptyResult(query)))
    );
  }

  private buildParams(query: GetLeadsQueryParams): HttpParams {
    let params = new HttpParams()
      .set('PageNumber', query.PageNumber)
      .set('PageSize', query.PageSize);

    if (query.leadAssignmentState) {
      params = params.set('leadAssignmentState', query.leadAssignmentState);
    }

    if (query.LeadAssignmentType) {
      params = params.set('LeadAssignmentType', query.LeadAssignmentType);
    }

    return params;
  }

  private getAuthorizationHeaders(): HttpHeaders {
    const token = this.authSession.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private normalizePaginatedResult(
    response: PaginatedResultResponse<LeadAssignmentItemResponse>,
    query: GetLeadsQueryParams
  ): PaginatedResult<LeadAssignmentItem> {
    const items = (response.items ?? response.Items ?? []).map((item) => this.normalizeLead(item));
    const totalCount = response.totalCount ?? response.TotalCount ?? items.length;
    const pageNumber = response.pageNumber ?? response.PageNumber ?? query.PageNumber;
    const pageSize = response.pageSize ?? response.PageSize ?? query.PageSize;
    const totalPages = response.totalPages ?? response.TotalPages ?? Math.ceil(totalCount / Math.max(1, pageSize));

    return {
      items,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasPrevious: pageNumber > 1,
      hasNext: pageNumber < totalPages
    };
  }

  private normalizeLead(item: LeadAssignmentItemResponse): LeadAssignmentItem {
    return {
      userName: item.userName ?? item.UserName ?? '',
      phoneNumber: item.phoneNumber ?? item.PhoneNumber ?? '',
      leadAssignmentState: item.leadAssignmentState ?? item.LeadAssignmentState ?? 'New',
      leadAssignmentType: item.leadAssignmentType ?? item.AssignmentType ?? item.assignmentType ?? 'RealTime'
    };
  }

  private emptyResult(query: GetLeadsQueryParams): PaginatedResult<LeadAssignmentItem> {
    return {
      items: [],
      totalCount: 0,
      pageNumber: query.PageNumber,
      pageSize: query.PageSize,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false
    };
  }
}
