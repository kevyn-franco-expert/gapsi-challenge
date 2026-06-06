import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token after login', () => {
    const mockResponse = { access_token: 'fake-jwt-token', token_type: 'bearer' };
    const credentials = { username: 'admin', password: 'admin123' };

    service.login(credentials).subscribe(res => {
      expect(res.access_token).toBe('fake-jwt-token');
      expect(localStorage.getItem('access_token')).toBe('fake-jwt-token');
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear token on logout', () => {
    localStorage.setItem('access_token', 'token');
    service.logout();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
