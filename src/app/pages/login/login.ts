import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm;
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(5)]),
    })
  }

  onSubmit() {
  if(this.loginForm.invalid) return;

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.access_token);
        Promise.resolve().then(() => {
          this.router.navigate(['/goals']);
        });
      },
      error: err => alert(err.error.message || 'Login failed'),
    })
  }
}
