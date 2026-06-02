import { Component } from '@angular/core';


@Component({
  selector: 'app-main-layout',
  imports: [LoginComponent, RegisterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {}
