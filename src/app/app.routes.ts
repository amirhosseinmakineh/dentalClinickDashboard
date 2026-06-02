import { Routes } from '@angular/router';

import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    title: 'کلینیک دندانپزشکی دلخند'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'داشبورد مدیریت دلخند'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
