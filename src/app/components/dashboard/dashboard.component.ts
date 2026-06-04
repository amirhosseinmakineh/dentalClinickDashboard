import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdminRole, AdminUser, CreateUserCommandPayload, DeleteUserCommandPayload, RoleCommandPayload, UpdateUserCommandPayload } from '../../models/admin-management.model';
import { UserRole } from '../../models/auth.model';
import { Gender } from '../../models/register-command.model';
import { createPaginatedResult, PaginatedResult } from '../../models/paginated-result.model';
import { AuthSessionService } from '../../services/auth-session.service';
import { AuthService } from '../../services/auth.service';
import { AdminManagementService } from '../../services/admin-management.service';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { SidebarComponent, SidebarItem } from '../sidebar/sidebar.component';

interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

interface UserRow {
  id: number | string;
  firstName: string;
  lastName: string;
  name: string;
  roleName: string;
  phoneNumber: string;
  isActive: boolean;
  isCompleteProfile: boolean;
  avatarImageName: string;
  gender: Gender;
  birthDate: string;
}

interface RoleRow {
  id: number | string;
  title: string;
  members: string;
  scope: string;
  access: string;
}

type DialogEntity = 'user' | 'role';
type DialogMode = 'create' | 'edit' | 'delete';
type ExportFormat = 'excel' | 'pdf';
type DashboardAudience = 'admin' | 'consultant' | 'patient' | 'receptionist' | 'secretary';
type DashboardDevice = 'desktop' | 'mobile';

interface DashboardDisplayPreference {
  audience: DashboardAudience;
  audienceLabel: string;
  desktopLayout: string;
  mobileLayout: string;
  defaultWidget: string;
  tableDensity: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, DashboardHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isSidebarOpen = true;
  activeKey = 'users';
  isProfileSubmitting = false;
  isDialogSubmitting = false;
  isUsersLoading = false;
  isRolesLoading = false;
  userLoadError = '';
  roleLoadError = '';
  role: UserRole = 'unknown';
  isCompleteProfile = true;

  userPageNumber = 1;
  rolePageNumber = 1;
  readonly pageSizeOptions = [3, 5, 10];
  userPageSize = 3;
  rolePageSize = 3;

  dialogEntity: DialogEntity | null = null;
  dialogMode: DialogMode | null = null;
  selectedUser: UserRow | null = null;
  selectedRole: RoleRow | null = null;

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly adminManagementService = inject(AdminManagementService);
  private readonly authSession = inject(AuthSessionService);
  private readonly toastr = inject(ToastrService);

  readonly profileForm = this.formBuilder.group({
    nationalCode: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    address: ['', [Validators.required, Validators.maxLength(500)]]
  });

