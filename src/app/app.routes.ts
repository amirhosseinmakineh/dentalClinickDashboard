import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

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
    path: '**',
    redirectTo: ''
  }
];
