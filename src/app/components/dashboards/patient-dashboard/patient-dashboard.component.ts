import { Component } from '@angular/core';

import { dashboardConfigs } from '../../../data/dashboard.data';
import { MainLayoutComponent } from '../../main-layout/main-layout.component';

@Component({
  selector: 'app-patient-dashboard',
  imports: [MainLayoutComponent],
  template: '<app-main-layout [config]="config" />'
})
export class PatientDashboardComponent {
  readonly config = dashboardConfigs.Patient;
}
