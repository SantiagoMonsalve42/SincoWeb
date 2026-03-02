import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { Prioridad } from '../../core/models/prioridad.model';
import { PaquetesService } from '../../core/services/paquetes.service';
import { PrioridadesService } from '../../core/services/prioridades.service';

@Component({
  selector: 'app-add-paquete-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-paquete-dialog.component.html',
  styleUrl: './add-paquete-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPaqueteDialogComponent {
  protected readonly form = inject(FormBuilder).nonNullable.group({
    descripcion: ['', [Validators.required, Validators.maxLength(250)]],
    peso: [1, [Validators.required, Validators.min(1)]],
    prioridadId: [null as number | null, [Validators.required]],
  });
  protected readonly prioridades = signal<Prioridad[]>([]);
  protected readonly isLoadingPrioridades = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly dialogRef = inject(MatDialogRef<AddPaqueteDialogComponent, boolean>);
  private readonly prioridadesService = inject(PrioridadesService);
  private readonly paquetesService = inject(PaquetesService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadPrioridades();
  }

  protected close(): void {
    this.dialogRef.close(false);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.prioridadId === null) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSaving.set(true);

    this.paquetesService.create({
      descripcion: value.descripcion,
      peso: value.peso,
      prioridadId: value.prioridadId,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: () => this.errorMessage.set('No fue posible crear el paquete. Intenta de nuevo.'),
      });
  }

  private loadPrioridades(): void {
    this.isLoadingPrioridades.set(true);

    this.prioridadesService.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingPrioridades.set(false)),
      )
      .subscribe({
        next: (prioridades) => this.prioridades.set(prioridades),
        error: () => {
          this.prioridades.set([]);
          this.errorMessage.set('No fue posible cargar las prioridades.');
        },
      });
  }
}
