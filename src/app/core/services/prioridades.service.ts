import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Prioridad } from '../models/prioridad.model';

@Injectable({
  providedIn: 'root',
})
export class PrioridadesService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7041/api/prioridades';

  getAll(): Observable<Prioridad[]> {
    return this.httpClient.get<Prioridad[]>(this.apiUrl);
  }
}
