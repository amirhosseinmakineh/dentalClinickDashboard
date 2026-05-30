import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DecodedUser } from '../../models/auth.models';

@Component({
  selector: 'app-dashboard-header',
  imports: [RouterLink],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
  @Input() user: DecodedUser | null = null;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
