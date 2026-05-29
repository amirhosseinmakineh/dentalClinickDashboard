import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-placeholder',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './auth-placeholder.component.html',
  styleUrl: './auth-placeholder.component.scss'
})
export class AuthPlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  readonly mode = this.route.snapshot.data['mode'] === 'register' ? 'Register' : 'Login';
}
