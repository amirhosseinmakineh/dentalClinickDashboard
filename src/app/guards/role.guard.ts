import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AppRole } from '../models/auth.models';
import { RoleService } from '../services/role.service';

export const roleGuard: CanActivateFn = (route) => {
  const expectedRole = route.data['role'] as AppRole | undefined;
  const roleService = inject(RoleService);
  const router = inject(Router);

  if (!expectedRole || roleService.getCurrentRole() === expectedRole) {
    return true;
  }

  return router.createUrlTree([roleService.getDashboardUrl()]);
};
