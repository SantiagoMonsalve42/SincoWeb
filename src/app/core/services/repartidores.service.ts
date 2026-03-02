import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Repartidor } from '../models/repartidor.model';

@Injectable({
  providedIn: 'root',
})
export class RepartidoresService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7041/api/repartidores';

  getAll(): Observable<Repartidor[]> {
    return this.httpClient.get<Repartidor[]>(this.apiUrl);
  }
}
