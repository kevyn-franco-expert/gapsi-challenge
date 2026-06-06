import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IssuesService } from '../../../core/issues.service';
import { Issue, Status, Priority } from '../../../core/models';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

/**
 * Issues list page providing CRUD table view, filtering, and pagination.
 */
@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf, NgFor, DatePipe, TitleCasePipe, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Incidencias</h2>
          <p class="text-sm text-gray-500 mt-1">Gestiona y filtra las incidencias del sistema</p>
        </div>
        <a routerLink="/issues/new"
           class="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#e9202f] hover:bg-[#c91a28] text-white font-semibold text-sm transition-colors">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Incidencia
        </a>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl ring-1 ring-gray-200 shadow-md p-4">
        <form [formGroup]="filterForm" class="flex flex-col sm:flex-row gap-3">
          <select formControlName="status"
                  class="h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:border-[#e9202f] focus:ring-2 focus:ring-[#e9202f]/50 outline-none">
            <option value="">Todos los estados</option>
            <option value="abierto">Abierto</option>
            <option value="en progreso">En Progreso</option>
            <option value="completado">Completado</option>
          </select>
          <select formControlName="priority"
                  class="h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:border-[#e9202f] focus:ring-2 focus:ring-[#e9202f]/50 outline-none">
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <button type="button" (click)="clearFilters()"
                  class="h-9 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Limpiar
          </button>
        </form>
      </div>

      <div *ngIf="error()" class="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
        {{ error() }}
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl ring-1 ring-gray-200 shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b bg-gray-50">
                <th class="h-10 px-4 text-left font-medium text-gray-600 whitespace-nowrap">Título</th>
                <th class="h-10 px-4 text-left font-medium text-gray-600 whitespace-nowrap">Descripción</th>
                <th class="h-10 px-4 text-left font-medium text-gray-600 whitespace-nowrap">Prioridad</th>
                <th class="h-10 px-4 text-left font-medium text-gray-600 whitespace-nowrap">Estado</th>
                <th class="h-10 px-4 text-left font-medium text-gray-600 whitespace-nowrap">Creado</th>
                <th class="h-10 px-4 text-left font-medium text-gray-600 whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let issue of issues()" class="border-b hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{{ issue.title }}</td>
                <td class="px-4 py-3 text-gray-600 max-w-sm truncate">{{ issue.description }}</td>
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
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <a [routerLink]="['/issues', issue.id, 'edit']"
                       class="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </a>
                    <button (click)="deleteIssue(issue.id)"
                            class="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 transition-colors">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="issues().length === 0">
                <td colspan="6" class="px-4 py-12 text-center text-gray-500">
                  No se encontraron incidencias
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span class="text-sm text-gray-500">
            Mostrando {{ issues().length }} registros
          </span>
          <div class="flex items-center gap-2">
            <button (click)="prevPage()" [disabled]="offset() === 0"
                    class="h-8 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Anterior
            </button>
            <button (click)="nextPage()" [disabled]="issues().length < limit"
                    class="h-8 px-3 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IssuesListComponent implements OnInit {
  /** Current page of issues. */
  issues = signal<Issue[]>([]);
  /** Error message signal for user feedback. */
  error = signal<string>('');
  /** Reactive filter form bound to dropdown controls. */
  filterForm = this.fb.group({ status: [''], priority: [''] });
  /** Page size for pagination. */
  limit = 20;
  /** Number of records to skip (pagination offset). */
  offset = signal(0);

  constructor(private issuesService: IssuesService, private fb: FormBuilder) {
    this.filterForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.offset.set(0);
      this.loadIssues();
    });
  }

  /** Load issues on component initialization. */
  ngOnInit(): void {
    this.loadIssues();
  }

  /** Fetch issues from the API applying current filters and pagination. */
  loadIssues(): void {
    this.error.set('');
    const statusValue = this.filterForm.value.status;
    const priorityValue = this.filterForm.value.priority;
    const status = statusValue ? statusValue as Status : undefined;
    const priority = priorityValue ? priorityValue as Priority : undefined;

    this.issuesService.getAll(status, priority, this.limit, this.offset()).subscribe({
      next: data => this.issues.set(data),
      error: () => this.error.set('Error al cargar las incidencias')
    });
  }

  /** Reset filters and return to the first page. */
  clearFilters(): void {
    this.filterForm.reset({ status: '', priority: '' });
    this.offset.set(0);
  }

  /** Advance to the next page. */
  nextPage(): void {
    this.offset.update(v => v + this.limit);
    this.loadIssues();
  }

  /** Return to the previous page. */
  prevPage(): void {
    this.offset.update(v => Math.max(0, v - this.limit));
    this.loadIssues();
  }

  /** Prompt confirmation and delete an issue by ID. */
  deleteIssue(id: string): void {
    if (!confirm('¿Estás seguro de eliminar esta incidencia?')) return;
    this.issuesService.delete(id).subscribe({
      next: () => this.loadIssues(),
      error: () => this.error.set('Error al eliminar la incidencia')
    });
  }

  /** Map priority string to badge variant for UI rendering. */
  priorityVariant(p: string): 'danger' | 'warning' | 'secondary' {
    return p === 'alta' ? 'danger' : p === 'media' ? 'warning' : 'secondary';
  }

  /** Map status string to badge variant for UI rendering. */
  statusVariant(s: string): 'success' | 'warning' | 'secondary' {
    return s === 'completado' ? 'success' : s === 'en progreso' ? 'warning' : 'secondary';
  }
}
