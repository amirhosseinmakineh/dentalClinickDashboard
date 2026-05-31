import { Component, EventEmitter, HostListener, Input, OnInit, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthSession } from '../../base/auth-session';
import { needsCompleteProfile } from '../../base/role-routing';
import { DashboardConfig, SidebarItem } from '../../data/dashboard.data';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [DashboardHeaderComponent, SidebarComponent, RouterLink],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  private readonly router = inject(Router);

  @Input({ required: true }) config!: DashboardConfig;
  @Input() hideDefaultContent = false;
  @Input() activeSidebarKey?: string;
  @Output() sidebarItemSelected = new EventEmitter<SidebarItem>();

  user = AuthSession.getUser();
  isSidebarOpen = true;

  get shouldShowCompleteProfileAlert(): boolean {
    return needsCompleteProfile(this.user);
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

  selectSidebarItem(item: SidebarItem): void {
    this.sidebarItemSelected.emit(item);
    this.closeMobileSidebar();
  }

  logout(): void {
    AuthSession.clear();
    void this.router.navigateByUrl('/');
  }

  private syncSidebar(width: number): void {
    this.isSidebarOpen = width >= 900;
  }
}
