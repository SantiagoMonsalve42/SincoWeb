import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { EstadoPaquete } from '../../core/models/estado-paquete.model';
import { Paquete } from '../../core/models/paquete.model';
import { AddPaqueteDialogComponent } from '../../components/add-paquete-dialog/add-paquete-dialog.component';
import { AssignPaqueteDialogComponent } from '../../components/assign-paquete-dialog/assign-paquete-dialog.component';
import { EstadosPaqueteService } from '../../core/services/estados-paquete.service';
import { PaquetesService } from '../../core/services/paquetes.service';

@Component({
  selector: 'app-home-view',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeView {
  protected readonly displayedColumns = [
    'descripcion',
    'peso',
    'codigoSeguimiento',
    'prioridad',
    'estado',
    'acciones',
  ];
  protected dataSource = new MatTableDataSource<Paquete>([]);
  protected readonly defaultPageSize = 5;
  protected readonly pageSizeOptions = [5, 10, 20];
  protected currentPageSize = this.defaultPageSize;
  protected readonly estadoIdControl = new FormControl<number | null>(null);
  protected readonly estados = signal<EstadoPaquete[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly isLoadingEstados = signal(false);
  protected readonly isDelivering = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly actionMessage = signal<string | null>(null);

  private readonly estadosPaqueteService = inject(EstadosPaqueteService);
  private readonly paquetesService = inject(PaquetesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  protected paginator?: MatPaginator;
  protected sort?: MatSort;

  @ViewChild(MatPaginator)
  set matPaginator(paginator: MatPaginator | undefined) {
    if (!paginator) {
      return;
    }

    this.paginator = paginator;
    this.bindTableControls();
    paginator.pageSize = this.currentPageSize;
  }

  @ViewChild(MatSort)
  set matSort(sort: MatSort | undefined) {
    if (!sort) {
      return;
    }

    this.sort = sort;
    this.bindTableControls();
  }

  constructor() {
    this.configureSortingAccessor(this.dataSource);

    if (isPlatformBrowser(this.platformId)) {
      this.loadEstados();
      this.estadoFilterChanges();
      this.loadPaquetes(this.estadoIdControl.value);
    }
  }

  protected reload(): void {
    this.loadPaquetes(this.estadoIdControl.value);
  }

  protected onPageChange(event: PageEvent): void {
    this.currentPageSize = event.pageSize;
  }

  protected openCreatePaqueteModal(): void {
    const dialogRef = this.dialog.open(AddPaqueteDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      disableClose: true,
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((created) => {
        if (created) {
          this.reload();
        }
      });
  }

  protected openAssignPaqueteModal(paquete: Paquete): void {
    const dialogRef = this.dialog.open(AssignPaqueteDialogComponent, {
      width: '420px',
      maxWidth: '95vw',
      disableClose: true,
      data: {
        paqueteId: paquete.paqueteId,
        codigoSeguimiento: paquete.codigoSeguimiento,
      },
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((assigned) => {
        if (assigned) {
          this.snackBar.open(`Paquete ${paquete.codigoSeguimiento} asignado correctamente.`, 'Cerrar', {
            duration: 3000,
          });
          this.reload();
        }
      });
  }

  protected markAsDelivered(paquete: Paquete): void {
    this.actionMessage.set(null);
    this.isDelivering.set(true);

    this.paquetesService.deliver(paquete.paqueteId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isDelivering.set(false)),
      )
      .subscribe({
        next: () => {
          this.snackBar.open(`Paquete ${paquete.codigoSeguimiento} entregado correctamente.`, 'Cerrar', {
            duration: 3000,
          });
          this.reload();
        },
        error: () => {
          this.actionMessage.set(`No fue posible entregar el paquete ${paquete.codigoSeguimiento}.`);
        },
      });
  }

  private estadoFilterChanges(): void {
    this.estadoIdControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((estadoId) => this.loadPaquetes(estadoId));
  }

  private loadEstados(): void {
    this.isLoadingEstados.set(true);

    this.estadosPaqueteService.getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingEstados.set(false)),
      )
      .subscribe({
        next: (estados) => this.estados.set(estados),
        error: () => this.estados.set([]),
      });
  }

  private loadPaquetes(estadoId: number | null): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.actionMessage.set(null);

    this.paquetesService.getByEstado(estadoId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (paquetes) => {
          this.dataSource.data = paquetes;

          if (this.paginator) {
            this.paginator.firstPage();
          }
        },
        error: () => {
          this.dataSource.data = [];
          this.errorMessage.set('No fue posible cargar los paquetes. Verifica que la API esté disponible.');
        },
      });
  }

  private configureSortingAccessor(dataSource: MatTableDataSource<Paquete>): void {
    dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'prioridad') {
        return item.prioridadId;
      }

      return item[property as keyof Paquete] as string | number;
    };
  }

  private bindTableControls(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
}
