import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { EstadoPaquete } from '../../core/models/estado-paquete.model';
import { Paquete } from '../../core/models/paquete.model';
import { EstadosPaqueteService } from '../../core/services/estados-paquete.service';
import { PaquetesService } from '../../core/services/paquetes.service';

@Component({
  selector: 'app-home-view',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
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
  ];
  protected readonly dataSource = new MatTableDataSource<Paquete>([]);
  protected readonly defaultPageSize = 5;
  protected readonly pageSizeOptions = [5, 10, 20];
  protected readonly estadoIdControl = new FormControl<number | null>(null);
  protected readonly estados = signal<EstadoPaquete[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly isLoadingEstados = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly estadosPaqueteService = inject(EstadosPaqueteService);
  private readonly paquetesService = inject(PaquetesService);
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
    this.dataSource.paginator = paginator;
    paginator.pageSize = this.defaultPageSize;
  }

  @ViewChild(MatSort)
  set matSort(sort: MatSort | undefined) {
    if (!sort) {
      return;
    }

    this.sort = sort;
    this.dataSource.sort = sort;
  }

  constructor() {
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'prioridad') {
        return item.prioridadId;
      }

      return item[property as keyof Paquete] as string | number;
    };

    if (isPlatformBrowser(this.platformId)) {
      this.loadEstados();
      this.estadoFilterChanges();
      this.loadPaquetes(this.estadoIdControl.value);
    }
  }

  protected reload(): void {
    this.loadPaquetes(this.estadoIdControl.value);
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
}
