import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Repartidor } from '../models/repartidor.model';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class RepartidoresService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.apiBaseUrl}/repartidores`;

  getAll(): Observable<Repartidor[]> {
    return this.httpClient.get<Repartidor[]>(this.apiUrl);
  }
}
