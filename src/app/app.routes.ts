import { Routes } from '@angular/router';
import { AuthPlaceholderComponent } from './pages/auth-placeholder/auth-placeholder.component';
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'Dental Clinick | Welcome'
  },
  {
    path: 'login',
    component: AuthPlaceholderComponent,
    title: 'Dental Clinick | Login',
    data: { mode: 'login' }
  },
  {
    path: 'register',
    component: AuthPlaceholderComponent,
    title: 'Dental Clinick | Register',
    data: { mode: 'register' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
