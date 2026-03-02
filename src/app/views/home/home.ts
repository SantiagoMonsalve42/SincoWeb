import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home-view',
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeView {}
