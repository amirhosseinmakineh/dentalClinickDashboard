import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

import { RoleService } from '../../services/role.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-landing',
  imports: [MatButtonModule, MatCardModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  private readonly tokenService = inject(TokenService);
  private readonly roleService = inject(RoleService);

  readonly user = this.tokenService.getUserFromToken();

  get isAuthenticated(): boolean {
    return this.tokenService.hasToken();
  }

  get dashboardUrl(): string {
    return this.roleService.getDashboardUrl(this.user?.role);
  }
}
