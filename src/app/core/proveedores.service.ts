import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Proveedor } from './models/proveedor.model';

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  constructor(private api: ApiService) {}

  listar(): Promise<Proveedor[]> {
    return this.api.get<Proveedor[]>('/proveedores');
  }

  crear(datos: { nombre: string; cuit?: string; categoria?: string }): Promise<Proveedor> {
    return this.api.post<Proveedor>('/proveedores', datos);
  }
}
