import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 relative overflow-hidden">
      <p class="text-xs font-semibold uppercase tracking-[0.1em] text-[#e9202f]">{{ label }}</p>
      <p class="text-4xl font-bold text-gray-900 mt-2">{{ value }}</p>
      <div *ngIf="trend !== undefined"
           class="flex items-center mt-2 text-sm"
           [class.text-success]="trend >= 0"
           [class.text-danger]="trend < 0">
        <svg *ngIf="trend >= 0" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <svg *ngIf="trend < 0" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        <span>{{ trend >= 0 ? '+' : '' }}{{ trend }}%</span>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-[3px]"
           [class.bg-success]="indicator === 'success'"
           [class.bg-danger]="indicator === 'danger'"
           [class.bg-gray-300]="indicator === 'neutral'"></div>
    </div>
  `
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number | string = 0;
  @Input() trend?: number;
  @Input() indicator: 'success' | 'danger' | 'neutral' = 'neutral';
}
