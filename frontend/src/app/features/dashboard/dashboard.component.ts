import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IssuesService } from '../../core/issues.service';
import { Issue, Summary } from '../../core/models';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe, TitleCasePipe, StatCardComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card label="Total Incidencias" [value]="summary()?.total ?? 0" indicator="neutral" />
        <app-stat-card label="Abiertas" [value]="summary()?.by_status?.['abierto'] ?? 0" indicator="danger" />
        <app-stat-card label="En Progreso" [value]="summary()?.by_status?.['en progreso'] ?? 0" indicator="neutral" />
        <app-stat-card label="Completadas" [value]="summary()?.by_status?.['completado'] ?? 0" indicator="success" />
      </div>

      <!-- Recent Issues -->
      <div class="bg-white rounded-xl ring-1 ring-gray-200 shadow-md">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-gray-900">Incidencias Recientes</h2>
            <p class="text-sm text-gray-500">Últimas incidencias registradas</p>
          </div>
          <a routerLink="/issues" class="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Ver todas
          </a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="h-10 px-4 text-left font-medium text-gray-600 whitespace-nowrap">Título</th>
                <th class="h-10 px-4 text-left font-medium text-gray-600 whitespace-nowrap">Prioridad</th>
                <th class="h-10 px-4 text-left font-medium text-gray-600 whitespace-nowrap">Estado</th>
                <th class="h-10 px-4 text-left font-medium text-gray-600 whitespace-nowrap">Creado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let issue of recentIssues()" class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900">{{ issue.title }}</td>
                <td class="px-4 py-3">
                  <app-badge [variant]="priorityVariant(issue.priority)">
                    {{ issue.priority | titlecase }}
                  </app-badge>
                </td>
                <td class="px-4 py-3">
                  <app-badge [variant]="statusVariant(issue.status)">
                    {{ issue.status | titlecase }}
                  </app-badge>
                </td>
                <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ issue.created_at | date:'short' }}</td>
              </tr>
              <tr *ngIf="recentIssues().length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-gray-500 text-sm">
                  No hay incidencias registradas
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  summary = signal<Summary | null>(null);
  recentIssues = signal<Issue[]>([]);
  error = signal<string>('');

  constructor(private issuesService: IssuesService) {
    takeUntilDestroyed();
  }

  ngOnInit(): void {
    this.issuesService.getSummary().subscribe({
      next: s => this.summary.set(s),
      error: () => this.error.set('Error al cargar el resumen')
    });
    this.issuesService.getAll().subscribe({
      next: list => this.recentIssues.set(list.slice(0, 5)),
      error: () => this.error.set('Error al cargar incidencias')
    });
  }

  priorityVariant(p: string): 'danger' | 'warning' | 'secondary' {
    return p === 'alta' ? 'danger' : p === 'media' ? 'warning' : 'secondary';
  }

  statusVariant(s: string): 'success' | 'warning' | 'secondary' {
    return s === 'completado' ? 'success' : s === 'en progreso' ? 'warning' : 'secondary';
  }
}
