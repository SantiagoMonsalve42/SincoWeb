import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'sinco-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly name = input('Tu nombre');
  readonly email = input('tu.correo@dominio.com');
  readonly startYear = input(2026);
  readonly dates = computed(() => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}`;
  });
}
