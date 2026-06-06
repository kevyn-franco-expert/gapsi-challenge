import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, User } from './models';
import { environment } from '../../environments/environment';

/**
 * Authentication service managing JWT tokens and user session state.
 *
 * Responsibilities:
 * - OAuth2 password login against the backend API
 * - Secure token storage in localStorage
 * - Automatic user profile loading on initialization
 * - Logout with session cleanup and navigation
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Base URL of the backend API (environment-specific). */
  private apiUrl = environment.apiUrl;
  /** localStorage key for the JWT access token. */
  private tokenKey = 'access_token';

  /** Reactive signal exposing the currently authenticated user (or null). */
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUser();
  }

  /**
   * Authenticate with username/password and store the returned JWT.
   * @param credentials - Username and plaintext password.
   * @returns Observable emitting the LoginResponse with access_token.
   */
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

  /** Clear session state, remove token, and redirect to login. */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /** Retrieve the stored JWT from localStorage. */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** @returns True if a token exists in storage. */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Load the current user profile using the stored token. */
  private loadUser(): void {
    if (!this.isAuthenticated()) return;
    this.http.get<User>(`${this.apiUrl}/auth/me`).subscribe({
      next: user => this.currentUser.set(user),
      error: () => this.logout()
    });
  }
}
