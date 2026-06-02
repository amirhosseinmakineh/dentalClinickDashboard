import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SidebarItem {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() items: SidebarItem[] = [];
  @Input() isOpen = true;
  @Input() title = 'Angular 20';
  @Input() subtitle = 'Default layout';
  @Input() activeKey?: string;
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() itemSelected = new EventEmitter<SidebarItem>();
}
