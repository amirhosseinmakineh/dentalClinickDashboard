export type LeadAssignmentType = 'RealTime' | 'OfflineQueue' | number;
export type LeadAssignmentState = 'New' | 'Pending' | 'Contacted' | 'Rejected' | number;

export type LeadFilter = 'all' | 'new' | 'offlineQueue' | 'pending' | 'today' | 'approved' | 'expired';

export interface LeadAssignmentItem {
  userName: string;
  phoneNumber: string;
  leadAssignmentState: LeadAssignmentState;
  leadAssignmentType: LeadAssignmentType;
}

export interface GetLeadsQueryParams {
  leadAssignmentState?: 'New' | 'Pending' | 'Contacted' | 'Rejected';
  LeadAssignmentType?: 'OfflineQueue';
  PageNumber: number;
  PageSize: number;
}
