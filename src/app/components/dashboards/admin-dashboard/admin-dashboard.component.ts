import { Component } from '@angular/core';

import { CrudGridColumn, CrudGridComponent, CrudGridRow } from '../../../base/crud-grid/crud-grid.component';
import { dashboardConfigs, SidebarItem } from '../../../data/dashboard.data';
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
        />
      }
    </app-main-layout>
  `
})
export class AdminDashboardComponent {
  readonly config = dashboardConfigs.Admin;
  activeSectionKey = 'overview';

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
      description: 'لیست کاربران عمومی سیستم همراه با عملیات کامل CRUD.',
      columns: [
        { key: 'fullName', label: 'نام کاربر' },
        { key: 'email', label: 'ایمیل', type: 'email' },
        { key: 'role', label: 'نقش' },
        { key: 'registeredAt', label: 'تاریخ ثبت‌نام', type: 'date' }
      ],
      rows: [
        { id: 1, fullName: 'علی محمدی', email: 'ali@example.com', role: 'User', registeredAt: '2026-05-01' },
        { id: 2, fullName: 'زهرا موسوی', email: 'zahra@example.com', role: 'User', registeredAt: '2026-05-10' },
        { id: 3, fullName: 'پارسا اکبری', email: 'parsa@example.com', role: 'User', registeredAt: '2026-05-18' }
      ]
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

  selectSection(item: SidebarItem): void {
    this.activeSectionKey = item.key ?? 'overview';
  }
}
