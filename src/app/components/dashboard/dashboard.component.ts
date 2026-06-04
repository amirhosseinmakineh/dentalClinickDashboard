import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { UserRole } from '../../models/auth.model';
import { createPaginatedResult, PaginatedResult } from '../../models/paginated-result.model';
import { AuthSessionService } from '../../services/auth-session.service';
import { AuthService } from '../../services/auth.service';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { SidebarComponent, SidebarItem } from '../sidebar/sidebar.component';

interface DashboardStat {
  label: string;
  value: string;
  trend: string;
  icon: string;
}

interface UserRow {
  id: number;
  name: string;
  role: string;
  phone: string;
  status: string;
  lastSeen: string;
}

interface RoleRow {
  id: number;
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
export class DashboardComponent {
  isSidebarOpen = true;
  activeKey = 'users';
  isProfileSubmitting = false;
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
  private readonly authSession = inject(AuthSessionService);
  private readonly toastr = inject(ToastrService);

  readonly profileForm = this.formBuilder.group({
    nationalCode: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    address: ['', [Validators.required, Validators.maxLength(500)]]
  });

  readonly userForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    role: ['', [Validators.required, Validators.maxLength(80)]],
    phone: ['', [Validators.required, Validators.maxLength(30)]],
    status: ['فعال', [Validators.required]],
    lastSeen: ['همین حالا', [Validators.required, Validators.maxLength(80)]]
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

  users: UserRow[] = [
    { id: 1, name: 'دکتر نرگس محمدی', role: 'مدیر کلینیک', phone: '۰۹۱۲ ۴۴۴ ۱۲۰۰', status: 'فعال', lastSeen: '۱۰ دقیقه پیش' },
    { id: 2, name: 'مریم احمدی', role: 'پذیرش', phone: '۰۹۳۵ ۸۸۱ ۳۴۰۰', status: 'فعال', lastSeen: 'امروز، ۱۲:۳۰' },
    { id: 3, name: 'علی رضایی', role: 'حسابداری', phone: '۰۹۱۹ ۲۲۱ ۷۶۵۴', status: 'در انتظار تایید', lastSeen: 'دیروز' },
    { id: 4, name: 'سارا کریمی', role: 'دستیار پزشک', phone: '۰۹۰۲ ۳۳۸ ۵۴۱۱', status: 'غیرفعال', lastSeen: '۳ روز پیش' },
    { id: 5, name: 'رضا زمانی', role: 'مشاور', phone: '۰۹۱۰ ۷۷۷ ۴۴۲۲', status: 'فعال', lastSeen: 'امروز، ۱۰:۱۵' }
  ];

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

    if (mode === 'create') {
      this.userForm.reset({ name: '', role: '', phone: '', status: 'فعال', lastSeen: 'همین حالا' });
    } else if (user) {
      this.userForm.reset({ name: user.name, role: user.role, phone: user.phone, status: user.status, lastSeen: user.lastSeen });
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
      ['کاربر', 'نقش', 'شماره تماس', 'وضعیت', 'آخرین فعالیت'],
      this.users.map((user) => [user.name, user.role, user.phone, user.status, user.lastSeen])
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

  trackById(_index: number, item: { id: number }): number {
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

    if (this.dialogMode === 'delete' && this.selectedUser) {
      this.users = this.users.filter((user) => user.id !== this.selectedUser?.id);
      this.userPageNumber = Math.min(this.userPageNumber, Math.max(1, Math.ceil(this.users.length / this.userPageSize)));
      this.toastr.success('کاربر در قالب دیالوگ حذف شد.');
      this.closeDialog();
      return;
    }

    const value = this.userForm.getRawValue();
    const nextUser: UserRow = {
      id: this.selectedUser?.id ?? this.getNextId(this.users),
      name: value.name.trim(),
      role: value.role.trim(),
      phone: value.phone.trim(),
      status: value.status,
      lastSeen: value.lastSeen.trim()
    };

    this.users = this.dialogMode === 'edit' ? this.users.map((user) => (user.id === nextUser.id ? nextUser : user)) : [nextUser, ...this.users];
    this.userPageNumber = 1;
    this.toastr.success(this.dialogMode === 'edit' ? 'کاربر از داخل دیالوگ به‌روزرسانی شد.' : 'کاربر جدید از داخل دیالوگ اضافه شد.');
    this.closeDialog();
  }

  private submitRoleDialog(): void {
    if (this.dialogMode !== 'delete' && this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    if (this.dialogMode === 'delete' && this.selectedRole) {
      this.roles = this.roles.filter((role) => role.id !== this.selectedRole?.id);
      this.rolePageNumber = Math.min(this.rolePageNumber, Math.max(1, Math.ceil(this.roles.length / this.rolePageSize)));
      this.toastr.success('نقش در قالب دیالوگ حذف شد.');
      this.closeDialog();
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

    this.roles = this.dialogMode === 'edit' ? this.roles.map((role) => (role.id === nextRole.id ? nextRole : role)) : [nextRole, ...this.roles];
    this.rolePageNumber = 1;
    this.toastr.success(this.dialogMode === 'edit' ? 'نقش از داخل دیالوگ به‌روزرسانی شد.' : 'نقش جدید از داخل دیالوگ ایجاد شد.');
    this.closeDialog();
  }

  private getNextId(rows: Array<{ id: number }>): number {
    return rows.length ? Math.max(...rows.map((row) => row.id)) + 1 : 1;
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
