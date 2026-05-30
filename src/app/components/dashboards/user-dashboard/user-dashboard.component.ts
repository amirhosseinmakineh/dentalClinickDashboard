import { Component } from '@angular/core';

import { dashboardConfigs } from '../../../data/dashboard.data';
import { MainLayoutComponent } from '../../main-layout/main-layout.component';

@Component({
  selector: 'app-user-dashboard',
  imports: [MainLayoutComponent],
  template: '<app-main-layout [config]="config" />'
})
export class UserDashboardComponent {
  readonly config = dashboardConfigs.User;
}
