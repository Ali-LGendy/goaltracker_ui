import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Goals } from './pages/goals/goals';

export const routes: Routes = [
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'goals', component: Goals },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
