import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Prioridad } from '../models/prioridad.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class PrioridadesService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.apiBaseUrl}/prioridades`;

  getAll(): Observable<Prioridad[]> {
    return this.httpClient.get<Prioridad[]>(this.apiUrl);
  }
}
