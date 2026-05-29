import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'Dental Clinick | Welcome'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Dental Clinick | Login'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Dental Clinick | Register'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
