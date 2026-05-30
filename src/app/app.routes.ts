import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { completeProfileGuard } from './guards/complete-profile.guard';
import { roleGuard } from './guards/role.guard';
import { AdminDashboardComponent } from './components/dashboards/admin-dashboard/admin-dashboard.component';
import { CompleteProfileComponent } from './components/complete-profile/complete-profile.component';
import { ConsultantDashboardComponent } from './components/dashboards/consultant-dashboard/consultant-dashboard.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { PatientDashboardComponent } from './components/dashboards/patient-dashboard/patient-dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { SecretaryDashboardComponent } from './components/dashboards/secretary-dashboard/secretary-dashboard.component';
import { UserDashboardComponent } from './components/dashboards/user-dashboard/user-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'داشبورد کلینیک دندان‌پزشکی | خوش آمدید'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'داشبورد کلینیک دندان‌پزشکی | ورود'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'داشبورد کلینیک دندان‌پزشکی | ثبت‌نام'
  },
  {
    path: 'dashboard/admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    title: 'داشبورد ادمین'
  },
  {
    path: 'dashboard/secretary',
    component: SecretaryDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Secretary' },
    title: 'داشبورد منشی'
  },
  {
    path: 'dashboard/consultant',
    component: ConsultantDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Consultant' },
    title: 'داشبورد مشاور'
  },
  {
    path: 'dashboard/patient',
    component: PatientDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Patient' },
    title: 'داشبورد بیمار'
  },
  {
    path: 'dashboard/user',
    component: UserDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'User' },
    title: 'داشبورد کاربر عادی'
  },
  {
    path: 'complete-profile',
    component: CompleteProfileComponent,
    canActivate: [authGuard, completeProfileGuard],
    title: 'تکمیل پروفایل'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
