import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type LeadAssignmentType = 'RealTime' | 'OfflineQueue';
type LeadAssignmentState = 'Pending' | 'Assigned' | 'Called' | 'NotCalled' | 'Expired';
type LeadFilter = 'all' | 'new' | 'offlineQueue' | 'pending' | 'today' | 'approved' | 'expired';

export interface LeadAssignmentDto {
  id: number;
  fullName: string;
  phoneNumber: string;
  createdAt: string;
  assignedAt?: string | null;
  callDeadlineAt?: string | null;
  assignmentType: LeadAssignmentType;
  leadAssignmentState: LeadAssignmentState;
  requiresThreeMinuteCall: boolean;
}

@Component({
  selector: 'app-lead-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leadManagment.component.html',
  styleUrls: ['./leadManagment.component.scss']
})
export class LeadManagmentComponent implements OnInit {

  @Input() leads: LeadAssignmentDto[] = [];

  leadFilter: LeadFilter = 'all';
  pageNumber = 1;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 20, 50];

  constructor() {}

  ngOnInit(): void {}

  // --- Computed properties ---
  get filteredLeads(): LeadAssignmentDto[] {
    const today = new Date();
    return this.leads.filter(lead => {
      const createdAt = new Date(lead.createdAt);
      switch (this.leadFilter) {
        case 'new':
          return lead.leadAssignmentState === 'Pending';
        case 'offlineQueue':
          return lead.assignmentType === 'OfflineQueue';
        case 'pending':
          return lead.leadAssignmentState === 'Assigned';
        case 'today':
          return this.isSameDate(createdAt, today);
        case 'approved':
          return lead.leadAssignmentState === 'Called';
        case 'expired':
          return lead.leadAssignmentState === 'Expired';
        default:
          return true;
      }
    });
  }

  get pagedLeads(): LeadAssignmentDto[] {
    const start = (this.pageNumber - 1) * this.pageSize;
    return this.filteredLeads.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLeads.length / this.pageSize) || 1;
  }

  // --- Actions ---
  changeLeadFilter(filter: LeadFilter): void {
    this.leadFilter = filter;
    this.pageNumber = 1;
  }

  changeLeadPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
  }

  changeLeadPageSize(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(value) || value <= 0) return;
    this.pageSize = value;
    this.pageNumber = 1;
  }

  getStatusLabel(lead: LeadAssignmentDto): string {
    switch (lead.leadAssignmentState) {
      case 'Pending': return 'جدید';
      case 'Assigned': return 'در انتظار تماس';
      case 'Called': return 'تایید شده';
      case 'NotCalled': return 'تماس ناموفق';
      case 'Expired': return 'Expire شده';
      default: return 'نامشخص';
    }
  }

  getStatusClass(lead: LeadAssignmentDto): string {
    switch (lead.leadAssignmentState) {
      case 'Called': return 'status-valid';
      case 'Expired':
      case 'NotCalled': return 'status-expired';
      case 'Assigned':
      case 'Pending': return 'status-pending';
      default: return 'status-invalid';
    }
  }

  trackByLeadId(_: number, lead: LeadAssignmentDto): number {
    return lead.id;
  }

  private isSameDate(firstDate: Date, secondDate: Date): boolean {
    return firstDate.getFullYear() === secondDate.getFullYear()
      && firstDate.getMonth() === secondDate.getMonth()
      && firstDate.getDate() === secondDate.getDate();
  }
}