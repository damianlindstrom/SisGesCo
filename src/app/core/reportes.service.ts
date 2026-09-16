import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ReporteImpositivo, ResultadoPeriodo } from './models/reportes.model';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  constructor(private api: ApiService) {}

  reporteImpositivo(impuestoId: number, desde: string, hasta: string): Promise<ReporteImpositivo> {
    return this.api.get<ReporteImpositivo>('/reportes/impositivo', {
      impuestoId, desde, hasta,
    });
  }

  resultadoPeriodo(desde: string, hasta: string): Promise<ResultadoPeriodo> {
    return this.api.get<ResultadoPeriodo>('/reportes/resultado-periodo', { desde, hasta });
  }
}
