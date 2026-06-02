import { Component, HostListener } from '@angular/core';

import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { SidebarComponent, SidebarItem } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [DashboardHeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  isSidebarOpen = true;
  activeSidebarKey = 'overview';

  readonly sidebarItems: SidebarItem[] = [
    { key: 'overview', label: 'Overview', icon: '⌂' },
    { key: 'workspace', label: 'Workspace', icon: '▦' },
    { key: 'settings', label: 'Settings', icon: '⚙' }
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    this.syncSidebar((event.target as Window).innerWidth);
  }

  constructor() {
    this.syncSidebar(window.innerWidth);
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
    this.activeSidebarKey = item.key;
    this.closeMobileSidebar();
  }

  private syncSidebar(width: number): void {
    this.isSidebarOpen = width >= 900;
  }
}
