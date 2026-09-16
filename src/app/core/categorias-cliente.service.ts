import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CategoriaCliente } from './models/categoria-cliente.model';

@Injectable({ providedIn: 'root' })
export class CategoriasClienteService {
  constructor(private api: ApiService) {}

  listar(): Promise<CategoriaCliente[]> {
    return this.api.get<CategoriaCliente[]>('/categorias-cliente');
  }
}
