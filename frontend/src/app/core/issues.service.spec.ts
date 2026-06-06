import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { IssuesService } from './issues.service';
import { authInterceptor } from './auth.interceptor';

describe('IssuesService', () => {
  let service: IssuesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(IssuesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve issues with query params', () => {
    const mockIssues = [
      { id: '1', title: 'Test', description: 'Desc', priority: 'alta', status: 'abierto', created_at: '2026-01-01T00:00:00Z', updated_at: null }
    ];

    service.getAll('abierto', 'alta').subscribe(issues => {
      expect(issues.length).toBe(1);
      expect(issues[0].title).toBe('Test');
    });

    const req = httpMock.expectOne(r => r.url.includes('/issues?status=abierto&priority=alta'));
    expect(req.request.method).toBe('GET');
    req.flush(mockIssues);
  });

  it('should create an issue', () => {
    const mockIssue = { id: '1', title: 'New', description: 'Desc', priority: 'media', status: 'abierto', created_at: '2026-01-01T00:00:00Z', updated_at: null };

    service.create({ title: 'New', description: 'Desc', priority: 'media' }).subscribe(issue => {
      expect(issue.id).toBe('1');
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/issues`);
    expect(req.request.method).toBe('POST');
    req.flush(mockIssue);
  });
});
