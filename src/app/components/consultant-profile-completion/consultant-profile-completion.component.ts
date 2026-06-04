import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultant-profile-completion',
  imports: [ReactiveFormsModule],
  templateUrl: './consultant-profile-completion.component.html',
  styleUrl: './consultant-profile-completion.component.scss'
})
export class ConsultantProfileCompletionComponent {
  @Input({ required: true }) profileForm!: FormGroup;
  @Input() isSubmitting = false;
  @Output() profileSubmit = new EventEmitter<void>();
}
