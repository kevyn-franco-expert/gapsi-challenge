import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen bg-[#f4f4f4]">
      <app-sidebar />
      <div class="lg:ml-[260px] min-h-screen flex flex-col">
        <app-header />
        <main class="flex-1 p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class ShellComponent {}
