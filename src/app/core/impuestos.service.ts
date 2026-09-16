import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Impuesto } from './models/impuesto.model';

@Injectable({ providedIn: 'root' })
export class ImpuestosService {
  constructor(private api: ApiService) {}

  listar(): Promise<Impuesto[]> {
    return this.api.get<Impuesto[]>('/impuestos');
  }
}