  readonly userForm = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    passwordHash: ['', [Validators.minLength(6)]],
    roleName: ['', [Validators.required, Validators.maxLength(80)]],
    isActive: [false],
    isCompleteProfile: [false],
    avatarImageName: ['', [Validators.maxLength(200)]],
    gender: [Gender.Male, [Validators.required]],
    birthDate: ['']
  });

  readonly roleForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    members: ['۰ کاربر', [Validators.required, Validators.maxLength(40)]],
    scope: ['', [Validators.required, Validators.maxLength(220)]],
    access: ['محدود', [Validators.required, Validators.maxLength(60)]]
  });

  private readonly adminSidebarItems: SidebarItem[] = [
    { key: 'users', label: 'مدیریت کاربران', icon: 'group' },
    { key: 'roles', label: 'مدیریت نقش ها', icon: 'admin_panel_settings' },
    { key: 'appointments', label: 'نوبت‌ها', icon: 'calendar_month' },
    { key: 'reports', label: 'گزارش‌ها', icon: 'monitoring' },
    { key: 'settings', label: 'تنظیمات نمایش داشبورد', icon: 'dashboard_customize' }
  ];

  private readonly consultantSidebarItems: SidebarItem[] = [
    { key: 'appointments', label: 'نوبت‌ها', icon: 'calendar_month' },
    { key: 'reports', label: 'گزارش مشاوره', icon: 'monitoring' }
  ];

  readonly stats: DashboardStat[] = [
    { label: 'بیماران فعال', value: '۲,۴۸۰', trend: '+۱۲٪ نسبت به ماه قبل', icon: 'groups' },
    { label: 'نوبت‌های امروز', value: '۳۶', trend: '۸ نوبت در انتظار تایید', icon: 'event_available' },
    { label: 'درآمد ماه جاری', value: '۴۸۰م', trend: '+۱۸٪ رشد ماهانه', icon: 'payments' },
    { label: 'درمان‌های باز', value: '۱۲۴', trend: '۲۱ پرونده نیازمند پیگیری', icon: 'medical_services' }
  ];

  users: UserRow[] = [];

  roles: RoleRow[] = [
    { id: 1, title: 'Admin', members: '۲ کاربر', scope: 'مدیریت کاربران، نقش‌ها و مشاوران', access: 'کامل' },
    { id: 2, title: 'Consultant', members: '۹ مشاور', scope: 'داشبورد مشاور و لیدهای اختصاص‌یافته', access: 'عملیاتی' },
    { id: 3, title: 'پذیرش', members: '۵ کاربر', scope: 'نوبت‌دهی و بیماران', access: 'محدود' },
    { id: 4, title: 'مالی', members: '۳ کاربر', scope: 'پرداخت و فاکتور', access: 'محدود' },
    { id: 5, title: 'بیمار', members: '۲۴۸۰ کاربر', scope: 'داشبورد بیمار، نوبت‌ها و پرداخت‌ها', access: 'شخصی‌سازی‌شده' }
  ];

  displayPreferences: DashboardDisplayPreference[] = [
    { audience: 'admin', audienceLabel: 'ادمین', desktopLayout: 'سایدبار کامل + جدول‌های مدیریتی', mobileLayout: 'کارت‌های فشرده + اکشن‌های چسبان', defaultWidget: 'مدیریت کاربران', tableDensity: 'معمولی' },
    { audience: 'consultant', audienceLabel: 'مشاور', desktopLayout: 'لیدهای اولویت‌دار + گزارش مشاوره', mobileLayout: 'صف لیدها + تایمر تمام‌عرض', defaultWidget: 'نوبت‌ها', tableDensity: 'فشرده' },
    { audience: 'patient', audienceLabel: 'بیمار', desktopLayout: 'پرونده درمان + پرداخت‌ها', mobileLayout: 'کارت نوبت بعدی + پرونده خلاصه', defaultWidget: 'نوبت بعدی', tableDensity: 'راحت' },
    { audience: 'receptionist', audienceLabel: 'منشی / پذیرش', desktopLayout: 'تقویم روزانه + جدول بیماران', mobileLayout: 'لیست نوبت‌های امروز', defaultWidget: 'تقویم', tableDensity: 'معمولی' },
    { audience: 'secretary', audienceLabel: 'دبیرخانه', desktopLayout: 'درخواست‌ها + وظایف اداری', mobileLayout: 'کارت وظایف فوری', defaultWidget: 'وظایف فوری', tableDensity: 'فشرده' }
  ];

  constructor() {
    const session = this.authSession.getSession();
    this.role = session?.role ?? 'unknown';
    this.isCompleteProfile = session?.isCompleteProfile ?? true;
    this.activeKey = this.role === 'consultant' ? 'appointments' : 'users';
  }

  ngOnInit(): void {
    if (this.role !== 'consultant') {
      this.loadUsers();
      this.loadRoles();
    }
  }

  get sidebarItems(): SidebarItem[] {
    if (this.requiresConsultantProfile) {
      return [];
    }

    return this.role === 'consultant' ? this.consultantSidebarItems : this.adminSidebarItems;
  }

  get requiresConsultantProfile(): boolean {
    return this.role === 'consultant' && !this.isCompleteProfile;
  }

  get activeTitle(): string {
    return this.sidebarItems.find((item) => item.key === this.activeKey)?.label ?? 'داشبورد';
  }

  get activeSubtitle(): string {
    if (this.requiresConsultantProfile) {
      return 'برای فعال شدن داشبورد، کد ملی و آدرس پروفایل مشاور را تکمیل کنید.';
    }

    if (this.role === 'consultant') {
      return 'دسترسی شما محدود به امکانات مشاور است.';
    }

    if (this.activeKey === 'users') {
      return 'کنترل کاربران، وضعیت حساب‌ها و سطح فعالیت پرسنل کلینیک';
    }

    if (this.activeKey === 'roles') {
      return 'تعریف نقش‌ها، مجوزها و محدوده دسترسی تمام داشبوردها';
    }

    if (this.activeKey === 'settings') {
      return 'انتخاب نحوه نمایش داشبورد روی دسکتاپ و موبایل برای نقش‌های فعلی و آینده';
    }

    return 'نمای کلی عملیات کلینیک';
  }

  get roleLabel(): string {
    if (this.role === 'admin') {
      return 'ادمین';
    }

    if (this.role === 'consultant') {
      return 'مشاور';
    }

    return 'کاربر';
  }

  get userPage(): PaginatedResult<UserRow> {
    return createPaginatedResult(this.users, this.userPageNumber, this.userPageSize);
  }

  get rolePage(): PaginatedResult<RoleRow> {
    return createPaginatedResult(this.roles, this.rolePageNumber, this.rolePageSize);
  }

  get dialogTitle(): string {
    if (this.dialogEntity === 'user') {
      return this.dialogMode === 'create' ? 'افزودن کاربر جدید' : this.dialogMode === 'edit' ? 'ویرایش کاربر' : 'حذف کاربر';
    }

    if (this.dialogEntity === 'role') {
      return this.dialogMode === 'create' ? 'ایجاد نقش جدید' : this.dialogMode === 'edit' ? 'ویرایش نقش' : 'حذف نقش';
    }

    return '';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  setActive(item: SidebarItem): void {
    if (this.requiresConsultantProfile || !this.sidebarItems.some((sidebarItem) => sidebarItem.key === item.key)) {
      return;
    }

    this.activeKey = item.key;
    this.closeSidebar();
  }

  submitConsultantProfile(): void {
    if (this.profileForm.invalid || this.isProfileSubmitting) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isProfileSubmitting = true;
    const value = this.profileForm.getRawValue();

    this.authService
      .completeConsultantProfile({
        nationalCode: value.nationalCode.trim(),
        address: value.address.trim()
      })
      .pipe(finalize(() => (this.isProfileSubmitting = false)))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.toastr.error(result.message);
          return;
        }

        this.authSession.markProfileCompleted();
        this.isCompleteProfile = true;
        this.toastr.success(result.message);
      });
  }

  openUserDialog(mode: DialogMode, user?: UserRow): void {
    this.dialogEntity = 'user';
    this.dialogMode = mode;
    this.selectedUser = user ?? null;
    this.configureUserFormForMode(mode);

    if (mode === 'create') {
      this.userForm.reset({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        passwordHash: '',
        roleName: this.roles[0]?.title ?? '',
        isActive: false,
        isCompleteProfile: false,
        avatarImageName: '',
        gender: Gender.Male,
        birthDate: ''
      });
    } else if (user) {
      this.userForm.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        passwordHash: '',
        roleName: user.roleName,
        isActive: user.isActive,
        isCompleteProfile: user.isCompleteProfile,
        avatarImageName: user.avatarImageName,
        gender: user.gender,
        birthDate: user.birthDate
      });
    }
  }

  openRoleDialog(mode: DialogMode, role?: RoleRow): void {
    this.dialogEntity = 'role';
    this.dialogMode = mode;
    this.selectedRole = role ?? null;

    if (mode === 'create') {
      this.roleForm.reset({ title: '', members: '۰ کاربر', scope: '', access: 'محدود' });
    } else if (role) {
      this.roleForm.reset({ title: role.title, members: role.members, scope: role.scope, access: role.access });
    }
  }

  closeDialog(): void {
    this.dialogEntity = null;
    this.dialogMode = null;
    this.selectedUser = null;
    this.selectedRole = null;
  }

  submitDialog(): void {
    if (this.dialogEntity === 'user') {
      this.submitUserDialog();
      return;
    }

    if (this.dialogEntity === 'role') {
      this.submitRoleDialog();
    }
  }

  changeUserPage(pageNumber: number): void {
    this.userPageNumber = pageNumber;
  }

  changeRolePage(pageNumber: number): void {
    this.rolePageNumber = pageNumber;
  }

  changeUserPageSize(event: Event): void {
    this.userPageSize = Number((event.target as HTMLSelectElement).value);
    this.userPageNumber = 1;
  }

  changeRolePageSize(event: Event): void {
    this.rolePageSize = Number((event.target as HTMLSelectElement).value);
    this.rolePageNumber = 1;
  }

  updateDisplayPreference(audience: DashboardAudience, device: DashboardDevice, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.displayPreferences = this.displayPreferences.map((preference) => {
      if (preference.audience !== audience) {
        return preference;
      }

      return device === 'desktop' ? { ...preference, desktopLayout: value } : { ...preference, mobileLayout: value };
    });
  }

  exportUsers(format: ExportFormat): void {
    this.exportRows(
      format,
      'users',
      ['کاربر', 'نقش', 'شماره تماس', 'وضعیت', 'تکمیل پروفایل'],
      this.users.map((user) => [user.name, user.roleName, user.phoneNumber, this.getUserStatusLabel(user), this.getProfileStatusLabel(user)])
    );
  }

  exportRoles(format: ExportFormat): void {
    this.exportRows(
      format,
      'roles',
      ['نقش', 'اعضا', 'محدوده دسترسی', 'سطح مجوز'],
      this.roles.map((role) => [role.title, role.members, role.scope, role.access])
    );
  }

  trackById(_index: number, item: { id: number | string }): number | string {
    return item.id;
  }

  trackByLabel(_index: number, item: { label: string }): string {
    return item.label;
  }

  trackByPreference(_index: number, item: DashboardDisplayPreference): DashboardAudience {
    return item.audience;
  }

  trackByValue(_index: number, value: number | string): number | string {
    return value;
  }

  private submitUserDialog(): void {
    if (this.dialogMode !== 'delete' && this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (this.isDialogSubmitting) {
      return;
    }

    if (this.dialogMode === 'delete' && this.selectedUser) {
      this.isDialogSubmitting = true;
      const command = this.toDeleteUserCommand(this.selectedUser);

      this.adminManagementService
        .deleteUser(command)
        .pipe(finalize(() => (this.isDialogSubmitting = false)))
        .subscribe((result) => {
          if (!result.isSuccess) {
            this.toastr.error(result.message || 'حذف کاربر ناموفق بود.');
            return;
          }

          this.users = this.users.filter((user) => user.id !== this.selectedUser?.id);
          this.syncRoleMembersFromUsers();
          this.userPageNumber = Math.min(this.userPageNumber, Math.max(1, Math.ceil(this.users.length / this.userPageSize)));
          this.toastr.success(result.message || 'کاربر حذف شد.');
          this.closeDialog();
        });
      return;
    }

    const value = this.userForm.getRawValue();
    const nextUser: UserRow = {
      id: this.selectedUser?.id ?? this.getNextId(this.users),
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      name: [value.firstName.trim(), value.lastName.trim()].filter(Boolean).join(' '),
      roleName: value.roleName.trim(),
      phoneNumber: value.phoneNumber.trim(),
      isActive: value.isActive,
      isCompleteProfile: value.isCompleteProfile,
      avatarImageName: value.avatarImageName.trim(),
      gender: value.gender,
      birthDate: value.birthDate
    };
    const request$ = this.dialogMode === 'edit'
      ? this.adminManagementService.updateUser(this.toUpdateUserCommand(nextUser))
      : this.adminManagementService.createUser(this.toCreateUserCommand(nextUser, value.passwordHash.trim()));

    this.isDialogSubmitting = true;
    request$
      .pipe(finalize(() => (this.isDialogSubmitting = false)))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.toastr.error(result.message || 'ثبت اطلاعات کاربر ناموفق بود.');
          return;
        }

        this.users = this.dialogMode === 'edit' ? this.users.map((user) => (user.id === nextUser.id ? nextUser : user)) : [nextUser, ...this.users];
        this.syncRoleMembersFromUsers();
        this.userPageNumber = 1;
        this.toastr.success(result.message || (this.dialogMode === 'edit' ? 'کاربر به‌روزرسانی شد.' : 'کاربر جدید ایجاد شد.'));
        this.closeDialog();
        this.loadUsers(false);
      });
  }

  private submitRoleDialog(): void {
    if (this.dialogMode !== 'delete' && this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    if (this.isDialogSubmitting) {
      return;
    }

    if (this.dialogMode === 'delete' && this.selectedRole) {
      this.isDialogSubmitting = true;
      const command = this.toRoleCommand(this.selectedRole);

      this.adminManagementService
        .deleteRole(command)
        .pipe(finalize(() => (this.isDialogSubmitting = false)))
        .subscribe((result) => {
          if (!result.isSuccess) {
            this.toastr.error(result.message || 'حذف نقش ناموفق بود.');
            return;
          }

          this.roles = this.roles.filter((role) => role.id !== this.selectedRole?.id);
          this.rolePageNumber = Math.min(this.rolePageNumber, Math.max(1, Math.ceil(this.roles.length / this.rolePageSize)));
          this.toastr.success(result.message || 'نقش حذف شد.');
          this.closeDialog();
        });
      return;
    }

    const value = this.roleForm.getRawValue();
    const nextRole: RoleRow = {
      id: this.selectedRole?.id ?? this.getNextId(this.roles),
      title: value.title.trim(),
      members: value.members.trim(),
      scope: value.scope.trim(),
      access: value.access.trim()
    };
    const command = this.toRoleCommand(nextRole);
    const request$ = this.dialogMode === 'edit' ? this.adminManagementService.updateRole(command) : this.adminManagementService.createRole(command);

    this.isDialogSubmitting = true;
    request$
      .pipe(finalize(() => (this.isDialogSubmitting = false)))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.toastr.error(result.message || 'ثبت اطلاعات نقش ناموفق بود.');
          return;
        }

        this.roles = this.dialogMode === 'edit' ? this.roles.map((role) => (role.id === nextRole.id ? nextRole : role)) : [nextRole, ...this.roles];
        this.rolePageNumber = 1;
        this.toastr.success(result.message || (this.dialogMode === 'edit' ? 'نقش به‌روزرسانی شد.' : 'نقش جدید ایجاد شد.'));
        this.closeDialog();
        this.loadRoles(false);
      });
  }


  private loadUsers(showLoading = true): void {
    if (showLoading) {
      this.isUsersLoading = true;
    }

    this.adminManagementService
      .getUsers()
      .pipe(finalize(() => (this.isUsersLoading = false)))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.userLoadError = result.message || 'امکان دریافت کاربران از API پورت ۵۱۸۲ وجود ندارد.';
          this.toastr.error(this.userLoadError);
          return;
        }

        this.userLoadError = '';
        this.users = (result.data ?? []).map((user, index) => this.toUserRow(user, index));
        this.syncRoleMembersFromUsers();
        this.userPageNumber = 1;
      });
  }

  private loadRoles(showLoading = true): void {
    if (showLoading) {
      this.isRolesLoading = true;
    }

    this.adminManagementService
      .getRoles()
      .pipe(finalize(() => (this.isRolesLoading = false)))
      .subscribe((result) => {
        if (!result.isSuccess) {
          this.roleLoadError = result.message || 'امکان دریافت نقش‌ها از API پورت ۵۱۸۲ وجود ندارد.';
          this.toastr.error(this.roleLoadError);
          return;
        }

        this.roleLoadError = '';
        this.roles = (result.data ?? []).map((role, index) => this.toRoleRow(role, index));
        this.syncRoleMembersFromUsers();
        this.rolePageNumber = 1;
      });
  }

  private toUserRow(user: AdminUser, index: number): UserRow {
    const firstName = user.firstName?.trim() ?? '';
    const lastName = user.lastName?.trim() ?? '';
    const fullName = user.fullName ?? user.name ?? [firstName, lastName].filter(Boolean).join(' ');

    return {
      id: user.id ?? user.userId ?? index + 1,
      firstName: firstName || this.getNamePart(fullName, 'first'),
      lastName: lastName || this.getNamePart(fullName, 'last'),
      name: fullName || 'کاربر بدون نام',
      roleName: user.roleName ?? user.role ?? 'بدون نقش',
      phoneNumber: user.phoneNumber ?? user.phone ?? '-',
      isActive: user.isActive ?? this.statusToIsActive(user.status),
      isCompleteProfile: user.isCompleteProfile ?? false,
      avatarImageName: user.avatarImageName ?? '',
      gender: this.normalizeGender(user.gender),
      birthDate: user.birthDate ?? ''
    };
  }

  private toRoleRow(role: AdminRole, index: number): RoleRow {
    const title = role.title ?? role.name ?? role.roleName ?? 'نقش بدون عنوان';

    return {
      id: role.id ?? role.roleId ?? index + 1,
      title,
      members: `${role.members ?? role.membersCount ?? this.getRoleMembersLabel(title)}`,
      scope: role.scope ?? 'تعریف نشده',
      access: role.access ?? 'محدود'
    };
  }

  private toCreateUserCommand(user: UserRow, passwordHash: string): CreateUserCommandPayload {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      passwordHash,
      birthDate: user.birthDate,
      gender: user.gender,
      avatarImageName: user.avatarImageName || null,
      roleName: user.roleName
    };
  }

  private toUpdateUserCommand(user: UserRow): UpdateUserCommandPayload {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isCompleteProfile: user.isCompleteProfile,
      avatarImageName: user.avatarImageName || null,
      gender: user.gender,
      isActive: user.isActive,
      roleName: user.roleName
    };
  }

  private toDeleteUserCommand(user: UserRow): DeleteUserCommandPayload {
    return { userId: user.id };
  }

  private toRoleCommand(role: RoleRow): RoleCommandPayload {
    return {
      id: role.id,
      roleId: role.id,
      title: role.title,
      name: role.title,
      roleName: role.title,
      members: role.members,
      membersCount: role.members,
      scope: role.scope,
      access: role.access
    };
  }

  getUserStatusLabel(user: UserRow): string {
    return user.isActive ? 'فعال' : 'غیرفعال';
  }

  getProfileStatusLabel(user: UserRow): string {
    return user.isCompleteProfile ? 'تکمیل شده' : 'ناقص';
  }

  getGenderLabel(gender: Gender): string {
    return gender === Gender.Female ? 'خانم' : 'آقا';
  }

  private configureUserFormForMode(mode: DialogMode): void {
    const passwordControl = this.userForm.controls.passwordHash;
    const birthDateControl = this.userForm.controls.birthDate;

    if (mode === 'create') {
      passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
      birthDateControl.setValidators([Validators.required]);
    } else {
      passwordControl.setValidators([Validators.minLength(6)]);
      birthDateControl.clearValidators();
    }

    passwordControl.updateValueAndValidity();
    birthDateControl.updateValueAndValidity();
  }

  private syncRoleMembersFromUsers(): void {
    this.roles = this.roles.map((role) => ({ ...role, members: this.getRoleMembersLabel(role.title) }));
  }

  private getRoleMembersLabel(roleName: string): string {
    const count = this.users.filter((user) => user.roleName === roleName).length;
    return `${count} کاربر`;
  }

  private getNamePart(fullName: string | null | undefined, part: 'first' | 'last'): string {
    const parts = `${fullName ?? ''}`.trim().split(/\s+/).filter(Boolean);
    return part === 'first' ? parts[0] ?? '' : parts.slice(1).join(' ');
  }

  private statusToIsActive(status: string | null | undefined): boolean {
    return !status || ['فعال', 'active', 'true'].includes(`${status}`.trim().toLowerCase());
  }

  private normalizeGender(gender: Gender | number | null | undefined): Gender {
    return Number(gender) === Gender.Female ? Gender.Female : Gender.Male;
  }

  private getNextId(rows: Array<{ id: number | string }>): number {
    const numericIds = rows.map((row) => Number(row.id)).filter((id) => Number.isFinite(id));
    return numericIds.length ? Math.max(...numericIds) + 1 : 1;
  }

  private exportRows(format: ExportFormat, fileName: string, headers: string[], rows: string[][]): void {
    if (format === 'excel') {
      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
      this.downloadFile(`${fileName}.csv`, `\ufeff${csv}`, 'text/csv;charset=utf-8;');
      return;
    }

    const tableRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${this.escapeHtml(cell)}</td>`).join('')}</tr>`).join('');
    const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${fileName}</title><style>body{font-family:tahoma,sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:10px;text-align:right}</style></head><body><h1>${fileName}</h1><table><thead><tr>${headers.map((header) => `<th>${this.escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    printWindow?.document.write(html);
    printWindow?.document.close();
    printWindow?.print();
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private downloadFile(fileName: string, content: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
