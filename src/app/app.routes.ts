import { Routes } from '@angular/router';

import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    title: 'کلینیک دندانپزشکی دلخند'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'ورود به سیستم دلخند'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'ثبت‌نام در دلخند'
  },
  {
    path: 'admin',
    component: DashboardComponent,
    title: 'داشبورد ادمین دلخند',
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'داشبورد دلخند',
    canActivate: [authGuard]
  },
  {
    path: 'consultant/dashboard',
    component: DashboardComponent,
    title: 'داشبورد مشاور'
  },
  {
    path: 'consultant/my-leads',
    component: DashboardComponent,
    title: 'لیدهای من'
  },
  {
    path: 'consultant/realtime-leads',
    component: DashboardComponent,
    title: 'لیدهای لحظه‌ای'
  },
  {
    path: 'consultant/offline-queue',
    component: DashboardComponent,
    title: 'صف لیدهای آفلاین'
  },
  {
    path: 'consultant/notifications',
    component: DashboardComponent,
    title: 'اعلان‌های مشاور'
  },
  {
    path: 'consultant/profile',
    component: DashboardComponent,
    title: 'پروفایل مشاور'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
