import { Component } from '@angular/core';

import { dashboardConfigs } from '../../../data/dashboard.data';
import { MainLayoutComponent } from '../../main-layout/main-layout.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [MainLayoutComponent],
  template: '<app-main-layout [config]="config" />'
})
export class AdminDashboardComponent {
  readonly config = dashboardConfigs.Admin;
}
