import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatSlideToggleModule,
    MatSidenavModule,
    MatButtonModule,
    NgComponentOutlet,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('SincoWeb');
  protected readonly isDarkMode = signal(false);
  protected readonly isSidenavOpen = signal(false);
  protected readonly footerComponent = FooterComponent;
  protected readonly footerInputs = {
    name: 'Andres Santiago Monsalve',
    email: 'santi.monsalve09@gmail.com',
    startYear: 2024,
  };

  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const root = this.document?.documentElement;
      if (!root) {
        return;
      }

      const darkModeEnabled = this.isDarkMode();
      root.classList.toggle('dark-theme', darkModeEnabled);
      root.style.colorScheme = darkModeEnabled ? 'dark' : 'light';
    });
  }

  protected onThemeToggle(checked: boolean): void {
    this.isDarkMode.set(checked);
  }

  protected openSidenav(): void {
    this.isSidenavOpen.set(true);
  }

  protected closeSidenav(): void {
    this.isSidenavOpen.set(false);
  }
}
