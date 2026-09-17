import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Impuesto, FormaPago } from '../core/models/parametros.model';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {
  constructor(private api: ApiService) {}

  // --- IMPUESTOS ---
  async getImpuestos(): Promise<Impuesto[]> {
    return this.api.get<Impuesto[]>('/impuestos');
  }

  async crearImpuesto(impuesto: Omit<Impuesto, 'id'>): Promise<Impuesto> {
    return this.api.post<Impuesto>('/impuestos', impuesto);
  }

  async actualizarImpuesto(id: number | string, impuesto: Partial<Impuesto>): Promise<Impuesto> {
    return this.api.patch<Impuesto>(`/impuestos/${id}`, impuesto);
  }

  async eliminarImpuesto(id: number | string): Promise<void> {
    return this.api.delete<void>(`/impuestos/${id}`);
  }

  // --- FORMAS DE PAGO ---
  async getFormasPago(): Promise<FormaPago[]> {
    return this.api.get<FormaPago[]>('/formas-pago');
  }

  async crearFormaPago(formaPago: Omit<FormaPago, 'id'>): Promise<FormaPago> {
    return this.api.post<FormaPago>('/formas-pago', formaPago);
  }

  async actualizarFormaPago(id: number | string, formaPago: Partial<FormaPago>): Promise<FormaPago> {
    return this.api.patch<FormaPago>(`/formas-pago/${id}`, formaPago);
  }

  async eliminarFormaPago(id: number | string): Promise<void> {
    return this.api.delete<void>(`/formas-pago/${id}`);
  }
}