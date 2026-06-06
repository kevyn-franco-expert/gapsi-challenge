import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="min-h-screen bg-black flex items-center justify-center p-4">
      <div class="w-full max-w-sm bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">
            Issue<span class="text-[#e9202f]">Tracker</span>
          </h1>
          <p class="text-sm text-gray-500 mt-2">Inicia sesión para continuar</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input type="text" formControlName="username"
                   class="h-9 w-full rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-[#e9202f] focus:ring-2 focus:ring-[#e9202f]/50 outline-none transition-all"
                   placeholder="admin" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" formControlName="password"
                   class="h-9 w-full rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-[#e9202f] focus:ring-2 focus:ring-[#e9202f]/50 outline-none transition-all"
                   placeholder="••••••" />
          </div>

          <div *ngIf="error" class="text-sm text-[#e9202f] bg-red-50 rounded-md px-3 py-2">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loginForm.invalid || loading"
                  class="w-full h-9 rounded-lg bg-[#e9202f] hover:bg-[#c91a28] text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? 'Entrando...' : 'Iniciar sesión' }}
          </button>
        </form>

        <div class="mt-6 text-center text-xs text-gray-500">
          <p>Usuarios demo:</p>
          <p class="mt-1">admin / admin123</p>
          <p>user / user123</p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.error = '';
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    if (!username || !password) return;

    this.loading = true;
    this.error = '';
    this.auth.login({ username, password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Error al iniciar sesión';
      }
    });
  }
}
