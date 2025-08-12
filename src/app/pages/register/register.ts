import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm;
  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.registerForm = this.fb.group({
      name: this.fb.nonNullable.control('', Validators.required),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(5)]),
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.auth.register(this.registerForm.getRawValue()).subscribe({
      next: () => alert('Registration successful!'),
      error: err => alert(err.error.message || 'Registration failed'),
    });
  }
}
