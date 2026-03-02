import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoPaquete } from '../models/estado-paquete.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class EstadosPaqueteService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.apiBaseUrl}/estados-paquete`;

  getAll(): Observable<EstadoPaquete[]> {
    return this.httpClient.get<EstadoPaquete[]>(this.apiUrl);
  }
}
