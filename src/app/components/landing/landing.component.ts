import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

import { AuthSession } from '../../base/auth-session';
import { getAllowedRouteForUser } from '../../base/role-routing';

@Component({
  selector: 'app-landing',
  imports: [MatButtonModule, MatCardModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  readonly user = AuthSession.getUser();

  get isAuthenticated(): boolean {
    return AuthSession.hasToken();
  }

  get dashboardUrl(): string {
    return getAllowedRouteForUser(this.user);
  }
}
