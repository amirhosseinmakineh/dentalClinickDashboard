import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, combineLatest, interval, takeUntil } from 'rxjs';

import { ConsultantProfile, LeadAssignment, LeadStatus, LeadType, ConsultantNotification } from '../../models/consultant-dashboard.model';
import { AuthService } from '../../services/auth.service';
import { ConsultantProfileService } from '../../services/consultant-profile.service';
import { LeadAssignmentService } from '../../services/lead-assignment.service';
import { NotificationService } from '../../services/notification.service';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { SidebarComponent, SidebarItem } from '../sidebar/sidebar.component';

interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

interface UserRow {
  name: string;
  role: string;
  phone: string;
  status: string;
  lastSeen: string;
}

interface RoleRow {
  title: string;
  members: string;
  scope: string;
  access: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, FormsModule, SidebarComponent, DashboardHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  activeKey = 'consultant-dashboard';
  leadTypeFilter: LeadType | 'All' = 'All';
  leadStatusFilter: LeadStatus | 'All' = 'All';
  statusMessage = '';
  profile: ConsultantProfile | null = null;
  myLeads: LeadAssignment[] = [];
  realTimeLeads: LeadAssignment[] = [];
  offlineQueueLeads: LeadAssignment[] = [];
  notifications: ConsultantNotification[] = [];
  now = Date.now();

  private readonly destroy$ = new Subject<void>();

  private readonly adminSidebarItems: SidebarItem[] = [
    { key: 'users', label: 'مدیریت کاربران', icon: 'group', roles: ['Admin'] },
    { key: 'roles', label: 'مدیریت نقش ها', icon: 'admin_panel_settings', roles: ['Admin'] },
    { key: 'consultants', label: 'مدیریت مشاوران', icon: 'support_agent', roles: ['Admin'] }
  ];

  private readonly consultantSidebarItems: SidebarItem[] = [
    { key: 'consultant-dashboard', label: 'داشبورد', icon: 'space_dashboard', route: '/consultant/dashboard', roles: ['Consultant', 'مشاور'] },
    { key: 'my-leads', label: 'لیدهای من', icon: 'assignment_ind', route: '/consultant/my-leads', roles: ['Consultant', 'مشاور'] },
    { key: 'realtime-leads', label: 'لیدهای لحظه‌ای', icon: 'bolt', route: '/consultant/realtime-leads', roles: ['Consultant', 'مشاور'] },
    { key: 'offline-queue', label: 'صف لیدهای آفلاین', icon: 'pending_actions', route: '/consultant/offline-queue', roles: ['Consultant', 'مشاور'] },
    { key: 'notifications', label: 'اعلان‌ها', icon: 'notifications', route: '/consultant/notifications', roles: ['Consultant', 'مشاور'] },
    { key: 'profile', label: 'پروفایل من', icon: 'account_circle', route: '/consultant/profile', roles: ['Consultant', 'مشاور'] }
  ];

  readonly users: UserRow[] = [
    { name: 'دکتر نرگس محمدی', role: 'مدیر کلینیک', phone: '۰۹۱۲ ۴۴۴ ۱۲۰۰', status: 'فعال', lastSeen: '۱۰ دقیقه پیش' },
    { name: 'مریم احمدی', role: 'پذیرش', phone: '۰۹۳۵ ۸۸۱ ۳۴۰۰', status: 'فعال', lastSeen: 'امروز، ۱۲:۳۰' },
    { name: 'علی رضایی', role: 'حسابداری', phone: '۰۹۱۹ ۲۲۱ ۷۶۵۴', status: 'در انتظار تایید', lastSeen: 'دیروز' },
    { name: 'سارا کریمی', role: 'دستیار پزشک', phone: '۰۹۰۲ ۳۳۸ ۵۴۱۱', status: 'غیرفعال', lastSeen: '۳ روز پیش' }
  ];

