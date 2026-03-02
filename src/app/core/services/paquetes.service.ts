import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Paquete } from '../models/paquete.model';
import { CrearPaqueteRequest } from '../models/prioridad.model';
import { AsignarPaqueteRequest } from '../models/repartidor.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class PaquetesService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.apiBaseUrl}/paquetes`;

  getByEstado(estadoId?: number | null): Observable<Paquete[]> {
    let params = new HttpParams();

    if (estadoId !== null && estadoId !== undefined) {
      params = params.set('estadoId', estadoId);
    }

    return this.httpClient.get<Paquete[]>(this.apiUrl, {
      params,
    });
  }

  create(request: CrearPaqueteRequest): Observable<Paquete> {
    return this.httpClient.post<Paquete>(this.apiUrl, request);
  }

  assign(paqueteId: number, request: AsignarPaqueteRequest): Observable<void> {
    return this.httpClient.post<void>(`${this.apiUrl}/${paqueteId}/asignar`, request);
  }

  deliver(paqueteId: number): Observable<void> {
    return this.httpClient.post<void>(`${this.apiUrl}/${paqueteId}/entregar`, {});
  }
}
