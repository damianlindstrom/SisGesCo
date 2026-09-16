import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Venta, VentaInput } from './models/venta.model';
import { MovimientoCC, CobroCCInput } from './models/movimiento-cc.model';
import { ResumenArqueo } from './models/arqueo.model';

@Injectable({ providedIn: 'root' })
export class VentasService {
  constructor(private api: ApiService) {}

  registrar(venta: VentaInput): Promise<Venta> {
    return this.api.post<Venta>('/ventas', venta);
  }

  cuentaCorriente(clienteId: number): Promise<MovimientoCC[]> {
    return this.api.get<MovimientoCC[]>(`/ventas/cuenta-corriente/${clienteId}`);
  }

  registrarCobro(cobro: CobroCCInput): Promise<MovimientoCC[]> {
    return this.api.post<MovimientoCC[]>('/ventas/cobros', cobro);
  }

  arqueo(desde: string, hasta: string): Promise<ResumenArqueo> {
    return this.api.get<ResumenArqueo>('/ventas/arqueo', { desde, hasta });
  }
}
