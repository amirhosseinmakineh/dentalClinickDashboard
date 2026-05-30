import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

export type ButtonVariant = 'flat' | 'stroked' | 'basic';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  imports: [MatButtonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('flat');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false);
  readonly fullWidth = input(false);
  readonly ariaLabel = input<string | null>(null);
}
