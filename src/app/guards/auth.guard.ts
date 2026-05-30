import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSession } from '../base/auth-session';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  return AuthSession.hasToken() || router.createUrlTree(['/login']);
};
