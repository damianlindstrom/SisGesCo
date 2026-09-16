import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Cliente } from './models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  constructor(private api: ApiService) {}

  listar(): Promise<Cliente[]> {
    return this.api.get<Cliente[]>('/clientes');
  }

  crear(datos: { nombre: string; dniCuit?: string; categoriaId: number }): Promise<Cliente> {
    return this.api.post<Cliente>('/clientes', datos);
  }
}
