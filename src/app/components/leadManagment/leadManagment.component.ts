import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GetLeadsQueryParams, LeadAssignmentItem, LeadFilter } from '../../models/lead-assignment.model';
import { LeadAssignmentService } from '../../services/lead-assignment.service';

@Component({
  selector: 'app-lead-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leadManagment.component.html',
  styleUrls: ['./leadManagment.component.scss']
})
export class LeadManagmentComponent implements OnInit {
  leads: LeadAssignmentItem[] = [];
  leadFilter: LeadFilter = 'all';
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;
  isLoading = false;
  readonly pageSizeOptions = [5, 10, 20, 50];

  constructor(private readonly leadAssignmentService: LeadAssignmentService) {}

  ngOnInit(): void {
    this.loadLeads();
  }

  changeLeadFilter(filter: LeadFilter): void {
    this.leadFilter = filter;
    this.pageNumber = 1;
    this.loadLeads();
  }

  changeLeadPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.loadLeads();
  }

  changeLeadPageSize(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(value) || value <= 0) return;
    this.pageSize = value;
    this.pageNumber = 1;
    this.loadLeads();
  }

  getStatusLabel(lead: LeadAssignmentItem): string {
    switch (this.normalizeLeadAssignmentState(lead.leadAssignmentState)) {
      case 'New': return 'جدید';
      case 'Pending': return 'در انتظار تماس';
      case 'Contacted': return 'تایید شده';
      case 'Rejected': return 'رد شده';
      default: return 'نامشخص';
    }
  }

  getStatusClass(lead: LeadAssignmentItem): string {
    switch (this.normalizeLeadAssignmentState(lead.leadAssignmentState)) {
      case 'Contacted': return 'status-valid';
      case 'Rejected': return 'status-expired';
      case 'Pending':
      case 'New': return 'status-pending';
      default: return 'status-invalid';
    }
  }

  getTypeLabel(lead: LeadAssignmentItem): string {
    return this.normalizeLeadAssignmentType(lead.leadAssignmentType) === 'OfflineQueue'
      ? '۹ شب تا ۹ صبح'
      : 'لحظه‌ای';
  }

  getTypeClass(lead: LeadAssignmentItem): string {
    return this.normalizeLeadAssignmentType(lead.leadAssignmentType) === 'OfflineQueue'
      ? 'type-offline'
      : 'type-realtime';
  }

  trackByLead(_: number, lead: LeadAssignmentItem): string {
    return `${lead.phoneNumber}-${lead.userName}`;
  }

  private loadLeads(): void {
    this.isLoading = true;

    this.leadAssignmentService.getLeads(this.buildQuery()).subscribe((result) => {
      this.leads = [...result.items];
      this.totalCount = result.totalCount;
      this.pageNumber = result.pageNumber;
      this.pageSize = result.pageSize;
      this.totalPages = Math.max(1, result.totalPages);
      this.isLoading = false;
    });
  }

  private buildQuery(): GetLeadsQueryParams {
    const query: GetLeadsQueryParams = {
      PageNumber: this.pageNumber,
      PageSize: this.pageSize
    };

    switch (this.leadFilter) {
      case 'new':
      case 'today':
        query.leadAssignmentState = 'New';
        break;
      case 'offlineQueue':
        query.LeadAssignmentType = 'OfflineQueue';
        break;
      case 'pending':
        query.leadAssignmentState = 'Pending';
        break;
      case 'approved':
        query.leadAssignmentState = 'Contacted';
        break;
      case 'expired':
        query.leadAssignmentState = 'Rejected';
        break;
    }

    return query;
  }

  private normalizeLeadAssignmentState(state: LeadAssignmentItem['leadAssignmentState']): string {
    if (typeof state === 'string') return state;

    const states = ['New', 'Pending', 'Contacted', 'Rejected'];
    return states[state] ?? '';
  }

  private normalizeLeadAssignmentType(type: LeadAssignmentItem['leadAssignmentType']): string {
    if (typeof type === 'string') return type;

    const types = ['RealTime', 'OfflineQueue'];
    return types[type] ?? '';
  }
}
