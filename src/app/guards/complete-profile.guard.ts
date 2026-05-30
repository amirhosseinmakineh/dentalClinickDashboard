import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSession } from '../base/auth-session';
import { getAllowedRouteForUser, needsCompleteProfile } from '../base/role-routing';

export const completeProfileGuard: CanActivateFn = () => {
  const router = inject(Router);
  const user = AuthSession.getUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  return needsCompleteProfile(user) || router.createUrlTree([getAllowedRouteForUser(user)]);
};
