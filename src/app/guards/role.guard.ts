import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { getAllowedRouteForUser } from '../base/role-routing';
import { AuthSession } from '../base/auth-session';
import { AppRole } from '../models/auth.models';

export const roleGuard: CanActivateFn = (route) => {
  const expectedRole = route.data['role'] as AppRole | undefined;
  const router = inject(Router);
  const user = AuthSession.getUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  if (expectedRole && user.role !== expectedRole) {
    return router.createUrlTree([getAllowedRouteForUser(user)]);
  }

  const allowedRoute = getAllowedRouteForUser(user);

  const currentPath = `/${route.routeConfig?.path ?? ''}`;

  return allowedRoute === currentPath ? true : router.createUrlTree([allowedRoute]);
};