  readonly roles: RoleRow[] = [
    { title: 'Admin', members: '۲ کاربر', scope: 'مدیریت کاربران، نقش‌ها و مشاوران', access: 'کامل' },
    { title: 'Consultant', members: '۹ مشاور', scope: 'داشبورد مشاور و لیدهای اختصاص‌یافته', access: 'عملیاتی' },
    { title: 'پذیرش', members: '۵ کاربر', scope: 'نوبت‌دهی و بیماران', access: 'محدود' },
    { title: 'مالی', members: '۳ کاربر', scope: 'پرداخت و فاکتور', access: 'محدود' }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly consultantProfileService: ConsultantProfileService,
    private readonly leadAssignmentService: LeadAssignmentService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.syncActiveKeyWithRoute();

    combineLatest([
      this.consultantProfileService.profile$,
      this.leadAssignmentService.getMyLeads(),
      this.leadAssignmentService.getRealTimeLeads(),
      this.leadAssignmentService.getOfflineQueueLeads(),
      this.notificationService.getNotifications()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([profile, myLeads, realTimeLeads, offlineQueueLeads, notifications]) => {
        this.profile = profile;
        this.myLeads = myLeads;
        this.realTimeLeads = realTimeLeads;
        this.offlineQueueLeads = offlineQueueLeads;
        this.notifications = notifications;
      });

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.now = Date.now();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get sidebarItems(): SidebarItem[] {
    const roles = this.authService.getCurrentRoles();
    const allItems = [...this.adminSidebarItems, ...this.consultantSidebarItems];

    if (roles.length === 0) {
      return allItems;
    }

    return allItems.filter((item) => !item.roles?.length || item.roles.some((role) => this.authService.hasAnyRole([role])));
  }

  get stats(): DashboardStat[] {
    return [
      { label: 'لیدهای امروز', value: this.formatNumber(this.myLeads.length), trend: 'همه لیدهای اختصاص‌یافته امروز', icon: 'today' },
      { label: 'RealTime', value: this.formatNumber(this.realTimeLeads.length), trend: 'دارای قانون تماس ۳ دقیقه‌ای', icon: 'timer' },
      { label: 'OfflineQueue', value: this.formatNumber(this.offlineQueueLeads.length), trend: 'بدون تایمر و نیازمند تعیین تکلیف', icon: 'schedule' },
      { label: 'Assign شده به مشاور', value: this.formatNumber(this.myLeads.length), trend: 'لیدهای قابل مشاهده برای همین مشاور', icon: 'assignment_turned_in' }
    ];
  }

  get activeTitle(): string {
    return this.sidebarItems.find((item) => item.key === this.activeKey)?.label ?? 'داشبورد مشاور';
  }

  get activeSubtitle(): string {
    const subtitles: Record<string, string> = {
      users: 'فقط نقش Admin امکان مشاهده مدیریت کاربران را دارد.',
      roles: 'فقط نقش Admin امکان مشاهده مدیریت نقش‌ها را دارد.',
      consultants: 'فقط نقش Admin امکان مدیریت مشاوران را دارد.',
      'consultant-dashboard': 'وضعیت حضور، آنلاین بودن و شاخص‌های لید مشاور',
      'my-leads': 'همه لیدهای اختصاص‌یافته با فیلتر نوع و وضعیت',
      'realtime-leads': 'لیدهای لحظه‌ای با تایمر واضح سه دقیقه‌ای',
      'offline-queue': 'صف لیدهای آفلاین که قبل از آنلاین شدن باید بررسی شود',
      notifications: 'اعلان‌های خوانده‌شده و خوانده‌نشده مشاور',
      profile: 'اطلاعات پروفایل و وضعیت فعال بودن مشاور'
    };

    return subtitles[this.activeKey] ?? 'پنل RTL مدیریت لید کلینیک دل‌خند';
  }

  get filteredMyLeads(): LeadAssignment[] {
    return this.myLeads.filter((lead) => {
      const matchesType = this.leadTypeFilter === 'All' || lead.type === this.leadTypeFilter;
      const matchesStatus = this.leadStatusFilter === 'All' || lead.status === this.leadStatusFilter;
      return matchesType && matchesStatus;
    });
  }

  get pendingOfflineCount(): number {
    return this.offlineQueueLeads.filter((lead) => lead.status === 'Pending').length;
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }

  setPresentStatus(isPresent: boolean): void {
    this.consultantProfileService.setPresentStatus(isPresent).subscribe((result) => {
      this.statusMessage = result.message;
    });
  }

  setOnlineStatus(isOnline: boolean): void {
    if (isOnline && this.pendingOfflineCount > 0) {
      this.statusMessage = 'ابتدا لیدهای آفلاین خود را تعیین تکلیف کنید.';
      return;
    }

    this.consultantProfileService.setOnlineStatus(isOnline).subscribe((result) => {
      this.statusMessage = result.message;
    });
  }

  selectItem(item: SidebarItem): void {
    this.activeKey = item.key;

    if (item.route) {
      void this.router.navigateByUrl(item.route);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  remainingMilliseconds(lead: LeadAssignment): number {
    if (!lead.expiresAt) {
      return 0;
    }

    return Math.max(new Date(lead.expiresAt).getTime() - this.now, 0);
  }

  remainingLabel(lead: LeadAssignment): string {
    const totalSeconds = Math.ceil(this.remainingMilliseconds(lead) / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  leadTypeLabel(type: LeadType): string {
    return type === 'RealTime' ? 'RealTime' : 'OfflineQueue';
  }

  statusLabel(status: LeadStatus): string {
    const labels: Record<LeadStatus, string> = {
      Pending: 'در انتظار',
      Assigned: 'اختصاص‌یافته',
      Expired: 'منقضی'
    };

    return labels[status];
  }

  private syncActiveKeyWithRoute(): void {
    const currentUrl = this.router.url;
    const matchedItem = this.consultantSidebarItems.find((item) => item.route === currentUrl);
    this.activeKey = matchedItem?.key ?? (currentUrl === '/dashboard' ? 'users' : this.activeKey);
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('fa-IR').format(value);
  }
}
