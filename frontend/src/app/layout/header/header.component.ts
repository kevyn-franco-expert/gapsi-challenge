import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf],
  template: `
    <header class="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-6">
      <h1 class="text-lg font-semibold text-gray-900">Issue Tracker</h1>
      <div class="flex items-center gap-4" *ngIf="auth.currentUser() as user">
        <span class="text-sm text-gray-600 hidden sm:inline">Hola, {{ user.full_name }}</span>
        <div class="h-8 w-8 rounded-full bg-[#e9202f] text-white flex items-center justify-center text-sm font-semibold">
          {{ user.full_name.charAt(0) }}
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  constructor(public auth: AuthService) {}
}
