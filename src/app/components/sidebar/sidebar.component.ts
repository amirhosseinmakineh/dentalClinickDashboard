import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SidebarItem } from '../../data/dashboard.data';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input({ required: true }) items: SidebarItem[] = [];
  @Input() isOpen = true;
  @Input() title = 'DentalDashboard';
  @Input() roleLabel = 'داشبورد';
  @Input() activeKey?: string;
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() itemSelected = new EventEmitter<SidebarItem>();
}
