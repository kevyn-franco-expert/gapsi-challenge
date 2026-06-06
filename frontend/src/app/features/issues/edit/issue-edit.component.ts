import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { IssuesService } from '../../../core/issues.service';
import { Issue, IssueUpdate, Priority, Status } from '../../../core/models';

@Component({
  selector: 'app-issue-edit',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Editar Incidencia</h2>
        <p class="text-sm text-gray-500 mt-1">Actualiza la información de la incidencia</p>
      </div>

      <div class="bg-white rounded-xl ring-1 ring-gray-200 shadow-md p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Título <span class="text-red-500">*</span></label>
            <input type="text" formControlName="title"
                   class="h-9 w-full rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-[#e9202f] focus:ring-2 focus:ring-[#e9202f]/50 outline-none transition-all" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción <span class="text-red-500">*</span></label>
            <textarea formControlName="description" rows="4"
                      class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#e9202f] focus:ring-2 focus:ring-[#e9202f]/50 outline-none transition-all resize-none"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad <span class="text-red-500">*</span></label>
            <select formControlName="priority"
                    class="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm bg-white focus:border-[#e9202f] focus:ring-2 focus:ring-[#e9202f]/50 outline-none">
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado <span class="text-red-500">*</span></label>
            <select formControlName="status"
                    class="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm bg-white focus:border-[#e9202f] focus:ring-2 focus:ring-[#e9202f]/50 outline-none">
              <option value="abierto">Abierto</option>
              <option value="en progreso">En Progreso</option>
              <option value="completado">Completado</option>
            </select>
          </div>

          <div *ngIf="error" class="text-sm text-[#e9202f] bg-red-50 rounded-md px-3 py-2">
            {{ error }}
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <a routerLink="/issues"
               class="h-9 px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center">
              Cancelar
            </a>
            <button type="submit" [disabled]="form.invalid || loading"
                    class="h-9 px-4 rounded-lg bg-[#e9202f] hover:bg-[#c91a28] text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center">
              {{ loading ? 'Guardando...' : 'Actualizar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class IssueEditComponent implements OnInit {
  issueId = '';
  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.required],
    priority: ['', Validators.required],
    status: ['', Validators.required]
  });
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private issuesService: IssuesService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.issueId = this.route.snapshot.paramMap.get('id') || '';
    this.issuesService.getById(this.issueId).subscribe({
      next: (issue) => {
        this.form.patchValue({
          title: issue.title,
          description: issue.description,
          priority: issue.priority,
          status: issue.status
        });
      },
      error: () => this.router.navigate(['/issues'])
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const raw = this.form.value;
    const payload: IssueUpdate = {};
    if (raw.title) payload.title = raw.title;
    if (raw.description) payload.description = raw.description;
    if (raw.priority) payload.priority = raw.priority as Priority;
    if (raw.status) payload.status = raw.status as Status;

    this.issuesService.update(this.issueId, payload).subscribe({
      next: () => this.router.navigate(['/issues']),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.detail || 'Error al actualizar la incidencia';
      }
    });
  }
}
