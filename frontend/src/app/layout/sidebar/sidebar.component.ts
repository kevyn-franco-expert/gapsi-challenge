import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  template: `
    <aside class="hidden lg:flex fixed left-0 top-0 h-screen w-[260px] bg-black flex-col">
      <div class="h-16 flex items-center px-6">
        <span class="text-white font-bold text-xl">
          Issue<span class="text-[#e9202f]">Tracker</span>
        </span>
      </div>

      <nav class="flex-1 px-4 py-4 space-y-1">
        <a routerLink="/" routerLinkActive="bg-white/10 text-white border-l-[3px] border-[#e9202f]"
           [routerLinkActiveOptions]="{ exact: true }"
           class="flex items-center px-4 py-2.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <svg class="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Dashboard
        </a>
        <a routerLink="/issues" routerLinkActive="bg-white/10 text-white border-l-[3px] border-[#e9202f]"
           class="flex items-center px-4 py-2.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <svg class="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Incidencias
        </a>
      </nav>

      <div class="p-4 border-t border-white/10" *ngIf="auth.currentUser() as user">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-full bg-[#e9202f] text-white flex items-center justify-center text-sm font-semibold">
            {{ user.full_name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ user.full_name }}</p>
            <p class="text-xs text-gray-400">{{ user.role }}</p>
          </div>
          <button (click)="auth.logout()" class="text-gray-400 hover:text-white transition-colors">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile trigger -->
    <button class="lg:hidden fixed top-3 left-3 z-50 bg-black/50 text-white p-2 rounded-md" (click)="mobileOpen = !mobileOpen">
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Mobile drawer -->
    <div *ngIf="mobileOpen" class="lg:hidden fixed inset-0 z-40" (click)="mobileOpen = false">
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="absolute left-0 top-0 h-full w-[260px] bg-black flex flex-col" (click)="$event.stopPropagation()">
        <div class="h-16 flex items-center px-6">
          <span class="text-white font-bold text-xl">
            Issue<span class="text-[#e9202f]">Tracker</span>
          </span>
        </div>
        <nav class="flex-1 px-4 py-4 space-y-1">
          <a routerLink="/" (click)="mobileOpen = false" routerLinkActive="bg-white/10 text-white border-l-[3px] border-[#e9202f]"
             [routerLinkActiveOptions]="{ exact: true }"
             class="flex items-center px-4 py-2.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            Dashboard
          </a>
          <a routerLink="/issues" (click)="mobileOpen = false" routerLinkActive="bg-white/10 text-white border-l-[3px] border-[#e9202f]"
             class="flex items-center px-4 py-2.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            Incidencias
          </a>
        </nav>
        <div class="p-4 border-t border-white/10" *ngIf="auth.currentUser() as user">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-full bg-[#e9202f] text-white flex items-center justify-center text-sm font-semibold">
              {{ user.full_name.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-medium text-white">{{ user.full_name }}</p>
              <p class="text-xs text-gray-400">{{ user.role }}</p>
            </div>
            <button (click)="auth.logout()" class="text-gray-400 hover:text-white ml-auto">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent {
  mobileOpen = false;
  constructor(public auth: AuthService) {}
}
