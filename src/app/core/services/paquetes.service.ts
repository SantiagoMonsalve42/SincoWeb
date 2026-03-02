import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Paquete } from '../models/paquete.model';

@Injectable({
  providedIn: 'root',
})
export class PaquetesService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7041/api/paquetes';

  getByEstado(estadoId?: number | null): Observable<Paquete[]> {
    let params = new HttpParams();

    if (estadoId !== null && estadoId !== undefined) {
      params = params.set('estadoId', estadoId);
    }

    return this.httpClient.get<Paquete[]>(this.apiUrl, {
      params,
    });
  }
}
