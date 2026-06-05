import { Routes } from '@angular/router';

import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ConsultantDashboardComponent } from './components/consultant-dashboard/consultant-dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';
import { LeadManagmentComponent } from './components/leadManagment/leadManagment.component';

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
    component: ConsultantDashboardComponent,
    title: 'داشبورد مشاور دلخند',
    canActivate: [authGuard]
  },
  {
  path: 'consultant',
  component: DashboardComponent,
  title: 'داشبورد مشاور',
  canActivate: [authGuard],
  children: [
    {
      path: 'dashboard',
      component: ConsultantDashboardComponent,
      title: 'داشبورد مشاور'
    },
    {
      path: 'leadManagment',
      component: LeadManagmentComponent,
      title: 'مدیریت لید ها'
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    }
  ]
},
  {
    path: '**',
    redirectTo: ''
  }
];
