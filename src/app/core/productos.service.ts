import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Producto } from './models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  constructor(private api: ApiService) {}

  listar(): Promise<Producto[]> {
    return this.api.get<Producto[]>('/productos');
  }

  obtener(id: number): Promise<Producto> {
    return this.api.get<Producto>(`/productos/${id}`);
  }

  ajustarStock(id: number, cantidadDelta: number, nuevoCosto?: number): Promise<Producto> {
    return this.api.patch<Producto>(`/productos/${id}/stock`, { cantidadDelta, nuevoCosto });
  }

  crear(datos: {
    nombre: string; rubro?: string; tipo?: string; stock?: number; costo: number;
    pctRespInsc: number; pctConsFinal: number; pctCtaCte: number;
  }): Promise<Producto> {
    return this.api.post<Producto>('/productos', datos);
  }

  actualizar(id: number, datos: {
    nombre: string; rubro?: string; tipo?: string; stock: number; costo: number;
    pctRespInsc: number; pctConsFinal: number; pctCtaCte: number;
  }): Promise<Producto> {
    return this.api.patch<Producto>(`/productos/${id}`, datos);
  }
}
