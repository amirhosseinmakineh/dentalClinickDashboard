import { Component, OnInit, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { CrudGridColumn, CrudGridComponent, CrudGridQueryChange, CrudGridRow } from '../../../base/crud-grid/crud-grid.component';
import { BaseResponse, getBackendErrorMessage, getResponseData, getResponseMessage, isSuccessfulResponse } from '../../../base/api-response.models';
import { dashboardConfigs, SidebarItem } from '../../../data/dashboard.data';
import { CreateUserCommand, UpdateUserCommand, UserListItem, UserListResult } from '../../../models/user-management.models';
import { UserManagementService } from '../../../services/user-management.service';
import { MainLayoutComponent } from '../../main-layout/main-layout.component';

interface AdminManagementSection {
  key: string;
  title: string;
  description: string;
  columns: CrudGridColumn[];
  rows: CrudGridRow[];
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [MainLayoutComponent, CrudGridComponent],
  template: `
    <app-main-layout
      [config]="config"
      [hideDefaultContent]="true"
      [activeSidebarKey]="activeSectionKey"
      (sidebarItemSelected)="selectSection($event)"
    >
      @if (activeSection) {
        <app-crud-grid
          [title]="activeSection.title"
          [description]="activeSection.description"
          [columns]="activeSection.columns"
          [rows]="activeSection.rows"
          [remoteMode]="isUsersSection"
          [loading]="isUsersLoading"
          [totalCount]="usersTotalCount"
          [serverPageNumber]="usersQuery.pageNumber"
          [serverPageSize]="usersQuery.pageSize"
          (queryChange)="loadUsers($event)"
          (createRow)="createUser($event)"
          (updateRow)="updateUser($event)"
          (deleteRow)="deleteUser($event)"
        />
      }
    </app-main-layout>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly userManagementService = inject(UserManagementService);
  private readonly toastr = inject(ToastrService);

  readonly config = dashboardConfigs.Admin;
  activeSectionKey = 'overview';
  isUsersLoading = false;
  usersTotalCount = 0;
  usersQuery: CrudGridQueryChange = { pageNumber: 1, pageSize: 10, search: '' };

  readonly roleOptions = [
    { label: 'ادمین', value: 'Admin' },
    { label: 'مشاور', value: 'Consultant' },
    { label: 'منشی', value: 'Secretary' },
    { label: 'بیمار', value: 'Patient' },
    { label: 'کاربر عادی', value: 'User' }
  ];

  readonly genderOptions = [
    { label: 'مرد', value: 1 },
    { label: 'زن', value: 2 }
  ];

  readonly sections: AdminManagementSection[] = [
    {
      key: 'admins',
      title: 'ادمین‌ها',
      description: 'افزودن، آپدیت، حذف و مشاهده ادمین‌های سیستم.',
      columns: [
        { key: 'fullName', label: 'نام و نام خانوادگی' },
        { key: 'email', label: 'ایمیل', type: 'email' },
        { key: 'accessLevel', label: 'سطح دسترسی' },
        { key: 'status', label: 'وضعیت' }
      ],
      rows: [
        { id: 1, fullName: 'نیما احمدی', email: 'nima.admin@clinic.local', accessLevel: 'مدیر ارشد', status: 'فعال' },
        { id: 2, fullName: 'الهام کریمی', email: 'elham.admin@clinic.local', accessLevel: 'مدیر پذیرش', status: 'فعال' },
        { id: 3, fullName: 'سارا رضایی', email: 'sara.admin@clinic.local', accessLevel: 'گزارش‌ها', status: 'غیرفعال' }
      ]
    },
    {
      key: 'consultants',
      title: 'مشاورها',
      description: 'مدیریت اطلاعات مشاورها و وضعیت همکاری آن‌ها.',
      columns: [
        { key: 'fullName', label: 'نام مشاور' },
        { key: 'phone', label: 'شماره تماس', type: 'tel' },
        { key: 'specialty', label: 'حوزه مشاوره' },
        { key: 'status', label: 'وضعیت' }
      ],
      rows: [
        { id: 1, fullName: 'دکتر مهدی صفایی', phone: '09120000001', specialty: 'ایمپلنت', status: 'فعال' },
        { id: 2, fullName: 'دکتر نرگس پارسا', phone: '09120000002', specialty: 'ارتودنسی', status: 'فعال' },
        { id: 3, fullName: 'دکتر شایان نوری', phone: '09120000003', specialty: 'زیبایی لبخند', status: 'مرخصی' }
      ]
    },
    {
      key: 'secretaries',
      title: 'منشی‌ها',
      description: 'مدیریت منشی‌ها، شیفت کاری و وضعیت دسترسی.',
      columns: [
        { key: 'fullName', label: 'نام منشی' },
        { key: 'phone', label: 'شماره تماس', type: 'tel' },
        { key: 'shift', label: 'شیفت' },
        { key: 'status', label: 'وضعیت' }
      ],
      rows: [
        { id: 1, fullName: 'مریم حسینی', phone: '09121111111', shift: 'صبح', status: 'فعال' },
        { id: 2, fullName: 'نگار صالحی', phone: '09122222222', shift: 'عصر', status: 'فعال' },
        { id: 3, fullName: 'مهسا مرادی', phone: '09123333333', shift: 'شناور', status: 'آموزش' }
      ]
    },
    {
      key: 'users',
      title: 'کاربران',
      description: 'مدیریت کاربران با اتصال مستقیم به UserController بک‌اند.',
      columns: [
        { key: 'firstName', label: 'نام' },
        { key: 'lastName', label: 'نام خانوادگی' },
        { key: 'phoneNumber', label: 'شماره تماس', type: 'tel' },
        { key: 'roleName', label: 'نقش', type: 'select', options: this.roleOptions, defaultValue: 'User', createOnly: true },
        { key: 'isActiveLabel', label: 'وضعیت', hiddenInForm: true },
        { key: 'passwordHash', label: 'رمز عبور', type: 'password', hiddenInGrid: true, createOnly: true },
        { key: 'birthDate', label: 'تاریخ تولد', type: 'date', hiddenInGrid: true, createOnly: true },
        { key: 'avatarImageName', label: 'نام فایل آواتار', hiddenInGrid: true, required: false },
        { key: 'gender', label: 'جنسیت', type: 'select', hiddenInGrid: true, options: this.genderOptions, defaultValue: 1 },
        { key: 'isCompleteProfile', label: 'پروفایل کامل است', type: 'checkbox', hiddenInGrid: true, defaultValue: true },
        { key: 'isActive', label: 'فعال باشد', type: 'checkbox', hiddenInGrid: true, updateOnly: true, defaultValue: true }
      ],
      rows: []
    },
    {
      key: 'patients',
      title: 'بیماران',
      description: 'مدیریت بیماران، کد پرونده و آخرین وضعیت درمان.',
      columns: [
        { key: 'fullName', label: 'نام بیمار' },
        { key: 'phone', label: 'شماره تماس', type: 'tel' },
        { key: 'fileNumber', label: 'شماره پرونده' },
        { key: 'treatmentStatus', label: 'وضعیت درمان' }
      ],
      rows: [
        { id: 1, fullName: 'سینا رستمی', phone: '09124444444', fileNumber: 'P-1001', treatmentStatus: 'درمان فعال' },
        { id: 2, fullName: 'الهه نظری', phone: '09125555555', fileNumber: 'P-1002', treatmentStatus: 'مشاوره' },
        { id: 3, fullName: 'محمد تقوی', phone: '09126666666', fileNumber: 'P-1003', treatmentStatus: 'تکمیل شده' }
      ]
    },
    {
      key: 'contacts',
      title: 'شماره تماس‌ها',
      description: 'مدیریت شماره‌های تماس ضروری و قابل استفاده در داشبوردها.',
      columns: [
        { key: 'ownerName', label: 'عنوان/مالک' },
        { key: 'phone', label: 'شماره تماس', type: 'tel' },
        { key: 'category', label: 'دسته‌بندی' },
        { key: 'status', label: 'وضعیت' }
      ],
      rows: [
        { id: 1, ownerName: 'پذیرش مرکزی', phone: '021-11111111', category: 'کلینیک', status: 'فعال' },
        { id: 2, ownerName: 'اورژانس کلینیک', phone: '021-22222222', category: 'اضطراری', status: 'فعال' },
        { id: 3, ownerName: 'پشتیبانی بیماران', phone: '021-33333333', category: 'پیگیری', status: 'فعال' }
      ]
    }
  ];

  get activeSection(): AdminManagementSection | undefined {
    return this.sections.find((section) => section.key === this.activeSectionKey);
  }

  get isUsersSection(): boolean {
    return this.activeSectionKey === 'users';
  }

  ngOnInit(): void {
    if (this.isUsersSection) {
      this.loadUsers(this.usersQuery);
    }
  }

  selectSection(item: SidebarItem): void {
    this.activeSectionKey = item.key ?? 'overview';

    if (this.isUsersSection) {
      this.loadUsers(this.usersQuery);
    }
  }

  loadUsers(query: CrudGridQueryChange): void {
    this.usersQuery = query;
    this.isUsersLoading = true;

    this.userManagementService.getUsers(query)
      .pipe(finalize(() => this.isUsersLoading = false))
      .subscribe({
        next: (response: BaseResponse<UserListResult>) => {
          if (!isSuccessfulResponse(response)) {
            this.toastr.error(getResponseMessage(response, 'امکان دریافت لیست کاربران وجود ندارد.'), 'خطا');
            return;
          }

          const result = getResponseData(response) ?? this.getEmptyUsersResult(query);
          this.usersTotalCount = result.totalCount;
          this.usersQuery = {
            pageNumber: result.pageNumber,
            pageSize: result.pageSize,
            search: query.search
          };
          this.setUsersRows(result.items);
        },
        error: (error: unknown) => {
          this.toastr.error(getBackendErrorMessage(error, 'امکان دریافت لیست کاربران وجود ندارد.'), 'خطا');
        }
      });
  }

  createUser(row: CrudGridRow): void {
    const command: CreateUserCommand = {
      firstName: String(row['firstName'] ?? ''),
      lastName: String(row['lastName'] ?? ''),
      phoneNumber: String(row['phoneNumber'] ?? ''),
      passwordHash: String(row['passwordHash'] ?? ''),
      isCompleteProfile: Boolean(row['isCompleteProfile']),
      avatarImageName: this.getNullableString(row['avatarImageName']),
      gender: Number(row['gender'] ?? 1),
      birthDate: this.toIsoDate(row['birthDate']),
      roles: [{ roleName: String(row['roleName'] ?? 'User') }]
    };

    this.isUsersLoading = true;
    this.userManagementService.createUser(command)
      .pipe(finalize(() => this.isUsersLoading = false))
      .subscribe({
        next: (response: BaseResponse<unknown>) => this.handleUsersMutationResponse(response, 'کاربر با موفقیت ایجاد شد.'),
        error: (error: unknown) => this.toastr.error(getBackendErrorMessage(error, 'امکان ایجاد کاربر وجود ندارد.'), 'خطا')
      });
  }

  updateUser(row: CrudGridRow): void {
    const command: UpdateUserCommand = {
      id: String(row.id),
      firstName: String(row['firstName'] ?? ''),
      lastName: String(row['lastName'] ?? ''),
      phoneNumber: String(row['phoneNumber'] ?? ''),
      isCompleteProfile: Boolean(row['isCompleteProfile']),
      avatarImageName: this.getNullableString(row['avatarImageName']),
      gender: Number(row['gender'] ?? 1),
      isActive: Boolean(row['isActive'])
    };

    this.isUsersLoading = true;
    this.userManagementService.updateUser(command)
      .pipe(finalize(() => this.isUsersLoading = false))
      .subscribe({
        next: (response: BaseResponse<unknown>) => this.handleUsersMutationResponse(response, 'کاربر با موفقیت آپدیت شد.'),
        error: (error: unknown) => this.toastr.error(getBackendErrorMessage(error, 'امکان آپدیت کاربر وجود ندارد.'), 'خطا')
      });
  }

  deleteUser(row: CrudGridRow): void {
    this.isUsersLoading = true;
    this.userManagementService.deleteUser({ userId: String(row.id) })
      .pipe(finalize(() => this.isUsersLoading = false))
      .subscribe({
        next: (response: BaseResponse<unknown>) => this.handleUsersMutationResponse(response, 'کاربر با موفقیت حذف شد.'),
        error: (error: unknown) => this.toastr.error(getBackendErrorMessage(error, 'امکان حذف کاربر وجود ندارد.'), 'خطا')
      });
  }

  private handleUsersMutationResponse(response: BaseResponse<unknown>, successMessage: string): void {
    if (!isSuccessfulResponse(response)) {
      this.toastr.error(getResponseMessage(response, 'عملیات مدیریت کاربر انجام نشد.'), 'خطا');
      return;
    }

    this.toastr.success(getResponseMessage(response, successMessage), 'موفق');
    this.loadUsers(this.usersQuery);
  }

  private setUsersRows(users: UserListItem[]): void {
    const usersSection = this.sections.find((section) => section.key === 'users');

    if (!usersSection) {
      return;
    }

    usersSection.rows = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      roleName: user.roleName,
      isActive: user.isActive,
      isActiveLabel: user.isActive ? 'فعال' : 'غیرفعال',
      isCompleteProfile: false,
      avatarImageName: '',
      gender: 1
    }));
  }

  private getNullableString(value: unknown): string | null {
    const text = String(value ?? '').trim();

    return text || null;
  }

  private toIsoDate(value: unknown): string {
    const rawDate = String(value ?? '').trim();

    if (!rawDate) {
      return new Date().toISOString();
    }

    const date = new Date(`${rawDate}T00:00:00.000Z`);

    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  private getEmptyUsersResult(query: CrudGridQueryChange): UserListResult {
    return {
      items: [],
      totalCount: 0,
      pageNumber: query.pageNumber,
      pageSize: query.pageSize,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false
    };
  }
}
