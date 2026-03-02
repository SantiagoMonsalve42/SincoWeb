import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { Repartidor } from '../../core/models/repartidor.model';
import { PaquetesService } from '../../core/services/paquetes.service';
import { RepartidoresService } from '../../core/services/repartidores.service';

interface AssignPaqueteDialogData {
  paqueteId: number;
  codigoSeguimiento: string;
}

@Component({
  selector: 'app-assign-paquete-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './assign-paquete-dialog.component.html',
  styleUrl: './assign-paquete-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignPaqueteDialogComponent {
  protected readonly data = inject<AssignPaqueteDialogData>(MAT_DIALOG_DATA);
  protected readonly repartidores = signal<Repartidor[]>([]);
  protected readonly isLoadingRepartidores = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    repartidorId: [null as number | null, [Validators.required]],
  });

  private readonly dialogRef = inject(MatDialogRef<AssignPaqueteDialogComponent, boolean>);
  private readonly paquetesService = inject(PaquetesService);
  private readonly repartidoresService = inject(RepartidoresService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadRepartidores();
  }

  protected close(): void {
    this.dialogRef.close(false);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const repartidorId = this.form.getRawValue().repartidorId;
    if (repartidorId === null) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isSaving.set(true);

    this.paquetesService.assign(this.data.paqueteId, { repartidorId })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => this.errorMessage.set(err.error.mensaje ?? 'No fue posible asignar el paquete. Intenta de nuevo.'),
      });
  }

  private loadRepartidores(): void {
    this.isLoadingRepartidores.set(true);

    this.repartidoresService.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingRepartidores.set(false)),
      )
      .subscribe({
        next: (repartidores) => this.repartidores.set(repartidores),
        error: () => {
          this.repartidores.set([]);
          this.errorMessage.set('No fue posible cargar los repartidores.');
        },
      });
  }
}
