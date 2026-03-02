import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSlideToggleModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SincoWeb');
  protected readonly isDarkMode = signal(false);

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
}
