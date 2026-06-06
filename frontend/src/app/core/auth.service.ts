import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, User } from './models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'access_token';
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const formData = new URLSearchParams();
    formData.set('username', credentials.username);
    formData.set('password', credentials.password);

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, formData.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.access_token);
        this.loadUser();
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUser(): void {
    if (!this.isAuthenticated()) return;
    this.http.get<User>(`${this.apiUrl}/auth/me`).subscribe({
      next: user => this.currentUser.set(user),
      error: () => this.logout()
    });
  }
}
