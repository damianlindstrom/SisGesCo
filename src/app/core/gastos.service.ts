import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { GastoVarioInput } from './models/gasto-vario.model';

@Injectable({ providedIn: 'root' })
export class GastosService {
  constructor(private api: ApiService) {}

  registrar(datos: GastoVarioInput): Promise<{ id: number }> {
    return this.api.post<{ id: number }>('/gastos', datos);
  }
}
