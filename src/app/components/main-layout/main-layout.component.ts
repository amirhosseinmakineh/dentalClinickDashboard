import { Component, HostListener, Input, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { DashboardConfig } from '../../data/dashboard.data';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { TokenService } from '../../services/token.service';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [DashboardHeaderComponent, SidebarComponent, RouterLink],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);

  @Input({ required: true }) config!: DashboardConfig;

  user = this.tokenService.getUserFromToken();
  isSidebarOpen = true;

  get shouldShowCompleteProfileAlert(): boolean {
    return Boolean(
      this.user &&
      this.roleService.canCompleteProfile(this.user.role) &&
      this.user.isCompleteProfile === false
    );
  }

  ngOnInit(): void {
    this.syncSidebar(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    this.syncSidebar((event.target as Window).innerWidth);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeMobileSidebar(): void {
    if (window.innerWidth < 900) {
      this.isSidebarOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/');
  }

  private syncSidebar(width: number): void {
    this.isSidebarOpen = width >= 900;
  }
}
