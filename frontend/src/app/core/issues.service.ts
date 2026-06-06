import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue, IssueCreate, IssueUpdate, Summary, Status, Priority } from './models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IssuesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(status?: Status, priority?: Priority): Observable<Issue[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    return this.http.get<Issue[]>(`${this.apiUrl}/issues`, { params });
  }

  getById(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/issues/${id}`);
  }

  create(data: IssueCreate): Observable<Issue> {
    return this.http.post<Issue>(`${this.apiUrl}/issues`, data);
  }

  update(id: string, data: IssueUpdate): Observable<Issue> {
    return this.http.patch<Issue>(`${this.apiUrl}/issues/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/issues/${id}`);
  }

  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.apiUrl}/issues/summary`);
  }
}
