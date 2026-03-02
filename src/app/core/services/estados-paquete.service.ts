import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoPaquete } from '../models/estado-paquete.model';

@Injectable({
  providedIn: 'root',
})
export class EstadosPaqueteService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7041/api/estados-paquete';

  getAll(): Observable<EstadoPaquete[]> {
    return this.httpClient.get<EstadoPaquete[]>(this.apiUrl);
  }
}
