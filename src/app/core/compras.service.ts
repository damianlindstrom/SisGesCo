import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ComprobanteCompra, ComprobanteCompraInput } from './models/comprobante-compra.model';
import { PagoCompraInput } from './models/pago-compra.model';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  constructor(private api: ApiService) {}

  registrarComprobante(datos: ComprobanteCompraInput): Promise<ComprobanteCompra> {
    return this.api.post<ComprobanteCompra>('/compras/comprobantes', datos);
  }

  comprobantesPendientes(proveedorId: number): Promise<ComprobanteCompra[]> {
    return this.api.get<ComprobanteCompra[]>(`/compras/comprobantes/pendientes/${proveedorId}`);
  }

  registrarPago(datos: PagoCompraInput): Promise<{ ok: true }> {
    return this.api.post('/compras/pagos', datos);
  }
}
