import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue, IssueCreate, IssueUpdate, Summary, Status, Priority } from './models';
import { environment } from '../../environments/environment';

/**
 * Issues data service communicating with the backend REST API.
 *
 * Provides CRUD operations, filtering, pagination, and summary aggregation.
 * All methods return strongly-typed Observables for reactive consumption.
 */
@Injectable({ providedIn: 'root' })
export class IssuesService {
  /** Base URL of the backend API (environment-specific). */
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Retrieve a paginated list of issues with optional filters.
   * @param status - Optional status filter.
   * @param priority - Optional priority filter.
   * @param limit - Page size (default 20).
   * @param offset - Records to skip for pagination.
   * @returns Observable of Issue array.
   */
  getAll(status?: Status, priority?: Priority, limit = 20, offset = 0): Observable<Issue[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    params = params.set('limit', limit.toString());
    params = params.set('offset', offset.toString());
    return this.http.get<Issue[]>(`${this.apiUrl}/issues`, { params });
  }

  /** Fetch a single issue by its unique identifier. */
  getById(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/issues/${id}`);
  }

  /** Persist a new issue. */
  create(data: IssueCreate): Observable<Issue> {
    return this.http.post<Issue>(`${this.apiUrl}/issues`, data);
  }

  /** Apply a partial update to an existing issue. */
  update(id: string, data: IssueUpdate): Observable<Issue> {
    return this.http.patch<Issue>(`${this.apiUrl}/issues/${id}`, data);
  }

  /** Remove an issue by ID (admin-only). */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/issues/${id}`);
  }

  /** Retrieve aggregate KPI counts. */
  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.apiUrl}/issues/summary`);
  }
}
