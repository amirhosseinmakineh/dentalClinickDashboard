import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { ApiResult } from '../models/api-result.model';
import { LeadAssignment } from '../models/consultant-dashboard.model';

type ApiResultResponse<T> = ApiResult<T> & {
  IsSuccess?: boolean;
  Message?: string;
  Data?: T | null;
};

@Injectable({ providedIn: 'root' })
export class LeadAssignmentService {
  private readonly apiBaseUrl = 'http://localhost:5001/api';
  private readonly fallbackLeads: LeadAssignment[] = [
    {
      id: 'lead-rt-1',
      leadName: 'نیلوفر رضایی',
      phoneNumber: '۰۹۱۲ ۳۴۵ ۶۷۸۹',
      type: 'RealTime',
      status: 'Assigned',
      createdAt: new Date(Date.now() - 75_000).toISOString(),
      assignedAt: new Date(Date.now() - 70_000).toISOString(),
      expiresAt: new Date(Date.now() + 110_000).toISOString(),
      source: 'کمپین ایمپلنت',
      note: 'درخواست تماس فوری برای مشاوره ایمپلنت.'
    },
    {
      id: 'lead-rt-2',
      leadName: 'محمد طاهری',
      phoneNumber: '۰۹۳۵ ۲۲۲ ۴۴۴۴',
      type: 'RealTime',
      status: 'Expired',
      createdAt: new Date(Date.now() - 600_000).toISOString(),
      assignedAt: new Date(Date.now() - 590_000).toISOString(),
      expiresAt: new Date(Date.now() - 410_000).toISOString(),
      source: 'فرم رزرو آنلاین',
      note: 'مهلت تماس سه دقیقه‌ای پایان یافته است.'
    },
    {
      id: 'lead-off-1',
      leadName: 'سارا کریمی',
      phoneNumber: '۰۹۰۲ ۳۳۸ ۵۴۱۱',
      type: 'OfflineQueue',
      status: 'Pending',
      createdAt: new Date(Date.now() - 8 * 60 * 60_000).toISOString(),
      assignedAt: new Date(Date.now() - 35 * 60_000).toISOString(),
      source: 'تبلیغات شبانه',
      note: 'قبل از آنلاین شدن باید تعیین تکلیف شود.'
    },
    {
      id: 'lead-off-2',
      leadName: 'رضا قاسمی',
      phoneNumber: '۰۹۱۹ ۸۸۸ ۷۷۶۶',
      type: 'OfflineQueue',
      status: 'Assigned',
      createdAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
      assignedAt: new Date(Date.now() - 20 * 60_000).toISOString(),
      source: 'صف آفلاین',
      note: 'بدون قانون تماس سه دقیقه‌ای.'
    }
  ];

  constructor(private readonly http: HttpClient) {}

  getMyLeads(): Observable<LeadAssignment[]> {
    return this.getLeads(`${this.apiBaseUrl}/lead-assignments/my-leads`, this.fallbackLeads);
  }

  getRealTimeLeads(): Observable<LeadAssignment[]> {
    return this.getLeads(
      `${this.apiBaseUrl}/lead-assignments/realtime`,
      this.fallbackLeads.filter((lead) => lead.type === 'RealTime')
    );
  }

  getOfflineQueueLeads(): Observable<LeadAssignment[]> {
    return this.getLeads(
      `${this.apiBaseUrl}/lead-assignments/offline-queue`,
      this.fallbackLeads.filter((lead) => lead.type === 'OfflineQueue')
    );
  }

  private getLeads(url: string, fallback: LeadAssignment[]): Observable<LeadAssignment[]> {
    return this.http.get<ApiResultResponse<LeadAssignment[]> | LeadAssignment[]>(url).pipe(
      map((response) => (Array.isArray(response) ? response : response.data ?? response.Data ?? [])),
      catchError((_error: HttpErrorResponse) => of(fallback))
    );
  }
}
