import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center rounded-full h-5 px-2 text-xs font-medium"
          [class.bg-[#166534]]="variant === 'success'"
          [class.text-white]="variant === 'success'"
          [class.bg-gray-100]="variant === 'secondary'"
          [class.text-gray-700]="variant === 'secondary'"
          [class.bg-red-100]="variant === 'danger'"
          [class.text-[#991b1b]]="variant === 'danger'"
          [class.bg-yellow-100]="variant === 'warning'"
          [class.text-yellow-800]="variant === 'warning'">
      <ng-content />
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: 'success' | 'secondary' | 'danger' | 'warning' = 'secondary';
}
